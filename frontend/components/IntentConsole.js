import { useState } from "react";
import SectionCard from "./SectionCard";
import { postJson } from "../lib/api";
import { sanitizeForDisplay } from "../lib/present";

const quickIntents = [
  "Resolve vitalik.eth and prepare an onchain transfer under the configured authority limit.",
  "Upload the current agent log to Filecoin and return the CID.",
  "Register the current agent identity using the ERC-8004 registry.",
  "Send 0.1 USDC to vitalik.eth using Locus with memo 'Synthesis demo'.",
];

export default function IntentConsole({ sessionId, onExecuted, mockMode = false }) {
  const [intent, setIntent] = useState(quickIntents[0]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await postJson("/api/agent/execute", {
        intent,
        userId: sessionId || undefined,
      });
      setResponse(result);
      if (onExecuted) {
        onExecuted(result);
      }
    } catch (innerError) {
      setError(innerError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard
      eyebrow="Operator Console"
      title="Intent Execution"
      subtitle={
        mockMode
          ? "Submit a natural-language instruction. The preview router will plan, authorize, and execute the full end-to-end flow."
          : "Submit a natural-language instruction. Venice reasons over it, Self gates it, and the backend routes it to the real execution layer."
      }
      action={
        <button className="primary-button" onClick={run} disabled={loading}>
          {loading ? "Executing..." : "Execute Intent"}
        </button>
      }
    >
      <div className="stack">
        <div className="quick-intents">
          {quickIntents.map((example) => (
            <button
              key={example}
              className="chip-button"
              onClick={() => setIntent(example)}
              type="button"
            >
              {example}
            </button>
          ))}
        </div>

        <textarea
          className="intent-textarea"
          value={intent}
          onChange={(event) => setIntent(event.target.value)}
          placeholder="Ask the agent to move funds, resolve ENS, upload logs, or register identity."
          rows={7}
        />

        <div className="row-wrap">
          <span className="muted-copy">
            Self session: {sessionId || "not verified yet"}
          </span>
        </div>

        {error ? <p className="error-copy">{error}</p> : null}

        {response ? (
          <details className="details-panel" open>
            <summary>Last execution payload</summary>
            <pre>{JSON.stringify(sanitizeForDisplay(response), null, 2)}</pre>
          </details>
        ) : null}
      </div>
    </SectionCard>
  );
}
