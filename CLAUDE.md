# CLAUDE.md

Reference implementation of the OpenRouter + Node + TypeScript template (`docs/openrouter-node-typescript-template.md`). Calls OpenRouter with `@openrouter/sdk`.

## Layout

```
src/config.ts        reads and validates environment variables (the only place that touches process.env)
src/config.test.ts   unit tests for config.ts
src/hello.ts         streams one completion; run with `bun run hello`
eslint.config.js     ESLint flat config (typescript-eslint strictTypeChecked)
tsconfig.json        type-check only (noEmit); Node strips types at runtime
.env.example         environment variable names; copy to .env (gitignored)
```

Tests live next to the code they test, as `<name>.test.ts`.

## Stack

- **Runtime:** Node >= 22.18 runs `.ts` files directly (native type stripping). There is no build step and no `tsx`.
- **Package manager:** Bun. `bun.lock` is the lockfile; never add `package-lock.json`.
- **TypeScript:** pinned to 6.0.3, because `typescript-eslint` 8.70.1 requires TypeScript `<6.1.0`. Don't upgrade it until that changes.
- **Lint:** ESLint flat config with `typescript-eslint` `strictTypeChecked`.
- **Tests:** Node's built-in `node:test` and `node:assert/strict`. No test framework dependency.

## Setup

```bash
bun install --frozen-lockfile   # install the exact versions in bun.lock
cp .env.example .env            # then set OPENROUTER_API_KEY (or export it in your shell)
```

## Commands

```bash
bun run hello        # stream one completion; needs OPENROUTER_API_KEY
bun run test         # run all src/**/*.test.ts with node --test
bun run typecheck    # tsc --noEmit
bun run lint         # eslint .
bun run check        # typecheck + lint + test; run this before every commit
```

To run a single test file: `node --test src/config.test.ts`.

## Rules

- Run `bun run check` after every change and report the output.
- Code must stay erasable TypeScript (`erasableSyntaxOnly`): no `enum`, `namespace`, or parameter properties, because Node strips types rather than compiling them.
- Relative imports use the `.ts` extension (`import { x } from "./x.ts"`).
- Read environment variables at the entry point, fail fast when a required one is missing, and pass typed values inward.
- Don't add dependencies without asking.
- Dependency versions are pinned exactly in `package.json`. Don't change one without asking; report version conflicts instead of working around them.
- Keep diffs small: one change per commit.
- Stop and ask after two failed attempts at the same problem.

## Secrets

The API key comes from `OPENROUTER_API_KEY`, either exported in the shell or in a gitignored `.env` (see `.env.example`). Assume this repository is public. Never print, log, commit, or paste the key into a prompt. Before committing, confirm `.env` isn't staged and run `git grep --cached -n -I -E 'sk-or-v1-[0-9a-f]{20,}|^OPENROUTER_API_KEY=\S'`, which must find nothing.
