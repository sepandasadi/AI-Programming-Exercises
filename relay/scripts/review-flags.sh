#!/usr/bin/env bash
# Lists added lines that deserve a second look in review.
# Compares the working tree with where it left `base`
# (default: main). Run `git add -N .` first to include
# new, untracked files.
base="$(git merge-base "${1:-main}" HEAD)"
git diff "$base" --unified=0 -- '*.ts' '*.tsx' '*.js' '*.mjs' |
  grep -E '^(\+\+\+ |\+[^+])' |
  grep -E -e '^\+\+\+ ' \
    -e '\bas [A-Z]\w*|as unknown|: any\b|<any>|!\.' \
    -e '@ts-(ignore|expect-error|nocheck)|eslint-disable' \
    -e '\.(skip|only|todo)\(|toMatchSnapshot' \
    -e 'catch *(\(\w*\))? *\{ *\}|\?\? *(0|""|\[\])' \
    -e 'Date\.now\(\)|Math\.random\(\)' |
  grep -B1 -E '^\+[^+]' | grep -v '^--$'
git diff "$base" --stat -- '*.test.ts' '*package.json'
