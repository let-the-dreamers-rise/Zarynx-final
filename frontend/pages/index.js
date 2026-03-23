import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import DashboardStats from "../components/DashboardStats";
import ExecutionLogTable from "../components/ExecutionLogTable";
import IntentConsole from "../components/IntentConsole";
import SectionCard from "../components/SectionCard";
import StatusPill from "../components/StatusPill";
import { fetcher } from "../lib/api";

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

  return (
    <main className="app-shell">
      <div className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Synthesis Hackathon Build</p>
          <h1>ZARYNX VAAP</h1>
          <p className="hero-subtitle">
            {data?.config?.mockMode
              ? "Full-stack simulated execution mode. The dashboard, backend, and agent all run with deterministic mock proofs so you can demo the complete workflow immediately."
              : "Verifiable Agent Authority Protocol. AI agents earn bounded execution rights, enforced on-chain, logged in public evidence, and stitched across real Web3 integrations."}
          </p>
          <div className="hero-badges">
            <StatusPill label={data?.config?.mockMode ? "Mock Mode" : "Live Mode"} tone={data?.config?.mockMode ? "warning" : "success"} />
            <StatusPill label={data?.config?.mockMode ? "Locus Simulated" : "Locus Live"} tone="success" />
            <StatusPill label={data?.config?.mockMode ? "MetaMask Simulated" : "MetaMask Smart Accounts"} tone="success" />
            <StatusPill label="ERC-8004 Ready" tone="success" />
            <StatusPill label={data?.config?.mockMode ? "Status Lane Simulated" : "Status Gasless Lane"} tone="warning" />
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
          eyebrow="Evidence Mirror"
          title="Agent Identity"
          subtitle="Live contents of the local ERC-8004 agent manifest that the registry and storage layers can point to."
        >
          <details className="details-panel" open>
            <summary>agent.json</summary>
            <pre>{JSON.stringify(data?.agentCard || {}, null, 2)}</pre>
          </details>
          <details className="details-panel">
            <summary>Last intent runtime snapshot</summary>
            <pre>{JSON.stringify(data?.lastIntent || {}, null, 2)}</pre>
          </details>
        </SectionCard>
      </div>

      <ExecutionLogTable entries={data?.agentLog?.entries || []} />
    </main>
  );
}
