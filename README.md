# or-sample

Reference implementation of the OpenRouter + Node + TypeScript template. Streams chat completions through [OpenRouter](https://openrouter.ai) using the official [`@openrouter/sdk`](https://openrouter.ai/docs/client-sdks/typescript/overview).

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
