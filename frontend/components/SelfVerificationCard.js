import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { SelfAppBuilder } from "@selfxyz/qrcode";
import SectionCard from "./SectionCard";
import StatusPill from "./StatusPill";
import { getBackendUrl, postJson } from "../lib/api";

const SelfQRcodeWrapper = dynamic(
  () => import("@selfxyz/qrcode").then((module) => module.default),
  { ssr: false }
);

export default function SelfVerificationCard({ onVerified, mockMode = false }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scope = process.env.NEXT_PUBLIC_SELF_SCOPE || "";
  const endpoint =
    process.env.NEXT_PUBLIC_SELF_ENDPOINT || `${getBackendUrl()}/api/self/verify`;
  const appName = process.env.NEXT_PUBLIC_SELF_APP_NAME || "ZARYNX VAAP";

  const refreshSession = async (userId) => {
    const response = await fetch(`${getBackendUrl()}/api/self/session/${userId}`);
    const data = await response.json();
    setSession(data);
    if (data?.status === "verified" && onVerified) {
      onVerified(data);
    }
  };

  const createSession = async () => {
    setLoading(true);
    setError("");
    try {
      const next = await postJson("/api/self/session", {});
      setSession(next);
      if (next?.status === "verified" && onVerified) {
        onVerified(next);
      }
    } catch (innerError) {
      setError(innerError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.userId || session.status === "verified") {
      return undefined;
    }

    const interval = window.setInterval(() => {
      refreshSession(session.userId).catch(() => null);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [session?.status, session?.userId]);

  const selfApp =
    session?.userId && scope && endpoint
      ? new SelfAppBuilder({
          appName,
          scope,
          endpoint,
          userId: session.userId,
          disclosures: {
            name: true,
            nationality: true,
            passport_number: true,
            date_of_birth: true,
            minimumAge: 18,
            excludedCountries: ["IRN", "PRK", "SYR"],
            ofac: true,
          },
        }).build()
      : null;

  return (
    <SectionCard
      eyebrow="Identity Gate"
      title="Self Protocol Verification"
      subtitle="The agent requires a verified identity session before executing money-moving actions."
      action={
        <button className="ghost-button" onClick={createSession} disabled={loading}>
          {loading ? "Preparing..." : "New Session"}
        </button>
      }
    >
      {!scope || !endpoint ? (
        <p className="muted-copy">
          {mockMode
            ? "This preview runtime uses an accelerated verification handshake, so operator sessions clear immediately."
            : "Configure `NEXT_PUBLIC_SELF_SCOPE` and `NEXT_PUBLIC_SELF_ENDPOINT` to activate the live Self flow."}
        </p>
      ) : null}

      <div className="stack">
        <div className="row-wrap">
          <StatusPill
            label={session?.status || "idle"}
            tone={session?.status === "verified" ? "success" : "warning"}
          />
          {session?.userId ? (
            <code className="inline-code">{session.userId}</code>
          ) : (
            <span className="muted-copy">No active session</span>
          )}
        </div>

        {error ? <p className="error-copy">{error}</p> : null}

        {mockMode && session?.status === "verified" ? (
          <p className="muted-copy">
            Identity session confirmed. The execution lock is lifted for this operator.
          </p>
        ) : selfApp ? (
          <div className="self-card">
            <SelfQRcodeWrapper
              selfApp={selfApp}
              onSuccess={() => refreshSession(session.userId)}
              size={260}
            />
            <p className="muted-copy">
              Scan with Self, complete the passport flow, and this dashboard will lift the execution lock.
            </p>
          </div>
        ) : (
          <p className="muted-copy">
            Start a session to render the verification QR.
          </p>
        )}
      </div>
    </SectionCard>
  );
}
