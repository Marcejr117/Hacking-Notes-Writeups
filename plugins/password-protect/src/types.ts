export type {
  BuildCtx,
  ChangeEvent,
  CSSResource,
  JSResource,
  ProcessedContent,
  QuartzEmitterPlugin,
  QuartzEmitterPluginInstance,
  QuartzFilterPlugin,
  QuartzFilterPluginInstance,
  QuartzPluginData,
  QuartzTransformerPlugin,
  QuartzTransformerPluginInstance,
  StaticResources,
  PageMatcher,
  PageGenerator,
  VirtualPage,
  QuartzPageTypePlugin,
  QuartzPageTypePluginInstance,
} from "@quartz-community/types";

export type PasswordKeyMode = "password" | "passwordHash";

export interface PasswordProtectOptions {
  /**
   * PBKDF2 iteration count for key derivation.
   *
   * @default 600_000
   */
  iterations: number;

  /**
   * Frontmatter field for a plain-text page password.
   *
   * @default "password"
   */
  passwordField: string;

  /**
   * Frontmatter field for a SHA-256 hex digest of the visitor password.
   *
   * @default "passwordHash"
   */
  passwordHashField: string;

  /**
   * When true, protected pages are marked unlisted unless frontmatter overrides.
   *
   * @default false
   */
  unlistWhenEncrypted: boolean;
}

export interface PasswordProtectContentIndexOptions {
  /**
   * Output path for the shadow content index, relative to the Quartz output directory.
   *
   * @default "static/passwordProtectContentIndex.json"
   */
  outputPath: string;

  /**
   * Frontmatter field for plain-text passwords.
   *
   * @default "password"
   */
  passwordField: string;

  /**
   * Frontmatter field for SHA-256 hex digests.
   *
   * @default "passwordHash"
   */
  passwordHashField: string;
}
