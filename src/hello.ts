import { OpenRouter } from "@openrouter/sdk";

const apiKey = process.env["OPENROUTER_API_KEY"];
if (!apiKey) {
  throw new Error("OPENROUTER_API_KEY is not set (export it or add it to .env)");
}

const model = process.env["OPENROUTER_MODEL"] ?? "anthropic/claude-sonnet-5";
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
