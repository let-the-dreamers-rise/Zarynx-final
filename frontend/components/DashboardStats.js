import SectionCard from "./SectionCard";
import StatusPill from "./StatusPill";

function formatValue(value, fallback = "Not configured") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return String(value);
}

export default function DashboardStats({ dashboard }) {
  const mockMode = Boolean(dashboard?.config?.mockMode);
  const baseAuthority = dashboard?.authority?.baseSepolia || {};
  const statusAuthority = dashboard?.authority?.statusSepolia || {};
  const locusBalance = dashboard?.locus?.balance?.data || {};
  const locusStatus = dashboard?.locus?.status?.data || {};
  const ens = dashboard?.ens || {};

  return (
    <div className="stats-grid">
      <SectionCard
        eyebrow={mockMode ? "Simulated Policy" : "On-Chain Policy"}
        title="Authority State"
        subtitle={
          mockMode
            ? "Deterministic mock authority state that still enforces limits, revocation, and whitelisted targets."
            : "Bounded rights enforced by the AuthorityManager contract."
        }
      >
        <div className="metric-list">
          <div className="metric">
            <span>Base Sepolia</span>
            <strong>{formatValue(baseAuthority.address)}</strong>
          </div>
          <div className="metric">
            <span>Max Spend</span>
            <strong>{formatValue(baseAuthority.maxSpendEth, "0")} ETH</strong>
          </div>
          <div className="metric">
            <span>State</span>
            <StatusPill
              label={baseAuthority.active ? "Active" : "Revoked"}
              tone={baseAuthority.active ? "success" : "danger"}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow={mockMode ? "Simulated Lane" : "Gasless Target"}
        title="Status Sepolia"
        subtitle={
          mockMode
            ? "Mock Status execution lane for fast demo coverage."
            : "Separate authority lane for Status Network execution."
        }
      >
        <div className="metric-list">
          <div className="metric">
            <span>Contract</span>
            <strong>{formatValue(statusAuthority.address)}</strong>
          </div>
          <div className="metric">
            <span>Allowance</span>
            <strong>{formatValue(statusAuthority.maxSpendEth, "0")} ETH</strong>
          </div>
          <div className="metric">
            <span>State</span>
            <StatusPill
              label={statusAuthority.active ? "Ready" : "Inactive"}
              tone={statusAuthority.active ? "success" : "warning"}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow={mockMode ? "Simulated API" : "Real API"}
        title="Locus Wallet"
        subtitle={
          mockMode
            ? "Mock Locus wallet with instant settlement traces and deterministic transfer records."
            : "Live wallet status and Base USDC spend capacity."
        }
      >
        <div className="metric-list">
          <div className="metric">
            <span>Wallet</span>
            <strong>{formatValue(locusStatus.walletAddress)}</strong>
          </div>
          <div className="metric">
            <span>USDC</span>
            <strong>{formatValue(locusBalance.usdc_balance, "0.0")}</strong>
          </div>
          <div className="metric">
            <span>Status</span>
            <StatusPill
              label={formatValue(locusStatus.walletStatus, "Unknown")}
              tone={locusStatus.walletStatus === "deployed" ? "success" : "warning"}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Human Readable"
        title="ENS Resolution"
        subtitle="ENS is used as the friendly execution surface."
      >
        <div className="metric-list">
          <div className="metric">
            <span>Name</span>
            <strong>{formatValue(ens.ensName || dashboard?.config?.ensName)}</strong>
          </div>
          <div className="metric">
            <span>Resolved</span>
            <strong>{formatValue(ens.address)}</strong>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
