// @ts-nocheck
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

const PASSWORDS_KEY = "password-protect-passwords";
const DECRYPTED_ENTRIES_KEY = "password-protect:decryptedShadowEntries";
const SHADOW_INDEX_VERSION = 1;
const SHADOW_INDEX_FILENAME = "passwordProtectContentIndex.json";

function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function sha256Hex(input) {
  const enc = new TextEncoder();
  const hash = await window.crypto.subtle.digest("SHA-256", enc.encode(input));
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function deriveKey(secretMaterial, salt, iterations) {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(secretMaterial),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
}

async function resolveSecretMaterial(keyMode, userInput) {
  if (keyMode === "passwordHash") {
    return sha256Hex(userInput);
  }
  return userInput;
}

async function decryptContent(encryptedBase64, secretMaterial, iterations) {
  const data = base64ToBuffer(encryptedBase64);

  const salt = data.slice(0, SALT_LENGTH);
  const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = data.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = data.slice(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

  const ciphertextWithTag = new Uint8Array(ciphertext.length + authTag.length);
  ciphertextWithTag.set(ciphertext, 0);
  ciphertextWithTag.set(authTag, ciphertext.length);

  const aesKey = await deriveKey(secretMaterial, salt, iterations);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    aesKey,
    ciphertextWithTag,
  );

  return new TextDecoder().decode(decrypted);
}

function getCachedPasswords() {
  try {
    const raw = sessionStorage.getItem(PASSWORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function cachePassword(password) {
  const passwords = getCachedPasswords();
  if (!passwords.includes(password)) {
    passwords.push(password);
    sessionStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
  }
}

function getDecryptedShadowEntries() {
  try {
    const raw = sessionStorage.getItem(DECRYPTED_ENTRIES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function storeDecryptedShadowEntries(entries) {
  try {
    sessionStorage.setItem(DECRYPTED_ENTRIES_KEY, JSON.stringify(entries));
  } catch {
    // sessionStorage quota - fail silently
  }
}

function showError(container, message) {
  const errorEl = container.querySelector(".password-protect-error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }
}

function hideError(container) {
  const errorEl = container.querySelector(".password-protect-error");
  if (errorEl) {
    errorEl.style.display = "none";
    errorEl.textContent = "";
  }
}

function setLoading(container, loading) {
  const button = container.querySelector(".password-protect-submit");
  const input = container.querySelector(".password-protect-input");
  if (button) {
    button.disabled = loading;
    button.textContent = loading ? "Decrypting\u2026" : "Unlock \uD83D\uDC80";
  }
  if (input) {
    input.disabled = loading;
  }
}

function resolveShadowIndexPath() {
  const scripts = document.querySelectorAll("script");
  for (const script of scripts) {
    const text = script.textContent ?? "";
    const match = text.match(/fetch\(["']([^"']+contentIndex\.json)["']\)/);
    if (match) {
      return match[1].replace(/contentIndex\.json$/, SHADOW_INDEX_FILENAME);
    }
  }
  return new URL(`static/${SHADOW_INDEX_FILENAME}`, document.baseURI).toString();
}

let shadowIndexPromise = null;
async function fetchShadowIndex() {
  if (shadowIndexPromise) return shadowIndexPromise;
  const url = resolveShadowIndexPath();
  shadowIndexPromise = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`shadow index HTTP ${r.status}`);
      return r.json();
    })
    .then((data) => {
      if (!data || data.version !== SHADOW_INDEX_VERSION || !Array.isArray(data.entries)) {
        return { version: SHADOW_INDEX_VERSION, entries: [] };
      }
      return data;
    })
    .catch(() => ({ version: SHADOW_INDEX_VERSION, entries: [] }));
  return shadowIndexPromise;
}

async function decryptShadowEntries(shadowFile, passwords, alreadyDecrypted) {
  const patch = {};
  const newDecrypted = { ...alreadyDecrypted };
  let changed = false;

  for (let i = 0; i < shadowFile.entries.length; i++) {
    const key = String(i);
    if (alreadyDecrypted[key]) {
      const cached = alreadyDecrypted[key];
      if (cached && cached.slug) {
        patch[cached.slug] = cached.entry;
      }
      continue;
    }

    const blob = shadowFile.entries[i];
    if (!blob || typeof blob.ciphertext !== "string") continue;

    const keyMode = blob.keyMode === "passwordHash" ? "passwordHash" : "password";

    for (const userInput of passwords) {
      try {
        const secretMaterial = await resolveSecretMaterial(keyMode, userInput);
        const plaintext = await decryptContent(blob.ciphertext, secretMaterial, blob.iterations);
        const decoded = JSON.parse(plaintext);
        if (decoded && typeof decoded.slug === "string" && decoded.entry) {
          patch[decoded.slug] = decoded.entry;
          newDecrypted[key] = decoded;
          changed = true;
        }
        break;
      } catch {
        // try next password
      }
    }
  }

  if (changed) {
    storeDecryptedShadowEntries(newDecrypted);
  }

  return patch;
}

async function applyShadowPatches(patch) {
  const slugs = Object.keys(patch);
  if (slugs.length === 0) return;

  try {
    const base = await (typeof fetchData !== "undefined" ? fetchData : Promise.resolve(null));
    if (!base || typeof base !== "object") return;
    const root = base.content && typeof base.content === "object" ? base.content : base;
    for (const slug of slugs) {
      if (!(slug in root)) {
        root[slug] = patch[slug];
      }
    }
  } catch {
    return;
  }

  document.dispatchEvent(new CustomEvent("content-index-updated", { detail: { slugs } }));
  document.dispatchEvent(new CustomEvent("render"));
}

let shadowUnlockInFlight = false;
async function tryUnlockShadowIndex() {
  if (shadowUnlockInFlight) return;
  const passwords = getCachedPasswords();
  if (passwords.length === 0) return;

  shadowUnlockInFlight = true;
  try {
    const shadowFile = await fetchShadowIndex();
    if (!shadowFile.entries || shadowFile.entries.length === 0) return;
    const alreadyDecrypted = getDecryptedShadowEntries();
    const patch = await decryptShadowEntries(shadowFile, passwords, alreadyDecrypted);
    await applyShadowPatches(patch);
  } finally {
    shadowUnlockInFlight = false;
  }
}

async function attemptDecrypt(container, userInput) {
  const encryptedData = container.getAttribute("data-encrypted");
  const iterations = parseInt(container.getAttribute("data-iterations") || "600000", 10);
  const keyMode =
    container.getAttribute("data-key-mode") === "passwordHash" ? "passwordHash" : "password";

  if (!encryptedData) return false;

  try {
    const secretMaterial = await resolveSecretMaterial(keyMode, userInput);
    const html = await decryptContent(encryptedData, secretMaterial, iterations);

    const parent = container.parentElement;
    if (parent) {
      const temp = document.createElement("div");
      temp.innerHTML = html;
      container.replaceWith(...temp.childNodes);
    }

    cachePassword(userInput);
    document.dispatchEvent(new CustomEvent("render"));
    tryUnlockShadowIndex();

    return true;
  } catch {
    return false;
  }
}

function buildModal(container) {
  const overlay = document.createElement("div");
  overlay.className = "password-protect-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "password-protect-title");

  overlay.innerHTML = [
    '<div class="password-protect-modal">',
    '<button type="button" class="password-protect-close" aria-label="Close password dialog">&times;</button>',
    '<p id="password-protect-title" class="password-protect-title">\uD83D\uDD25This page is password protected\uD83D\uDD25</p>',
    '<label class="sr-only" for="password-protect-input">Password</label>',
    '<input id="password-protect-input" class="password-protect-input" type="password" autocomplete="current-password" placeholder="Enter NTLM hash or Root&#39;s shadow hash\uD83D\uDD11" />',
    '<button type="button" class="password-protect-submit">Unlock \uD83D\uDC80</button>',
    '<p class="password-protect-error" role="alert" aria-live="polite" style="display:none"></p>',
    "</div>",
  ].join("");

  container.appendChild(overlay);

  const input = overlay.querySelector(".password-protect-input");
  const button = overlay.querySelector(".password-protect-submit");
  const closeBtn = overlay.querySelector(".password-protect-close");

  async function handleSubmit() {
    const password = input?.value?.trim();
    if (!password) {
      showError(overlay, "Please enter a password");
      return;
    }

    hideError(overlay);
    setLoading(overlay, true);

    const success = await attemptDecrypt(container, password);

    if (!success) {
      setLoading(overlay, false);
      showError(overlay, "Incorrect password");
      if (input) {
        input.value = "";
        input.focus();
      }
    }
  }

  if (button) {
    button.addEventListener("click", handleSubmit);
  }

  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      overlay.style.display = "none";
      hideError(overlay);
      if (input) input.value = "";
    });
  }

  overlay.addEventListener("click", (ev) => {
    if (ev.target === overlay) {
      overlay.style.display = "none";
      hideError(overlay);
      if (input) input.value = "";
    }
  });

  return { input, handleSubmit };
}

function init() {
  const containers = document.querySelectorAll(".password-protect-page");
  if (containers.length === 0) {
    tryUnlockShadowIndex();
    return;
  }

  for (const container of containers) {
    if (container.querySelector(".password-protect-overlay")) continue;

    const encryptedData = container.getAttribute("data-encrypted");
    if (!encryptedData) continue;

    const { handleSubmit } = buildModal(container);

    const cached = getCachedPasswords();
    if (cached.length > 0) {
      (async () => {
        for (const pw of cached) {
          const success = await attemptDecrypt(container, pw);
          if (success) return;
        }
      })();
    } else if (handleSubmit) {
      const input = container.querySelector(".password-protect-input");
      if (input) input.focus();
    }
  }

  tryUnlockShadowIndex();
}

document.addEventListener("nav", () => {
  init();
});

document.addEventListener("render", () => {
  const containers = document.querySelectorAll(".password-protect-page");
  if (containers.length > 0) {
    init();
  }
});

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (!(node instanceof HTMLElement)) continue;
      const containers = node.classList?.contains("password-protect-page")
        ? [node]
        : [...node.querySelectorAll(".password-protect-page")];
      const uninitialized = containers.filter((c) => !c.querySelector(".password-protect-overlay"));
      if (uninitialized.length > 0) {
        init();
        return;
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });
