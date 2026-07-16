import { describe, expect, it } from "vitest";
import { toHtml } from "hast-util-to-html";
import { PasswordProtect, decryptAesGcm, sha256Hex } from "../src/transformer";
import { createCtx } from "./helpers";
import type { Root as HastRoot, Element } from "hast";
import { VFile } from "vfile";

const SYNTHETIC_SECRET = "synthetic-test-secret-value";
const SYNTHETIC_HASH = sha256Hex(SYNTHETIC_SECRET);
const SYNTHETIC_BODY = "Synthetic protected body content for unit tests.";

function createHastTree(text: string): HastRoot {
  return {
    type: "root",
    children: [
      {
        type: "element",
        tagName: "article",
        properties: {},
        children: [
          {
            type: "element",
            tagName: "p",
            properties: {},
            children: [{ type: "text", value: text }],
          },
        ],
      },
    ],
  };
}

async function runTransformer(
  tree: HastRoot,
  vfile: VFile,
  options: Parameters<typeof PasswordProtect>[0] = {},
) {
  const ctx = createCtx();
  const transformer = PasswordProtect(options);
  const plugins = transformer.htmlPlugins?.(ctx) ?? [];

  for (const pluginEntry of plugins) {
    const pluginFn = Array.isArray(pluginEntry) ? pluginEntry[0] : pluginEntry;
    const attacher = pluginFn as () => (tree: HastRoot, file: VFile) => void;
    const transform = attacher();
    await transform(tree, vfile);
  }

  return { tree, vfile };
}

function containerHtml(tree: HastRoot): string {
  return toHtml(tree);
}

describe("PasswordProtect transformer", () => {
  it("skips pages without password or passwordHash", async () => {
    const tree = createHastTree("Hello world");
    const vfile = new VFile("");
    vfile.data = { frontmatter: { title: "Public Page" } };

    await runTransformer(tree, vfile);

    const article = tree.children[0] as Element;
    expect(article.tagName).toBe("article");
    expect((vfile.data as Record<string, unknown>).encrypted).toBeUndefined();
  });

  it("encrypts pages with password frontmatter (plain mode)", async () => {
    const tree = createHastTree(SYNTHETIC_BODY);
    const vfile = new VFile("");
    vfile.data = { frontmatter: { title: "Secret Page", password: SYNTHETIC_SECRET } };

    await runTransformer(tree, vfile);

    const container = tree.children[0] as Element;
    expect(container.tagName).toBe("div");
    expect((container.properties?.className as string[]) ?? []).toContain("password-protect-page");
    expect(container.properties?.["data-key-mode"]).toBe("password");
    expect(typeof container.properties?.["data-encrypted"]).toBe("string");
    expect(container.properties?.["data-iterations"]).toBe("600000");

    expect((vfile.data as Record<string, unknown>).encrypted).toBe(true);
    expect((vfile.data as Record<string, unknown>).text).toBe("");
    expect((vfile.data as Record<string, unknown>).description).toBe("");
  });

  it("encrypts pages with passwordHash frontmatter (hash mode)", async () => {
    const tree = createHastTree(SYNTHETIC_BODY);
    const vfile = new VFile("");
    vfile.data = { frontmatter: { title: "Secret Page", passwordHash: SYNTHETIC_HASH } };

    await runTransformer(tree, vfile);

    const container = tree.children[0] as Element;
    expect(container.properties?.["data-key-mode"]).toBe("passwordHash");
    expect((vfile.data as Record<string, unknown>).passwordProtectMode).toBe("passwordHash");
  });

  it("prefers passwordHash when both fields are present", async () => {
    const tree = createHastTree(SYNTHETIC_BODY);
    const vfile = new VFile("");
    vfile.data = {
      frontmatter: {
        title: "Secret Page",
        password: "plain-value",
        passwordHash: SYNTHETIC_HASH,
      },
    };

    await runTransformer(tree, vfile);

    const container = tree.children[0] as Element;
    expect(container.properties?.["data-key-mode"]).toBe("passwordHash");

    const encryptedData = container.properties?.["data-encrypted"] as string;
    const decrypted = decryptAesGcm(encryptedData, SYNTHETIC_HASH, 600_000);
    expect(decrypted).toContain(SYNTHETIC_BODY);
  });

  it("roundtrips password mode encryption", async () => {
    const tree = createHastTree(SYNTHETIC_BODY);
    const vfile = new VFile("");
    vfile.data = { frontmatter: { title: "Test", password: SYNTHETIC_SECRET } };

    await runTransformer(tree, vfile);

    const container = tree.children[0] as Element;
    const encryptedData = container.properties?.["data-encrypted"] as string;
    const decrypted = decryptAesGcm(encryptedData, SYNTHETIC_SECRET, 600_000);
    expect(decrypted).toContain(SYNTHETIC_BODY);
  });

  it("roundtrips passwordHash mode encryption using digest material", async () => {
    const tree = createHastTree(SYNTHETIC_BODY);
    const vfile = new VFile("");
    vfile.data = { frontmatter: { title: "Test", passwordHash: SYNTHETIC_HASH } };

    await runTransformer(tree, vfile);

    const container = tree.children[0] as Element;
    const encryptedData = container.properties?.["data-encrypted"] as string;
    const decrypted = decryptAesGcm(encryptedData, SYNTHETIC_HASH, 600_000);
    expect(decrypted).toContain(SYNTHETIC_BODY);
  });

  it("fails to decrypt with wrong password in plain mode", async () => {
    const tree = createHastTree(SYNTHETIC_BODY);
    const vfile = new VFile("");
    vfile.data = { frontmatter: { title: "Test", password: SYNTHETIC_SECRET } };

    await runTransformer(tree, vfile);

    const container = tree.children[0] as Element;
    const encryptedData = container.properties?.["data-encrypted"] as string;

    expect(() => decryptAesGcm(encryptedData, "wrong-password", 600_000)).toThrow();
  });

  it("fails to decrypt with wrong digest in hash mode", async () => {
    const tree = createHastTree(SYNTHETIC_BODY);
    const vfile = new VFile("");
    vfile.data = { frontmatter: { title: "Test", passwordHash: SYNTHETIC_HASH } };

    await runTransformer(tree, vfile);

    const container = tree.children[0] as Element;
    const encryptedData = container.properties?.["data-encrypted"] as string;
    const wrongDigest = sha256Hex("wrong-password");

    expect(() => decryptAesGcm(encryptedData, wrongDigest, 600_000)).toThrow();
  });

  it("does not leak hash, key, verifier, or plaintext in generated container HTML", async () => {
    const tree = createHastTree(SYNTHETIC_BODY);
    const vfile = new VFile("");
    vfile.data = { frontmatter: { title: "Test", passwordHash: SYNTHETIC_HASH } };

    await runTransformer(tree, vfile);

    const html = containerHtml(tree);
    expect(html).not.toContain(SYNTHETIC_HASH);
    expect(html).not.toContain(SYNTHETIC_SECRET);
    expect(html).not.toContain(SYNTHETIC_BODY);
    expect(html).not.toMatch(/data-hash|data-password|data-verifier|data-key=/i);
  });

  it("scrubs password and passwordHash from frontmatter after encryption", async () => {
    const tree = createHastTree(SYNTHETIC_BODY);
    const vfile = new VFile("");
    vfile.data = {
      frontmatter: {
        title: "Test",
        password: SYNTHETIC_SECRET,
        passwordHash: SYNTHETIC_HASH,
      },
    };

    await runTransformer(tree, vfile);

    const frontmatter = (vfile.data as Record<string, unknown>).frontmatter as Record<
      string,
      unknown
    >;
    expect(frontmatter.password).toBeUndefined();
    expect(frontmatter.passwordHash).toBeUndefined();
  });

  it("marks encrypted pages as unlisted when unlistWhenEncrypted is true", async () => {
    const tree = createHastTree(SYNTHETIC_BODY);
    const vfile = new VFile("");
    vfile.data = { frontmatter: { title: "Test", passwordHash: SYNTHETIC_HASH } };

    await runTransformer(tree, vfile, { unlistWhenEncrypted: true });

    expect((vfile.data as Record<string, unknown>).unlisted).toBe(true);
  });

  it("supports stealth pages", async () => {
    const tree = createHastTree(SYNTHETIC_BODY);
    const vfile = new VFile("");
    vfile.data = {
      frontmatter: { title: "Test", passwordHash: SYNTHETIC_HASH, stealth: true },
    };

    await runTransformer(tree, vfile);

    expect((vfile.data as Record<string, unknown>).stealth).toBe(true);
    expect((vfile.data as Record<string, unknown>).unlisted).toBe(true);
  });

  it("ignores invalid passwordHash values", async () => {
    const tree = createHastTree(SYNTHETIC_BODY);
    const vfile = new VFile("");
    vfile.data = { frontmatter: { title: "Test", passwordHash: "not-a-valid-sha256" } };

    await runTransformer(tree, vfile);

    const article = tree.children[0] as Element;
    expect(article.tagName).toBe("article");
    expect((vfile.data as Record<string, unknown>).encrypted).toBeUndefined();
  });
});
