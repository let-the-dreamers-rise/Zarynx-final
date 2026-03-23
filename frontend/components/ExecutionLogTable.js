import SectionCard from "./SectionCard";
import StatusPill from "./StatusPill";

export default function ExecutionLogTable({ entries = [] }) {
  return (
    <SectionCard
      eyebrow="Judge Evidence"
      title="Agent Log"
      subtitle="Structured execution entries persisted by the backend for on-chain and off-chain actions."
    >
      {entries.length === 0 ? (
        <p className="muted-copy">No execution entries recorded yet.</p>
      ) : (
        <div className="log-table">
          <div className="log-table__head">
            <span>Step</span>
            <span>Action</span>
            <span>Tx Hash</span>
            <span>Result</span>
          </div>
          {entries
            .slice()
            .reverse()
            .map((entry) => (
              <div className="log-table__row" key={entry.recordedAt}>
                <span>{entry.step}</span>
                <span>{entry.action}</span>
                <span className="mono-wrap">{entry.txHash || "n/a"}</span>
                <span>
                  <StatusPill
                    label={entry.result?.rejected ? "Rejected" : entry.result?.skipped ? "Skipped" : entry.result?.mode === "mock" ? "Simulated" : "Recorded"}
                    tone={entry.result?.rejected ? "danger" : entry.result?.skipped ? "warning" : "success"}
                  />
                </span>
              </div>
            ))}
        </div>
      )}
    </SectionCard>
  );
}
