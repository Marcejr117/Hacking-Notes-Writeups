# 🔐 Hacking Notes & Writeups

This is a personal repository created to store and share notes, cheatsheets, and writeups related to **ethical hacking, cybersecurity, CTF challenges (Hack The Box, TryHackMe), and Red Team techniques**.  
👉 Website: [r1nzler.netrunners.sh](https://r1nzler.netrunners.sh/)

---

## 📌 Project Features

- 📝 Comprehensive notes and cheatsheets for **Red Team / Blue Team** operations
- 🕵️ Detailed writeups for challenges on **Hack The Box (HTB)** and **TryHackMe**
- 📚 Useful resources and collections of hacking techniques
- 🎨 Published from Obsidian with **Quartz 5, TypeScript, SCSS, and JavaScript**

---

## ⚙️ Useful Properties

These properties allow customization and protection of pages within the project:

- **`passwordHash`** → SHA-256 of the value entered by the visitor; preferred for protected pages
- **`password`** → Direct password value (avoid it when the source repository is public)
- **`socialDescription`** → Adds a custom description for the **Open Graph (OG) preview**
- **`socialImage`** → Adds a custom image for the **Open Graph (OG) preview**

---

## 🧑‍💻 Technologies Used

- **Quartz 5**
- **TypeScript**
- **SCSS**
- **JavaScript**

---

## Deployment

Vercel reads the build settings from `vercel.json`. Because `content/Walkthrough`
and `content/assets` are private submodules, configure a fine-grained GitHub token
with read-only `Contents` access:

- Vercel environment variable: `GITHUB_REPO_CLONE_TOKEN`
- GitHub Actions secret: `SUBMODULES_TOKEN`

The token is provided to Git through a temporary `GIT_ASKPASS` helper and is
never persisted in a repository URL or Git configuration.

---

## 📜 License

This project is licensed under the **MIT License**.  
Feel free to use, modify, and contribute! 🙌

---

## ⭐ Contributions

Contributions are always welcome! You can help by:

- Adding new notes or cheatsheets
- Improving website design and functionality
- Reporting bugs and optimizing code

---

✨ **If you find this repository useful, please give it a ⭐ on GitHub to support the project.**
