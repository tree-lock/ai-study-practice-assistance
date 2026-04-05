const DEFAULT_GATEWAY_MODEL = "anthropic/claude-sonnet-4-20250514";

/**
 * Vercel AI Gateway model id (`provider/model`).
 * @see https://vercel.com/docs/ai-gateway
 */
export function getGatewayModelId(): string {
  const id = process.env.AI_GATEWAY_MODEL?.trim();
  return id && id.length > 0 ? id : DEFAULT_GATEWAY_MODEL;
}

export function assertGatewayApiKey(): void {
  if (!process.env.AI_GATEWAY_API_KEY?.trim()) {
    throw new Error("AI_GATEWAY_API_KEY 未配置");
  }
}
