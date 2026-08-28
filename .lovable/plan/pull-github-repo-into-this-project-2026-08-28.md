# Pull GitHub repo into this project

## Goal
Import the entire contents of `https://github.com/jd-innovations/team-joined` into this Lovable project and overwrite the placeholder TanStack Start template so the app can be finished here.

## Current state
- This project is a fresh TanStack Start v1 template.
- The repo is private/inaccessible without authentication (GitHub API returns 404).
- No GitHub workspace connector is currently linked to the project.

## Plan

1. **Connect GitHub**
   - Link the GitHub App connector to this project so the server can call the GitHub REST API.
   - Use a connection that has read access to `jd-innovations/team-joined`.

2. **Inspect the repo**
   - Fetch repo metadata (default branch, language, structure).
   - Recursively list all files in the default branch.
   - Identify framework mismatch (React/TanStack vs. other) and decide on a mapping before overwriting.

3. **Map and overwrite files**
   - Download file contents via the GitHub API.
   - Replace the placeholder `src/routes/index.tsx` and any other template files with repo equivalents.
   - Preserve required Lovable/TanStack scaffolding (`src/router.tsx`, `src/routes/__root.tsx`, `vite.config.ts`, `src/start.ts`, `src/server.ts`) unless the repo already provides compatible replacements.
   - Write new files for components, hooks, styles, server functions, and migrations.

4. **Merge dependencies and config**
   - Merge the repo's `package.json` dependencies into the existing one.
   - Install packages with `bun install`.
   - Reconcile `tsconfig.json`, `vite.config.ts`, and `src/styles.css` as needed.

5. **Verify**
   - Run the build/typecheck.
   - Check the live preview to confirm the placeholder is replaced and the app loads.

## Open question before overwriting
Please confirm one item:
- If the repo uses a different framework (Next.js, Vue, etc.), should we adapt it to TanStack Start or keep it as-is? For now the plan assumes the repo is already a compatible React/TanStack project.
