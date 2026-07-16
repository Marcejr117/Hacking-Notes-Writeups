#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${GITHUB_REPO_CLONE_TOKEN:-}" ]]; then
  echo "GITHUB_REPO_CLONE_TOKEN is required to fetch private content submodules." >&2
  exit 1
fi

askpass_script="$(mktemp)"
cleanup() {
  rm -f "$askpass_script"
}
trap cleanup EXIT

cat >"$askpass_script" <<'EOF'
#!/usr/bin/env sh
case "$1" in
  *Username*) printf '%s\n' "x-access-token" ;;
  *Password*) printf '%s\n' "$GITHUB_REPO_CLONE_TOKEN" ;;
  *) printf '\n' ;;
esac
EOF
chmod 700 "$askpass_script"

export GIT_ASKPASS="$askpass_script"
export GIT_TERMINAL_PROMPT=0

git submodule sync --recursive
git -c credential.helper= submodule update --init --recursive --depth 1
