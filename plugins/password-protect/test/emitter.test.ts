import { describe, expect, it, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import type { Root as HastRoot, Element } from "hast";
import { VFile } from "vfile";
import { PasswordProtectContentIndex, SHADOW_INDEX_VERSION } from "../src/emitter";
import type { ShadowIndexFile, ShadowContentIndexEntry } from "../src/emitter";
import { decryptAesGcm, sha256Hex } from "../src/transformer";
import { createCtx } from "./helpers";
import type { ProcessedContent } from "@quartz-community/types";
import type { PasswordKeyMode } from "../src/types";

const SYNTHETIC_SECRET = "synthetic-shadow-secret";
const SYNTHETIC_HASH = sha256Hex(SYNTHETIC_SECRET);

function makeEncryptedContent(
  slug: string,
  opts: {
    mode?: PasswordKeyMode;
    secret?: string;
    unlisted?: boolean;
    stealth?: boolean;
    title?: string;
    tags?: string[];
    links?: string[];
    iterations?: number;
  } = {},
): ProcessedContent {
  const mode = opts.mode ?? "passwordHash";
  const secret = opts.secret ?? (mode === "passwordHash" ? SYNTHETIC_HASH : SYNTHETIC_SECRET);

  const tree: HastRoot = {
    type: "root",
    children: [
      {
        type: "element",
        tagName: "div",
        properties: {
          className: ["password-protect-page", "popover-hint"],
          "data-encrypted": "opaque-ciphertext",
          "data-iterations": String(opts.iterations ?? 600_000),
          "data-key-mode": mode,
        },
        children: [],
      } as Element,
    ],
  };

  const vfile = new VFile("");
  const frontmatter: Record<string, unknown> = {
    title: opts.title ?? slug,
    tags: opts.tags ?? [],
  };

  if (mode === "passwordHash") {
    frontmatter.passwordHash = secret;
  } else {
    frontmatter.password = secret;
  }

  const data: Record<string, unknown> = {
    slug,
    relativePath: `${slug}.md`,
    encrypted: true,
    unlisted: opts.unlisted ?? true,
    text: "",
    description: "",
    links: opts.links ?? [],
    frontmatter,
    passwordProtectMode: mode,
    passwordProtectMaterial: secret,
  };
  if (opts.stealth) data.stealth = true;
  vfile.data = data;

  return [tree, vfile];
}

describe("PasswordProtectContentIndex emitter", () => {
  let outputDir: string;

  beforeEach(async () => {
    outputDir = await fs.mkdtemp(path.join(os.tmpdir(), "pwd-protect-emitter-test-"));
  });

  afterEach(async () => {
    await fs.rm(outputDir, { recursive: true, force: true });
  });

  async function runEmitter(content: ProcessedContent[]): Promise<ShadowIndexFile> {
    const ctx = createCtx({ argv: { output: outputDir } });
    const emitter = PasswordProtectContentIndex();
    const paths = await emitter.emit(ctx, content, { css: [], js: [], additionalHead: [] });
    expect(Array.isArray(paths)).toBe(true);
    const outputs = paths as string[];
    expect(outputs).toHaveLength(1);
    expect(outputs[0]).toMatch(/passwordProtectContentIndex\.json$/);
    const raw = await fs.readFile(outputs[0]!, "utf8");
    expect(raw).not.toContain(SYNTHETIC_HASH);
    expect(raw).not.toContain(SYNTHETIC_SECRET);
    return JSON.parse(raw) as ShadowIndexFile;
  }

  it("emits a versioned JSON file with keyMode metadata", async () => {
    const content = [makeEncryptedContent("secret/page-a")];
    const shadow = await runEmitter(content);

    expect(shadow.version).toBe(SHADOW_INDEX_VERSION);
    expect(shadow.entries).toHaveLength(1);
    expect(shadow.entries[0]!.keyMode).toBe("passwordHash");
  });

  it("roundtrips passwordHash shadow entries", async () => {
    const content = [
      makeEncryptedContent("secret/page-a", {
        title: "Page A",
        tags: ["secret"],
        links: ["other/page"],
      }),
    ];
    const shadow = await runEmitter(content);

    const blob = shadow.entries[0]!;
    const plaintext = decryptAesGcm(blob.ciphertext, SYNTHETIC_HASH, blob.iterations);
    const decoded = JSON.parse(plaintext) as ShadowContentIndexEntry;

    expect(decoded.slug).toBe("secret/page-a");
    expect(decoded.entry.title).toBe("Page A");
    expect(decoded.entry.content).toBe("");
  });

  it("roundtrips plain password shadow entries", async () => {
    const content = [makeEncryptedContent("secret/plain", { mode: "password" })];
    const shadow = await runEmitter(content);

    const blob = shadow.entries[0]!;
    expect(blob.keyMode).toBe("password");
    const plaintext = decryptAesGcm(blob.ciphertext, SYNTHETIC_SECRET, blob.iterations);
    const decoded = JSON.parse(plaintext) as ShadowContentIndexEntry;
    expect(decoded.slug).toBe("secret/plain");
  });

  it("skips non-unlisted and stealth pages", async () => {
    const content = [
      makeEncryptedContent("secret/a", { unlisted: false }),
      makeEncryptedContent("secret/b", { stealth: true }),
    ];
    const shadow = await runEmitter(content);
    expect(shadow.entries).toHaveLength(0);
  });
});
