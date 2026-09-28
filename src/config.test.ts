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
