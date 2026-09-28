# or-sample

A minimal TypeScript sample that streams a chat completion through [OpenRouter](https://openrouter.ai) using the official [`@openrouter/sdk`](https://openrouter.ai/docs/client-sdks/typescript/overview).

## Requirements

- Node >= 22.18 (runs TypeScript directly, with no build step)
- [Bun](https://bun.sh) for installing dependencies
- An OpenRouter API key

## Setup

```bash
bun install
cp .env.example .env    # then set OPENROUTER_API_KEY
```

You can export `OPENROUTER_API_KEY` in your shell instead of using `.env`.

## Run

```bash
bun run hello
```

This prints the model's reply as it streams, followed by the token usage and cost that arrive with the final chunk. To use a different model, set `OPENROUTER_MODEL` to any [OpenRouter model ID](https://openrouter.ai/models) (default: `anthropic/claude-sonnet-5`).

## Checks

```bash
bun run typecheck
bun run lint
bun run check    # both
```

## Layout

```
src/hello.ts        streaming example
eslint.config.js    ESLint flat config (typescript-eslint, strict type-checked)
tsconfig.json       type-check only (noEmit); Node strips types at runtime
```
