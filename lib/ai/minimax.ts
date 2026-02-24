import Anthropic from "@anthropic-ai/sdk";

if (!process.env.MINIMAX_API_KEY) {
  console.warn(
    "MINIMAX_API_KEY is not defined. AI features will not work properly.",
  );
}

export const minimax = new Anthropic({
  baseURL: "https://api.minimaxi.com/anthropic",
  apiKey: process.env.MINIMAX_API_KEY ?? "",
});

export const MINIMAX_MODEL = "MiniMax-M2.5-highspeed";
