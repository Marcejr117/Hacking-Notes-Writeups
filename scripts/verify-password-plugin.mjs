import fs from "node:fs"
import path from "node:path"

const entryPoint = path.resolve(".quartz/plugins/password-protect/dist/index.js")

if (!fs.existsSync(entryPoint)) {
  console.error(`Password protection plugin is missing: ${entryPoint}`)
  process.exit(1)
}

console.log("Password protection plugin is installed.")
