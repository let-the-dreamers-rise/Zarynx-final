import { useState } from "react";
import { Implementation, toMetaMaskSmartAccount } from "@metamask/smart-accounts-kit";
import { createPublicClient, createWalletClient, custom, http, parseEther } from "viem";
import { baseSepolia } from "viem/chains";
import { keccak256, stringToHex } from "viem";
import SectionCard from "./SectionCard";
import StatusPill from "./StatusPill";
import { serializeForDisplay } from "../lib/api";

const baseSepoliaRpc =
  process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ||
  "https://base-sepolia-rpc.publicnode.com";

const mockAddressFor = (label) => `0x${keccak256(stringToHex(label)).slice(2, 42)}`;

export default function MetaMaskSmartAccountCard({ agentAddress, maxSpendEth = "0.0005", mockMode = false }) {
  const [ownerAddress, setOwnerAddress] = useState("");
  const [smartAccountAddress, setSmartAccountAddress] = useState("");
  const [permissions, setPermissions] = useState(null);
  const [supported, setSupported] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const connectWallet = async () => {
    if (mockMode) {
      const mockOwnerAddress = mockAddressFor("operator-session-owner");
      setOwnerAddress(mockOwnerAddress);
      setSmartAccountAddress(mockAddressFor("operator-session-safe"));
      setSupported(
        serializeForDisplay([
          {
            type: "native-token-periodic",
            chainId: baseSepolia.id,
          },
        ])
      );
      return;
    }

    if (!window.ethereum) {
      setError("MetaMask is required for the smart account and delegation flow.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const transport = custom(window.ethereum);
      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(baseSepoliaRpc),
      });

      const walletClient = createWalletClient({
        chain: baseSepolia,
        transport,
      });

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const account = accounts?.[0];
      if (!account) {
        throw new Error("MetaMask did not return an account.");
      }

      const smartAccount = await toMetaMaskSmartAccount({
        client: publicClient,
        implementation: Implementation.Hybrid,
        deployParams: [account, [], [], []],
        deploySalt: "0x",
        signer: { walletClient },
      });

      const support = await window.ethereum.request({
        method: "wallet_getSupportedExecutionPermissions",
        params: [],
      });

      setOwnerAddress(account);
      setSmartAccountAddress(smartAccount.address);
      setSupported(serializeForDisplay(support));
    } catch (innerError) {
      setError(innerError.message);
    } finally {
      setBusy(false);
    }
  };

  const requestDelegation = async () => {
    if (mockMode) {
      setPermissions(
        serializeForDisplay({
          chainId: `0x${baseSepolia.id.toString(16)}`,
          to: agentAddress || mockAddressFor("delegated-agent"),
          from: ownerAddress || mockAddressFor("operator-session-owner"),
          permission: {
            type: "native-token-periodic",
            data: {
              periodAmount: parseEther(String(maxSpendEth)).toString(),
              periodDuration: 60 * 60 * 24,
            },
          },
        })
      );
      return;
    }

    if (!window.ethereum) {
      setError("MetaMask is required for the delegation flow.");
      return;
    }
    if (!agentAddress) {
      setError("Configure an agent address before requesting permissions.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const granted = await window.ethereum.request({
        method: "wallet_requestExecutionPermissions",
        params: [
        {
          chainId: `0x${baseSepolia.id.toString(16)}`,
          to: agentAddress,
          from: ownerAddress,
          permission: {
            type: "native-token-periodic",
            isAdjustmentAllowed: false,
            data: {
              periodAmount: `0x${parseEther(String(maxSpendEth)).toString(16)}`,
              periodDuration: 60 * 60 * 24,
              justification:
                "Bounded ZARYNX VAAP execution window for agent-initiated Base Sepolia calls.",
            },
          },
          rules: [],
        },
      ],
      });

      setPermissions(serializeForDisplay(granted));
    } catch (innerError) {
      setError(innerError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SectionCard
      eyebrow="Wallet Delegation"
      title="MetaMask Smart Account"
      subtitle={
        mockMode
          ? "Provision a preview smart account and inspect the delegated permission payload for the agent."
          : "Create a MetaMask smart account and request a bounded execution permission for the ZARYNX agent."
      }
      action={
        <button className="ghost-button" onClick={connectWallet} disabled={busy}>
          {busy ? "Working..." : mockMode ? "Provision Preview Wallet" : "Connect MetaMask"}
        </button>
      }
    >
      <div className="stack">
        <div className="row-wrap">
          <StatusPill label={ownerAddress ? "Connected" : "Not connected"} tone={ownerAddress ? "success" : "warning"} />
          {ownerAddress ? <code className="inline-code">{ownerAddress}</code> : null}
        </div>

        {smartAccountAddress ? (
          <div className="metric-list">
            <div className="metric">
              <span>Smart Account</span>
              <strong>{smartAccountAddress}</strong>
            </div>
            <div className="metric">
              <span>Delegate</span>
              <strong>{agentAddress || "Missing AGENT address"}</strong>
            </div>
          </div>
        ) : (
          <p className="muted-copy">
            Connect MetaMask to compute the smart account and inspect supported permission types.
          </p>
        )}

        <div className="row-wrap">
          <button className="primary-button" onClick={requestDelegation} disabled={busy || !ownerAddress}>
            Request 24h Permission
          </button>
          <span className="muted-copy">Periodic native token limit: {maxSpendEth} ETH</span>
        </div>

        {error ? <p className="error-copy">{error}</p> : null}

        {supported ? (
          <details className="details-panel">
            <summary>Supported execution permissions</summary>
            <pre>{JSON.stringify(supported, null, 2)}</pre>
          </details>
        ) : null}

        {permissions ? (
          <details className="details-panel" open>
            <summary>Granted execution permission payload</summary>
            <pre>{JSON.stringify(permissions, null, 2)}</pre>
          </details>
        ) : null}
      </div>
    </SectionCard>
  );
}
