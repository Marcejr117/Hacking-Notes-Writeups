# Password Protect (Quartz 5)

Local Quartz plugin that password-protects individual pages using AES-256-GCM and PBKDF2-SHA256.

## Frontmatter

- `password` — plain visitor password (used directly for key derivation)
- `passwordHash` — SHA-256 hex digest of the visitor password (build uses digest; client hashes input first)

## Install (monorepo)

```yaml
plugins:
  - source: ./plugins/password-protect
    transformers:
      - PasswordProtect
    emitters:
      - PasswordProtectContentIndex
    components:
      - PasswordProtectPage
```

## Development

```bash
cd plugins/password-protect
npm install
npm run check
npm run build
```
