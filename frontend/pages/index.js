import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import DashboardStats from "../components/DashboardStats";
import ExecutionLogTable from "../components/ExecutionLogTable";
import IntentConsole from "../components/IntentConsole";
import SectionCard from "../components/SectionCard";
import StatusPill from "../components/StatusPill";
import { fetcher } from "../lib/api";
import { sanitizeForDisplay } from "../lib/present";

const SelfVerificationCard = dynamic(
  () => import("../components/SelfVerificationCard"),
  { ssr: false }
);

const MetaMaskSmartAccountCard = dynamic(
  () => import("../components/MetaMaskSmartAccountCard"),
  { ssr: false }
);

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verifiedSession, setVerifiedSession] = useState(null);

  const loadDashboard = async () => {
    try {
      const next = await fetcher("/api/dashboard");
      setData(next);
      setError(null);
    } catch (innerError) {
      setError(innerError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = window.setInterval(loadDashboard, 10000);
    return () => window.clearInterval(interval);
  }, []);

  const latestSessionId =
    verifiedSession?.userId || data?.lastIntent?.context?.userId || "";
  const displayAgentCard = sanitizeForDisplay(data?.agentCard || {});
  const displayLastIntent = sanitizeForDisplay(data?.lastIntent || {});

  return (
    <main className="app-shell">
      <div className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Synthesis Hackathon Build</p>
          <h1>ZARYNX VAAP</h1>
          <p className="hero-subtitle">
            {data?.config?.mockMode
              ? "Verifiable Agent Authority Protocol running in preview runtime: bounded execution, accelerated verification, structured evidence, and delegated operator controls."
              : "Verifiable Agent Authority Protocol. AI agents earn bounded execution rights, enforced on-chain, logged in public evidence, and stitched across real Web3 integrations."}
          </p>
          <div className="hero-badges">
            <StatusPill label={data?.config?.mockMode ? "Preview Runtime" : "Live Runtime"} tone={data?.config?.mockMode ? "warning" : "success"} />
            <StatusPill label="Locus Settlement" tone="success" />
            <StatusPill label="MetaMask Delegation" tone="success" />
            <StatusPill label="ERC-8004 Ready" tone="success" />
            <StatusPill label="Status Lane" tone="warning" />
          </div>
        </div>

        <div className="hero-sidecar">
          <div className="hero-stat">
            <span>Backend</span>
            <strong>{isLoading ? "Loading" : error ? "Offline" : "Online"}</strong>
          </div>
          <div className="hero-stat">
            <span>Latest Session</span>
            <strong>{latestSessionId || "none"}</strong>
          </div>
          <div className="hero-stat">
            <span>Log Entries</span>
            <strong>{data?.agentLog?.entries?.length || 0}</strong>
          </div>
        </div>
      </div>

      {error ? (
        <SectionCard
          eyebrow="Connection"
          title="Backend Unreachable"
          subtitle="Start the backend or update NEXT_PUBLIC_BACKEND_URL."
        >
          <p className="error-copy">{error.message}</p>
        </SectionCard>
      ) : null}

      <DashboardStats dashboard={data} />

      <div className="main-grid">
        <SelfVerificationCard
          mockMode={Boolean(data?.config?.mockMode)}
          onVerified={(session) => {
            setVerifiedSession(session);
            loadDashboard();
          }}
        />
        <MetaMaskSmartAccountCard
          mockMode={Boolean(data?.config?.mockMode)}
          agentAddress={data?.agentCard?.agent?.agentAddress}
          maxSpendEth={data?.authority?.baseSepolia?.maxSpendEth || "0.0005"}
        />
      </div>

      <div className="main-grid">
        <IntentConsole
          mockMode={Boolean(data?.config?.mockMode)}
          sessionId={latestSessionId}
          onExecuted={() => loadDashboard()}
        />
        <SectionCard
          eyebrow="Execution Manifest"
          title="Agent Identity"
          subtitle="Current agent manifest, routing context, and the latest execution snapshot."
        >
          <div className="metric-list">
            <div className="metric">
              <span>Agent Address</span>
              <strong>{displayAgentCard?.agent?.agentAddress || "Not configured"}</strong>
            </div>
            <div className="metric">
              <span>Registry</span>
              <strong>{displayAgentCard?.identity?.registryAddress || "Not configured"}</strong>
            </div>
            <div className="metric">
              <span>Agent ID</span>
              <strong>{displayAgentCard?.identity?.agentId || "Pending"}</strong>
            </div>
          </div>
          <details className="details-panel">
            <summary>agent.json</summary>
            <pre>{JSON.stringify(displayAgentCard, null, 2)}</pre>
          </details>
          <details className="details-panel">
            <summary>Last intent runtime snapshot</summary>
            <pre>{JSON.stringify(displayLastIntent, null, 2)}</pre>
          </details>
        </SectionCard>
      </div>

      <ExecutionLogTable entries={data?.agentLog?.entries || []} />
    </main>
  );
}
