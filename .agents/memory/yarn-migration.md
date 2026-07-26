---
name: npm workspaces setup
description: Project uses npm workspaces (not yarn or pnpm). Key rules, hoisting quirk, and run commands.
---

# npm workspaces setup

**Why:** User migrated from pnpm → Yarn → npm. npm is the final package manager.

## What's in place
- Root `package.json` has `"workspaces": ["artifacts/*","lib/*","lib/integrations/*","scripts"]`
- `package-lock.json` is the lockfile; `yarn.lock` and `pnpm-lock.yaml` are deleted
- `.npmrc` sets `legacy-peer-deps=true`
- `overrides` (not `resolutions`) used in root `package.json` to pin esbuild
- Artifact run commands: `npm run dev -w @workspace/<slug>`

## Critical hoisting quirk
`@vitejs/plugin-react` gets hoisted to root `node_modules`, so `vite` must also be present at root.
`vite` and `@vitejs/plugin-react` are therefore in root `package.json` devDependencies in addition to the workspace packages.
Without this, beacon-trust fails with `ERR_MODULE_NOT_FOUND: Cannot find package 'vite' imported from /home/runner/workspace/node_modules/@vitejs/plugin-react/dist/index.js`.

## How to apply going forward
- Run `npm install` from **repo root only**
- Add a dep to a workspace: `npm install <pkg> -w @workspace/<slug>`
- Add a root dev dep: `npm install -D <pkg>`
- Run a workspace script: `npm run <script> -w @workspace/<slug>`
- After adding any new Vite plugin, check if it peer-deps `vite` — if so, it may need vite at root too
- Do NOT use `yarn` or `pnpm`
