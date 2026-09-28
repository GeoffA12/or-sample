# OpenRouter + Node + TypeScript project template

Instructions for an agent setting up a new Node + TypeScript project that calls OpenRouter. Follow the steps in order. Every file below is meant to be copied verbatim; only the placeholders in `<angle brackets>` change.

## 1. What this template is

**Use it for** a new repository that:
- calls OpenRouter from TypeScript with the official `@openrouter/sdk`
- runs on Node with no build step (Node strips the types and runs the `.ts` files directly)
- uses Bun only to install packages and run scripts (`bun.lock` is the lockfile)

**Don't use it for** browser or Next.js apps, projects that must run on Bun's runtime, or existing repositories. For an existing repository, compare it with this template and report the differences to the user; don't overwrite it.

**What you'll end up with:**

```
<project-name>/
├── .env.example         variable names only, no values (committed)
├── .gitignore           keeps .env and node_modules out of git
├── CLAUDE.md            instructions for coding agents
├── README.md            setup and usage for people
├── bun.lock             exact dependency versions (committed)
├── eslint.config.js     lint rules
├── package.json         scripts and exact dependency versions
├── tsconfig.json        type-check settings (no emit)
└── src/
    ├── config.ts        reads and validates environment variables
    ├── config.test.ts   unit tests for config.ts
    └── hello.ts         streams one OpenRouter completion (`bun run hello`)
```

**Reference implementation:** https://github.com/GeoffA12/or-sample, which is built from this template and is kept identical to it except for the name and description.

**Done means** all of these hold (step 8 runs them):
- `bun install --frozen-lockfile` succeeds.
- `bun run check` passes (typecheck, lint and tests).
- `bun run hello` streams a reply and then prints a usage object.
- `git status` shows no `.env` and no key anywhere.

## 2. Prerequisites

Check these first and stop if one fails. Tell the user which check failed and what the output was; don't install or upgrade tools on your own.

| Tool | Required | Check |
|---|---|---|
| Node | 22.18 or newer (tested on 25.9.0) | `node --version` |
| Bun | 1.3 or newer (tested on 1.3.14) | `bun --version` |
| OpenRouter API key | exported as `OPENROUTER_API_KEY`, or the user will put it in `.env` | `test -n "$OPENROUTER_API_KEY" && echo set` (never print the key itself) |

Node 22.18 is the first release that runs `.ts` files without a flag. Older versions fail on `bun run hello` and `bun run test`.

## 3. Dependencies

Install exactly these versions. `package.json` pins exact versions (no `^` or `~`), so `bun.lock` resolves to the same versions and every project made from this template starts identical.

| Package | Where | Version (`package.json` and `bun.lock`) | Why this version |
|---|---|---|---|
| `@openrouter/sdk` | `dependencies` | `1.3.33` | OpenRouter client used by `hello.ts` |
| `typescript` | `devDependencies` | `6.0.3` | **Must stay on 6.0.x.** `typescript-eslint` 8.70.1 requires TypeScript `>=4.8.4 <6.1.0` and refuses to run on TypeScript 7 |
| `@types/node` | `devDependencies` | `26.6.3` | Node type definitions for `process`, `node:test` and so on |
| `eslint` | `devDependencies` | `10.11.0` | linter |
| `@eslint/js` | `devDependencies` | `10.0.1` | ESLint's recommended rules; its major version must match `eslint`'s |
| `typescript-eslint` | `devDependencies` | `8.70.1` | TypeScript parser and rules for ESLint |

There's one transitive dependency to know about: `@openrouter/sdk` depends on `zod` `^3.25.0 || ^4.0.0`, which resolved to `zod@4.6.5` when this template was tested. Don't add `zod` to `package.json` unless the project uses it directly.

**Install commands.** Run these after writing `package.json` (step 4); they generate `bun.lock`:

```bash
bun install
bun install --frozen-lockfile   # should report "no changes"
```

**Check the lockfile.** Each package above should resolve to exactly the version in the table:

```bash
grep -oE '"(@openrouter/sdk|typescript|@types/node|eslint|@eslint/js|typescript-eslint)": \["[^"]+"' bun.lock
```

**One blocked install script is expected.** Bun reports `Blocked 1 postinstall`. That's `@openrouter/sdk`'s `node scripts/check-types.js || true`, an optional type check that's allowed to fail. Leave it blocked; don't run `bun pm trust`.

### Version conflicts: stop and ask

Don't decide on your own that a newer or older version is fine. **Stop, report and wait for the user** if any of these happen:

- A pinned version won't install (it doesn't exist, it was removed from the registry, or the platform isn't supported).
- The install prints a peer-dependency warning or error.
- `bun.lock` resolves a direct dependency to a version other than the one in the table.
- The user or an existing file asks for a different version of anything in the table.
- A newer version exists that you think should be used, for example a TypeScript 7-compatible `typescript-eslint`.
- `bun run check` fails in a way the pinned versions seem to cause, rather than your code.

Report the package, the version the template pins, the version involved in the conflict, the exact error output, and the options you see (for example "keep 6.0.3" or "try X, which also means changing Y"). Only change a version after the user approves. Then update the table in this file in the same change (see "Maintaining this template").

## 4. Configuration files (copy verbatim)

### `package.json`

Replace `<project-name>` (lowercase, hyphens) and `<one-line description>`. Leave everything else as it is.

```json
{
  "name": "<project-name>",
  "version": "0.1.0",
  "private": true,
  "description": "<one-line description>",
  "type": "module",
  "engines": {
    "node": ">=22.18"
  },
  "scripts": {
    "hello": "node --env-file-if-exists=.env src/hello.ts",
    "test": "node --test \"src/**/*.test.ts\"",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "check": "bun run typecheck && bun run lint && bun run test"
  },
  "dependencies": {
    "@openrouter/sdk": "1.3.33"
  },
  "devDependencies": {
    "@eslint/js": "10.0.1",
    "@types/node": "26.6.3",
    "eslint": "10.11.0",
    "typescript": "6.0.3",
    "typescript-eslint": "8.70.1"
  }
}
```

What the scripts rely on:
- `hello` loads `.env` if it exists, and prints `.env not found. Continuing without it.` when it doesn't. The key can then come from the shell.
- The quotes around the test glob matter: Node expands the glob, not the shell.

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2023"],
    "types": ["node"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

Why these settings matter:
- `noEmit`: TypeScript only type-checks. Node runs the source directly.
- `allowImportingTsExtensions`: relative imports must include `.ts` (`import { readConfig } from "./config.ts"`), because Node does no module resolution for TypeScript.
- `erasableSyntaxOnly`: bans syntax Node can't strip, such as `enum`, `namespace` and constructor parameter properties.
- `verbatimModuleSyntax`: type-only imports must use `import type`.
- `noUncheckedIndexedAccess`: `array[0]` is typed as possibly `undefined`.

### `eslint.config.js`

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["node_modules"] },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // node:test's test()/describe() return promises the runner awaits itself.
      "@typescript-eslint/no-floating-promises": [
        "error",
        {
          allowForKnownSafeCalls: [
            { from: "package", package: "node:test", name: ["test", "it", "describe", "suite"] },
          ],
        },
      ],
    },
  },
  {
    files: ["eslint.config.js"],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
```

What this configuration does:
- `strictTypeChecked` is the strictest `typescript-eslint` preset and uses type information.
- Without the `no-floating-promises` override, every `test(...)` call in a test file is a lint error.
- The last block turns off type-aware rules for the config file itself, which isn't part of `tsconfig.json`.

## 5. Secrets: `.gitignore` and `.env.example`

**Secrets MUST stay out of git.** That covers the OpenRouter key and any other credential: not in a committed file, a commit message, a test fixture, a log line, a code comment or a prompt. Assume the repository is public.

Create both files before the first `git add`.

### `.gitignore`

```gitignore
node_modules/
.env
.env.*
!.env.example
*.log
.DS_Store
```

### `.env.example`

Variable names only. Never put a real value in this file.

```dotenv
OPENROUTER_API_KEY=
# Optional override; defaults to anthropic/claude-sonnet-5
# OPENROUTER_MODEL=
```

**Rules:**
- Don't create `.env` yourself and don't write the key into any file. The user either copies `.env.example` to `.env` and fills it in, or exports `OPENROUTER_API_KEY` in their shell.
- Never print the key. To check whether it's set, use `test -n "$OPENROUTER_API_KEY" && echo set`.
- If a key ever appears in a file, a diff or command output, stop and tell the user so they can rotate it. Don't just delete it and carry on.

**Before every commit, check both of these:**

```bash
git status --short                                                    # .env must not appear
git grep --cached -n -I -E 'sk-or-v1-[0-9a-f]{20,}|^OPENROUTER_API_KEY=\S' || echo clean
```

`clean` (the grep finds no matches) is the only acceptable result. If anything matches, unstage it and tell the user.

The pattern matches a real key (`sk-or-v1-` followed by hex) and a filled-in `OPENROUTER_API_KEY=` at the start of a line. It deliberately doesn't match its own text, which appears in `CLAUDE.md` and in this file, or the empty line in `.env.example`. Don't loosen it to something like `sk-or-`, or the check will flag the documentation and can never pass.

## 6. Source files (copy verbatim)

`config.ts` reads and validates environment variables once, at the entry point, and passes typed values onward. `hello.ts` is the smallest program that streams through OpenRouter.

### `src/config.ts`

```ts
export const DEFAULT_MODEL = "anthropic/claude-sonnet-5";

export interface Config {
  apiKey: string;
  model: string;
}

export function readConfig(env: NodeJS.ProcessEnv): Config {
  const apiKey = env["OPENROUTER_API_KEY"]?.trim();
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set (export it or add it to .env)");
  }
  const model = env["OPENROUTER_MODEL"]?.trim();
  return { apiKey, model: model ? model : DEFAULT_MODEL };
}
```

An empty `OPENROUTER_MODEL=` line in `.env` falls back to the default, so a user who copies `.env.example` without editing that line still gets a valid model.

### `src/config.test.ts`

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_MODEL, readConfig } from "./config.ts";

test("GIVEN no API key WHEN reading config THEN it throws", () => {
  assert.throws(() => readConfig({}), /OPENROUTER_API_KEY is not set/);
});

test("GIVEN a blank API key WHEN reading config THEN it throws", () => {
  assert.throws(() => readConfig({ OPENROUTER_API_KEY: "  " }), /OPENROUTER_API_KEY is not set/);
});

test("GIVEN only an API key WHEN reading config THEN it uses the default model", () => {
  assert.deepEqual(readConfig({ OPENROUTER_API_KEY: "test-key" }), {
    apiKey: "test-key",
    model: DEFAULT_MODEL,
  });
});

test("GIVEN an empty model override WHEN reading config THEN it uses the default model", () => {
  assert.equal(readConfig({ OPENROUTER_API_KEY: "test-key", OPENROUTER_MODEL: "" }).model, DEFAULT_MODEL);
});

test("GIVEN a model override WHEN reading config THEN it uses that model", () => {
  const config = readConfig({ OPENROUTER_API_KEY: "test-key", OPENROUTER_MODEL: "openai/gpt-5.6-luna" });
  assert.equal(config.model, "openai/gpt-5.6-luna");
});
```

These tests never call the network. `"test-key"` is a placeholder, not a credential.

### `src/hello.ts`

```ts
import { OpenRouter } from "@openrouter/sdk";
import { readConfig } from "./config.ts";

const { apiKey, model } = readConfig(process.env);
const openRouter = new OpenRouter({ apiKey });

const stream = await openRouter.chat.send({
  chatRequest: {
    model,
    messages: [{ role: "user", content: "Say hello in five words." }],
    stream: true,
  },
});

if (!(stream instanceof ReadableStream)) {
  throw new Error("Expected a streaming response");
}

for await (const chunk of stream) {
  const text = chunk.choices[0]?.delta.content;
  if (text) process.stdout.write(text);
  // Usage arrives only on the final chunk.
  if (chunk.usage) console.log("\nUsage:", chunk.usage);
}
```

How the SDK works here:
- The method is `openRouter.chat.send({ chatRequest: { ... } })`, not the OpenAI-style `chat.completions.create`.
- With `stream: true` it returns a `ReadableStream` of chunks. Text arrives in `choices[0].delta.content`.
- The last chunk carries `usage`, including token counts and cost.

## 7. `CLAUDE.md` and `README.md`

Replace the placeholders. Keep the section order: what the repository is and its layout come first, then setup, then everything else.

### `CLAUDE.md`

````markdown
# CLAUDE.md

<One-line description of the project>. Calls OpenRouter with `@openrouter/sdk`. Built from the OpenRouter + Node + TypeScript template (`docs/openrouter-node-typescript-template.md`).

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
````

### `README.md`

````markdown
# <project-name>

<One-line description>. Streams chat completions through [OpenRouter](https://openrouter.ai) using the official [`@openrouter/sdk`](https://openrouter.ai/docs/client-sdks/typescript/overview).

## Layout

```
src/config.ts        reads and validates environment variables
src/config.test.ts   unit tests for config.ts
src/hello.ts         streaming example (`bun run hello`)
eslint.config.js     ESLint flat config (typescript-eslint, strict type-checked)
tsconfig.json        type-check only (noEmit); Node strips types at runtime
```

## Requirements

- Node >= 22.18 (runs TypeScript directly, with no build step)
- [Bun](https://bun.sh) >= 1.3 for installing dependencies and running scripts
- An OpenRouter API key

## Setup

```bash
bun install --frozen-lockfile
cp .env.example .env    # then set OPENROUTER_API_KEY
```

You can export `OPENROUTER_API_KEY` in your shell instead of using `.env`. Never commit `.env`.

## Run

```bash
bun run hello
```

This prints the model's reply as it streams, followed by the token usage and cost that arrive with the final chunk. To use a different model, set `OPENROUTER_MODEL` to any [OpenRouter model ID](https://openrouter.ai/models) (default: `anthropic/claude-sonnet-5`).

## Tests and checks

```bash
bun run test                    # all src/**/*.test.ts (node:test)
node --test src/config.test.ts  # a single file
bun run typecheck
bun run lint
bun run check                   # typecheck + lint + test
```

Tests don't call the network and don't need an API key.
````

## 8. Setup order and verification

1. Check the prerequisites (section 2). Stop if one fails.
2. Create the directory and run `git init` (skip if the user already cloned an empty repository).
3. Write `.gitignore` and `.env.example` (section 5). Do this first, so nothing secret can be staged by accident.
4. Write `package.json`, `tsconfig.json` and `eslint.config.js` (section 4).
5. Run `bun install`, then `bun install --frozen-lockfile`, and check the lockfile versions (section 3). Stop on any conflict.
6. Write `src/config.ts`, `src/config.test.ts` and `src/hello.ts` (section 6).
7. Write `CLAUDE.md` and `README.md` (section 7), with the placeholders replaced.
8. Run `bun run check`. Expect `tsc` and `eslint` to print nothing, then `ℹ tests 5`, `ℹ pass 5`, `ℹ fail 0`.
9. If `OPENROUTER_API_KEY` is set, run `bun run hello`. Expect a short streamed greeting, then `Usage: {` with token and cost fields. This makes one small billable request, so tell the user before running it. If the key isn't set, skip this step and say so.
10. Run the secret checks (section 5).
11. Show the user the file list and the `bun run check` output. Commit only when they approve, and push only when they approve.

Report any step you skipped or that failed, with its exact output. Don't describe the setup as working until steps 8–10 pass.

## Maintaining this template

- This file and https://github.com/GeoffA12/or-sample are kept in sync. When you change a pinned version, a config file or a source file here, make the same change in `or-sample` (or the other way round) in the same change, and run the section 8 checks there.
- When changing a version, update the table in section 3, the `package.json` block in section 4, and every sentence that states the version, including the TypeScript pin reason in `CLAUDE.md`.
- Re-check before bumping TypeScript: `npm view typescript-eslint peerDependencies`. Upgrade TypeScript only when `typescript-eslint`'s declared range includes the new version.
- Last verified: 2026-09-28, Node 25.9.0, Bun 1.3.14, macOS arm64.
