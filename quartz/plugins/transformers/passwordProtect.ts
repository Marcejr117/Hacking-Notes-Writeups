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

            // Build replacement DOM: modal popup for password prompt
            const modalOverlay = h("div", {
              id: "pwd-modal-overlay",
              "data-cipher": cipher,
              "data-hash": keyHash,
              style: `
                position: fixed;
                top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(0,0,0,0.5);
                display: flex; align-items: center; justify-content: center;
                z-index: 9999;`
            }, [
              h("div", {
                id: "pwd-modal",
                style: `
                  background: #18171c;
                  color: #fff;
                  padding: 2rem 2.5rem 1.5rem 2.5rem;
                  border-radius: 12px;
                  box-shadow: 0 4px 32px rgba(0,0,0,0.25);
                  min-width: 320px;
                  max-width: 90vw;
                  display: flex;
                  flex-direction: column;
                  align-items: center;`
              }, [
                h("button", {
                  id: "pwd-modal-close",
                  type: "button",
                  style: `
                    position: absolute;
                    top: 1.5rem;
                    right: 2rem;
                    background: none;
                    border: none;
                    color: #fff;
                    font-size: 1.5rem;
                    cursor: pointer;`
                }, "×"),
                h("p", { style: "margin-bottom: 1rem; font-size: 1.1rem;" }, "🔥This page is password protected🔥"),
                h("input", {
                  id: "pwd-input",
                  type: "password",
                  placeholder: "Enter root flag 🔑",
                  style: `
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    border: 1px solid #444;
                    margin-bottom: 1rem;
                    width: 100%;
                    font-size: 1rem;`
                }),
                h("button", {
                  id: "pwd-btn",
                  type: "button",
                  style: `
                    background: #6c47ff;
                    color: #fff;
                    border: none;
                    border-radius: 6px;
                    padding: 0.5rem 1.5rem;
                    font-size: 1rem;
                    cursor: pointer;
                    margin-bottom: 0.5rem;`
                }, "Unlock 💀"),
                h("p", { id: "pwd-error", style: "color:#ff6b6b; min-height: 1.2em; margin: 0; font-size: 0.95rem;" }),
              ])
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

            // Our global password-protect logic
            const passwordProtectScript = h("script", {
              src: "/static/password-protect.js",
              defer: true,
            })

            // Replace existing children
            tree.children = [modalOverlay, contentDiv, cryptoJsScript, passwordProtectScript]
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
          {
            loadTime: "afterDOMReady",
            contentType: "external",
            src: "/static/password-protect.js",
          },
        ],
      }
    },
  }
} 