const axios = require("axios");
const { z } = require("zod");
const { config } = require("../config");
const { isMockMode } = require("./mode-service");
const mockService = require("./mock-service");

const decisionSchema = z.object({
  action: z.enum([
    "onchain_transfer",
    "status_transfer",
    "locus_transfer",
    "register_identity",
    "upload_log",
    "resolve_ens",
    "none",
  ]),
  target: z.string().nullable(),
  amount: z.number().nullable(),
  network: z.enum(["baseSepolia", "statusSepolia", "base", "none"]).default("none"),
  asset: z.enum(["ETH", "USDC", "NONE"]).default("NONE"),
  reason: z.string(),
  memo: z.string().nullable().default(null),
  requiresIdentity: z.boolean().default(true),
});

const extractJson = (text) => {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Venice response did not contain JSON");
    }
    return JSON.parse(match[0]);
  }
};

async function reasonIntent({ intent, context }) {
  if (isMockMode()) {
    return decisionSchema.parse(mockService.reasonIntent({ intent, context }));
  }

  if (!config.venice.apiKey) {
    throw new Error("VENICE_API_KEY is not configured");
  }

  const response = await axios.post(
    `${config.venice.baseUrl}/chat/completions`,
    {
      model: config.venice.model,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            "You are ZARYNX VAAP. Return JSON only. Choose the single best action for the user intent. Use locus_transfer for Base USDC via Locus, onchain_transfer for AuthorityManager execution on Base Sepolia, status_transfer for AuthorityManager execution on Status Sepolia, register_identity to register ERC-8004 identity, upload_log to store logs on Filecoin, resolve_ens for ENS lookups, none if nothing should execute. Never invent balances, tx hashes, or approvals.",
        },
        {
          role: "user",
          content: JSON.stringify({
            intent,
            context,
            outputShape: {
              action: "onchain_transfer | status_transfer | locus_transfer | register_identity | upload_log | resolve_ens | none",
              target: "address or ENS name or null",
              amount: "number or null",
              network: "baseSepolia | statusSepolia | base | none",
              asset: "ETH | USDC | NONE",
              reason: "short explanation",
              memo: "string or null",
              requiresIdentity: true,
            },
          }),
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${config.venice.apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 45000,
    }
  );

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Venice did not return a completion");
  }

  return decisionSchema.parse(extractJson(content));
}

module.exports = {
  reasonIntent,
};
