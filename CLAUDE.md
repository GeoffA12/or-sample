# CLAUDE.md

Minimal TypeScript sample that streams chat completions through OpenRouter with `@openrouter/sdk`.

## Stack

- **Runtime:** Node >= 22.18 runs `.ts` files directly (native type stripping). There is no build step and no `tsx`.
- **Package manager:** Bun. `bun.lock` is the lockfile; never add `package-lock.json`.
- **TypeScript:** pinned to 6.x because `typescript-eslint` does not support TS 7 yet. Don't upgrade it until that changes.
- **Lint:** ESLint flat config (`eslint.config.js`) with `typescript-eslint` `strictTypeChecked`.

## Commands

```bash
bun install          # install deps (respects bun.lock)
bun run hello        # stream one completion; needs OPENROUTER_API_KEY
bun run typecheck    # tsc --noEmit
bun run lint         # eslint .
bun run check        # typecheck + lint
```

## Rules

- Run `bun run check` after every change and report the output.
- Code must stay erasable TypeScript (`erasableSyntaxOnly`): no `enum`, `namespace`, or parameter properties, because Node strips types rather than compiling them.
- Relative imports use the `.ts` extension (`import { x } from "./x.ts"`).
- Read environment variables at the entry point, fail fast when a required one is missing, and pass typed values inward.
- Don't add dependencies without asking.
- Keep diffs small: one change per commit.
- Stop and ask after two failed attempts at the same problem.

## Secrets

The API key comes from `OPENROUTER_API_KEY`, either exported in the shell or in a gitignored `.env` (see `.env.example`). This repo is public. Never print, log, commit, or paste the key into a prompt.
