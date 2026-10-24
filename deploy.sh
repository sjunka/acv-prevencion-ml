#!/bin/sh
# Publica dist/ en la rama gh-pages (GitHub Pages sirve esa rama). Uso: npm run deploy
set -e
npm run build
cd dist
rm -rf .git
git init -q
git checkout -q -b gh-pages
git add -A
git commit -q -m "Publicar sustentación"
git push -f "$(git -C .. remote get-url origin)" gh-pages
rm -rf .git
