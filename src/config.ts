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
