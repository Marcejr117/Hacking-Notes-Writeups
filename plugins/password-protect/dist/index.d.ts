import { QuartzTransformerPlugin, QuartzEmitterPlugin } from '@quartz-community/types';
export { PageGenerator, PageMatcher, QuartzComponent, QuartzComponentConstructor, QuartzComponentProps, QuartzEmitterPlugin, QuartzFilterPlugin, QuartzPageTypePlugin, QuartzPageTypePluginInstance, QuartzTransformerPlugin, StringResource, VirtualPage } from '@quartz-community/types';
import { PasswordProtectOptions, PasswordProtectContentIndexOptions, PasswordKeyMode as PasswordKeyMode$1 } from './types.js';
export { _ as PasswordProtectPage, P as PasswordProtectPageComponentOptions } from './index-D7HSENak.js';

type PasswordKeyMode = "password" | "passwordHash";
interface ResolvedProtection {
    mode: PasswordKeyMode;
    secretMaterial: string;
}
declare function sha256Hex(input: string): string;
declare function resolveProtection(frontmatter: Record<string, unknown>, passwordField: string, passwordHashField: string): ResolvedProtection | null;
declare function encryptAesGcm(plaintext: string, secretMaterial: string, iterations: number): string;
declare function decryptAesGcm(encryptedBase64: string, secretMaterial: string, iterations: number): string;

declare const PasswordProtect: QuartzTransformerPlugin<Partial<PasswordProtectOptions>>;

declare const SHADOW_INDEX_VERSION: 1;
interface ShadowIndexBlob {
    ciphertext: string;
    iterations: number;
    keyMode: PasswordKeyMode$1;
}
interface ShadowIndexFile {
    version: typeof SHADOW_INDEX_VERSION;
    entries: ShadowIndexBlob[];
}
interface ShadowContentIndexEntry {
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
declare const PasswordProtectContentIndex: QuartzEmitterPlugin<Partial<PasswordProtectContentIndexOptions>>;

export { PasswordKeyMode$1 as PasswordKeyMode, PasswordProtect, PasswordProtectContentIndex, PasswordProtectContentIndexOptions, PasswordProtectOptions, SHADOW_INDEX_VERSION, type ShadowContentIndexEntry, type ShadowIndexBlob, type ShadowIndexFile, decryptAesGcm, encryptAesGcm, resolveProtection, sha256Hex };
