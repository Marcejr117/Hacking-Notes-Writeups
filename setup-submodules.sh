#!/bin/bash

echo "⚙️  Configurando acceso a submódulos privados..."

# Configura Git para usar tu token
git config --global url."https://${GITHUB_REPO_CLONE_TOKEN}@github.com/".insteadOf "https://github.com/"

# Inicializa y actualiza los submódulos
git submodule update --init --recursive
