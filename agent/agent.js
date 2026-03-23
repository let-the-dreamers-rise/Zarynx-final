const path = require("path");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
const args = process.argv.slice(2);
const planOnly = args.includes("--plan");
const sessionArg = args.find((arg) => arg.startsWith("--session="));
const sessionId = sessionArg ? sessionArg.split("=")[1] : undefined;
const intent = args.filter((arg) => !arg.startsWith("--")).join(" ").trim();

if (!intent) {
  console.error('Usage: npm run start --workspace agent -- "Resolve vitalik.eth"');
  process.exit(1);
}

async function main() {
  const endpoint = planOnly ? "/api/agent/plan" : "/api/agent/execute";
  const response = await axios.post(`${backendUrl}${endpoint}`, {
    intent,
    userId: sessionId,
  });

  console.log(JSON.stringify(response.data, null, 2));
}

main().catch((error) => {
  const payload = error.response?.data || { error: error.message };
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
});
