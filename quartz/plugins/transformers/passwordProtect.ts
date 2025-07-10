import { QuartzTransformerPlugin } from "../types"
import { Root as HtmlRoot } from "hast"
import { toHtml } from "hast-util-to-html"
import { h } from "hastscript"
import CryptoJS from "crypto-js"

/**
 * PasswordProtect transformer
 *
 * If the note's front-matter contains a `password` field (string),
 * the generated HTML will be encrypted with AES and replaced by a
 * password prompt.  Decryption happens completely client-side.
 */
export const PasswordProtect: QuartzTransformerPlugin = () => {
  return {
    name: "PasswordProtect",

    htmlPlugins() {
      // An HTML-level rehype plugin that runs after the MD → HTML pipeline
      return [
        () => {
          return async (tree: HtmlRoot, file) => {
            const plainPwd = file.data.frontmatter?.password as string | undefined
            const hashFromFm = file.data.frontmatter?.passwordHash as string | undefined

            const keyHash = hashFromFm ?? (plainPwd ? CryptoJS.SHA256(plainPwd).toString() : undefined)
            if (!keyHash) return // no protection configured

            // Serialize current HTML
            const originalHtml = toHtml(tree, { allowDangerousHtml: true })
            // Encrypt with AES using hash as key
            const cipher = CryptoJS.AES.encrypt(originalHtml, keyHash).toString()

            // Build replacement DOM: prompt + hidden container + scripts
            const promptDiv = h("div", { id: "pwd-prompt", "data-cipher": cipher, "data-hash": keyHash }, [
              h("p", "Esta página está protegida por contraseña"),
              h("input", {
                id: "pwd-input",
                type: "password",
                placeholder: "Contraseña…",
              }),
              h("button", { id: "pwd-btn", type: "button" }, "Desbloquear"),
              h("p", { id: "pwd-error", style: "color:red;" }),
            ])

            const contentDiv = h("div", {
              id: "protected-content",
              style: "display:none;",
            })

            // External CryptoJS library (served via CDN)
            const cryptoJsScript = h("script", {
              src: "https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js",
              defer: true,
            })

            // Global helper that attaches listeners; registers on first run and on every SPA nav
            const mainScript = h(
              "script",
              {},
              `
              (function () {
                function attachHandlers() {
                  if (typeof CryptoJS === 'undefined') return;

                  document.querySelectorAll('#pwd-prompt').forEach(prompt => {
                    if (prompt.dataset.listenerAttached === 'true') return;
                    const input = prompt.querySelector('#pwd-input');
                    const btn = prompt.querySelector('#pwd-btn');
                    const errorEl = prompt.querySelector('#pwd-error');
                    const storedHash = prompt.dataset.hash || '';
                    const container = prompt.nextElementSibling; // assumes structure we generated

                    function decrypt() {
                      const pwd = input ? input.value.trim() : '';
                      const cipherText = prompt.dataset.cipher || '';
                      try {
                        const attemptHash = CryptoJS.SHA256(pwd).toString();
                        if (attemptHash !== storedHash) throw new Error('hash-mismatch');

                        const bytes = CryptoJS.AES.decrypt(cipherText, attemptHash);
                        const html = bytes.toString(CryptoJS.enc.Utf8);
                        if (!html) throw new Error('bad-decrypt');
                        if (container) {
                          container.innerHTML = html;
                          container.style.display = 'block';
                        }
                        prompt.style.display = 'none';
                      } catch (e) {
                        if (errorEl) errorEl.textContent = 'Contraseña incorrecta';
                      }
                      if (input) input.value = '';
                    }

                    btn?.addEventListener('click', decrypt);
                    window.addCleanup(() => btn?.removeEventListener('click', decrypt));

                    const keyListener = (ev) => {
                      if (ev.key === 'Enter') decrypt();
                    };
                    input?.addEventListener('keydown', keyListener);
                    window.addCleanup(() => input?.removeEventListener('keydown', keyListener));
                    prompt.dataset.listenerAttached = 'true';
                  });
                }

                function ensureCryptoJsAndAttach() {
                  if (typeof CryptoJS !== 'undefined') {
                    attachHandlers();
                  } else {
                    // Busca el script externo de CryptoJS
                    var script = document.querySelector('script[src*="crypto-js"]');
                    if (script) {
                      script.addEventListener('load', attachHandlers, { once: true });
                    } else {
                      // Si no está el script, intenta cargarlo manualmente
                      var newScript = document.createElement('script');
                      newScript.src = 'https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js';
                      newScript.defer = true;
                      newScript.addEventListener('load', attachHandlers, { once: true });
                      document.head.appendChild(newScript);
                    }
                  }
                }

                // first run after full load
                if (document.readyState === 'complete') {
                  ensureCryptoJsAndAttach();
                } else {
                  window.addEventListener('load', ensureCryptoJsAndAttach, { once: true });
                }
                // run on every SPA navigation
                document.addEventListener('nav', ensureCryptoJsAndAttach);
              })();
            `,
            )

            // Replace existing children
            tree.children = [promptDiv, contentDiv, cryptoJsScript, mainScript]
          }
        },
      ]
    },
    externalResources() {
      return {
        js: [
          {
            loadTime: "beforeDOMReady",
            contentType: "external",
            src: "https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js",
          },
        ],
      }
    },
  }
} 