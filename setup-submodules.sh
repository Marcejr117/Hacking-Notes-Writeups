#!/bin/bash
set -e

echo "⚙️ Configurando acceso a submódulos privados..."

# Verifica que la variable exista (fallar pronto si no está)
if [ -z "${GITHUB_REPO_CLONE_TOKEN:-}" ]; then
  echo "ERROR: GITHUB_REPO_CLONE_TOKEN no está definido en Vercel."
  exit 1
fi

# Reescrituras: usar usuario 'x-access-token' + TOKEN como password en la URL
git config --global url."https://x-access-token:${GITHUB_REPO_CLONE_TOKEN}@github.com/".insteadOf "https://github.com/"
git config --global url."https://x-access-token:${GITHUB_REPO_CLONE_TOKEN}@github.com/".insteadof "git@github.com:"
git config --global url."https://x-access-token:${GITHUB_REPO_CLONE_TOKEN}@github.com/".insteadof "ssh://git@github.com/"

# Sincroniza y clona submódulos
git submodule sync --recursive
git submodule update --init --recursive
