import type { PluggableList, Plugin } from "unified";
import type { Root as HastRoot, Element, ElementContent } from "hast";
import type { VFile } from "vfile";
import { toHtml } from "hast-util-to-html";
import type { QuartzTransformerPlugin } from "@quartz-community/types";
import type { PasswordProtectOptions } from "./types";
import { encryptAesGcm, resolveProtection, scrubSensitiveFrontmatter } from "./util/crypto";

const defaultOptions: PasswordProtectOptions = {
  iterations: 600_000,
  passwordField: "password",
  passwordHashField: "passwordHash",
  unlistWhenEncrypted: false,
};

const rehypePasswordProtect = (options: PasswordProtectOptions): Plugin<[], HastRoot> => {
  return () => (tree: HastRoot, file: VFile) => {
    const frontmatter = (file.data?.frontmatter ?? {}) as Record<string, unknown>;
    const protection = resolveProtection(
      frontmatter,
      options.passwordField,
      options.passwordHashField,
    );

    if (!protection) {
      return;
    }

    const html = toHtml(tree, { allowDangerousHtml: true });
    const encryptedData = encryptAesGcm(html, protection.secretMaterial, options.iterations);

    const encryptedContainer: Element = {
      type: "element",
      tagName: "div",
      properties: {
        className: ["password-protect-page", "popover-hint"],
        "data-encrypted": encryptedData,
        "data-iterations": String(options.iterations),
        "data-key-mode": protection.mode,
      },
      children: [],
    };

    tree.children = [encryptedContainer as ElementContent];

    const data = file.data as Record<string, unknown>;
    data.encrypted = true;
    data.passwordProtectMode = protection.mode;
    data.passwordProtectMaterial = protection.secretMaterial;
    data.text = "";
    data.description = "";

    scrubSensitiveFrontmatter(frontmatter, options.passwordField, options.passwordHashField);

    const frontmatterUnlisted = frontmatter.unlisted;
    if (typeof frontmatterUnlisted === "boolean") {
      data.unlisted = frontmatterUnlisted;
    } else if (options.unlistWhenEncrypted) {
      data.unlisted = true;
    }

    if (frontmatter.stealth === true) {
      data.stealth = true;
      data.unlisted = true;
    }
  };
};

export const PasswordProtect: QuartzTransformerPlugin<Partial<PasswordProtectOptions>> = (
  userOptions?: Partial<PasswordProtectOptions>,
) => {
  const options = { ...defaultOptions, ...userOptions };
  return {
    name: "PasswordProtect",
    htmlPlugins(): PluggableList {
      return [rehypePasswordProtect(options)];
    },
  };
};

export { encryptAesGcm, decryptAesGcm, sha256Hex, resolveProtection } from "./util/crypto";
