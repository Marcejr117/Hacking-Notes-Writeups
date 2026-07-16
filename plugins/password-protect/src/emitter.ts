import path from "node:path";
import fs from "node:fs/promises";
import type { Root, Element } from "hast";
import type {
  BuildCtx,
  FilePath,
  ProcessedContent,
  QuartzEmitterPlugin,
} from "@quartz-community/types";
import { joinSegments } from "@quartz-community/types";
import { encryptAesGcm } from "./util/crypto";
import type { PasswordKeyMode, PasswordProtectContentIndexOptions } from "./types";

export const SHADOW_INDEX_VERSION = 1 as const;

const defaultOptions: PasswordProtectContentIndexOptions = {
  outputPath: "static/passwordProtectContentIndex.json",
  passwordField: "password",
  passwordHashField: "passwordHash",
};

export interface ShadowIndexBlob {
  ciphertext: string;
  iterations: number;
  keyMode: PasswordKeyMode;
}

export interface ShadowIndexFile {
  version: typeof SHADOW_INDEX_VERSION;
  entries: ShadowIndexBlob[];
}

export interface ShadowContentIndexEntry {
  slug: string;
  entry: {
    slug: string;
    filePath: string;
    title: string;
    links: string[];
    tags: string[];
    content: string;
    description: string;
  };
}

function buildShadowEntry(data: Record<string, unknown>): ShadowContentIndexEntry | null {
  const slug = data.slug;
  if (typeof slug !== "string" || slug.length === 0) return null;

  const frontmatter = (data.frontmatter as Record<string, unknown> | undefined) ?? {};
  const title = typeof frontmatter.title === "string" ? frontmatter.title : "";
  const tags = Array.isArray(frontmatter.tags)
    ? (frontmatter.tags as unknown[]).filter((t): t is string => typeof t === "string")
    : [];

  const links = Array.isArray(data.links)
    ? (data.links as unknown[]).filter((l): l is string => typeof l === "string")
    : [];

  const filePath = typeof data.relativePath === "string" ? data.relativePath : "";

  return {
    slug,
    entry: {
      slug,
      filePath,
      title,
      links,
      tags,
      content: "",
      description: "",
    },
  };
}

export const PasswordProtectContentIndex: QuartzEmitterPlugin<
  Partial<PasswordProtectContentIndexOptions>
> = (userOptions?: Partial<PasswordProtectContentIndexOptions>) => {
  const options = { ...defaultOptions, ...userOptions };

  const emitAll = async (ctx: BuildCtx, content: ProcessedContent[]): Promise<FilePath[]> => {
    const entries: ShadowIndexBlob[] = [];

    for (const [tree, file] of content) {
      const data = (file.data ?? {}) as Record<string, unknown>;
      if (data.encrypted !== true) continue;
      if (data.unlisted !== true) continue;
      if (data.stealth === true) continue;

      const secretMaterial = data.passwordProtectMaterial;
      const keyMode = data.passwordProtectMode;
      if (typeof secretMaterial !== "string" || secretMaterial.length === 0) continue;
      if (keyMode !== "password" && keyMode !== "passwordHash") continue;

      const iterations = extractIterationsFromTree(tree as Root);
      const shadowEntry = buildShadowEntry(data);
      if (!shadowEntry) continue;

      const plaintext = JSON.stringify(shadowEntry);
      const ciphertext = encryptAesGcm(plaintext, secretMaterial, iterations);

      entries.push({
        ciphertext,
        iterations,
        keyMode,
      });
    }

    const shadowFile: ShadowIndexFile = {
      version: SHADOW_INDEX_VERSION,
      entries,
    };

    const outputPath = joinSegments(ctx.argv.output, options.outputPath) as FilePath;
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(shadowFile));

    return [outputPath];
  };

  return {
    name: "PasswordProtectContentIndex",
    emit: emitAll,
    partialEmit: emitAll,
  };
};

function extractIterationsFromTree(tree: Root): number {
  for (const child of tree.children ?? []) {
    if (child.type !== "element") continue;
    const el = child as Element;
    const props = el.properties ?? {};
    const dataIterations = props["data-iterations"];
    if (typeof dataIterations === "string") {
      const parsed = parseInt(dataIterations, 10);
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    }
    if (typeof dataIterations === "number" && dataIterations > 0) return dataIterations;
  }
  return 600_000;
}
