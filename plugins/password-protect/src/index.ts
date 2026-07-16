export {
  PasswordProtect,
  encryptAesGcm,
  decryptAesGcm,
  sha256Hex,
  resolveProtection,
} from "./transformer";
export { PasswordProtectContentIndex, SHADOW_INDEX_VERSION } from "./emitter";
export { default as PasswordProtectPage } from "./components/PasswordProtectPage";

export type {
  PasswordProtectOptions,
  PasswordProtectContentIndexOptions,
  PasswordKeyMode,
} from "./types";

export type { ShadowIndexBlob, ShadowIndexFile, ShadowContentIndexEntry } from "./emitter";

export type { PasswordProtectPageComponentOptions } from "./components/PasswordProtectPage";

export type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
  StringResource,
  QuartzTransformerPlugin,
  QuartzFilterPlugin,
  QuartzEmitterPlugin,
  QuartzPageTypePlugin,
  QuartzPageTypePluginInstance,
  PageMatcher,
  PageGenerator,
  VirtualPage,
} from "@quartz-community/types";
