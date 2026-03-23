# ZARYNX VAAP

ZARYNX VAAP is a verifiable agent authority protocol that turns natural-language intent into bounded execution. It combines authority-scoped on-chain actions, identity-gated execution, ENS resolution, structured receipts, and an operator dashboard so AI agents can act under enforceable policy instead of backend trust.

This repo ships with a deterministic preview runtime by default. `MOCK_MODE=true` keeps the entire workflow inspectable end-to-end when partner credentials or funded wallets are unavailable, while the live integrations and deployment paths remain in the codebase for real execution.

## Problem

Autonomous agents can move value, call APIs, and make decisions, but most systems still trust backend code to enforce limits. That creates unverifiable trust boundaries and weak operator control.

## Solution

ZARYNX VAAP combines:

- on-chain execution constraints with `AuthorityManager`
- an ERC-8004-style agent identity manifest
- Self-gated operator identity checks
- Locus-backed Base USDC payment rails
- ENS resolution in the execution path and UI
- Filecoin Pin upload support for evidence artifacts
- EigenCompute container packaging for external TEE deployment
- Venice-based intent reasoning

## Competition Positioning

ZARYNX is positioned around one core claim:

- AI agents should not receive backend-only trust
- operators should delegate bounded rights
- those rights should be inspectable, revocable, and enforceable
- every execution should leave machine-readable receipts

This maps directly to the strongest tracks for the project:

- `Synthesis Open Track`
- `Best Use of Locus`
- `Best Use of Delegations`
- `Agents With Receipts — ERC-8004`
- `Go Gasless: Deploy & Transact on Status Network with Your AI Agent`
- `Best Use Case with Agentic Storage`
- `Best Self Protocol Integration`
- `ENS Open Integration`
- `Best Use of EigenCompute`
- `Private Agents, Trusted Actions`

## Proof Surfaces Already Available

- published Synthesis project:
  - `https://synthesis.devfolio.co/projects/zarynx-vaap-c97a`
- live demo:
  - `https://skill-deploy-hxmacndaqk-codex-agent-deploys.vercel.app`
- live Moltbook post:
  - `https://www.moltbook.com/post/12c2b1f0-4700-4a1e-a5a9-cc81931b98e8`
- live Locus wallet registration evidence:
  - wallet id `b35bd016-e9cf-408d-9e74-5a97d7e76b8c`
  - wallet address `0x9f6ec1480cbc88ac4697a9acb8024f751e5bf89a`
  - credit request `f661941a-1b96-4079-b33c-c28aea60a6e7`
- ENS resolution evidence:
  - `vitalik.eth -> 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`
- structured execution receipts:
  - `agent.json`
  - `agent_log.json`
  - `conversation.txt`

## Architecture

```text
Human -> Frontend Dashboard
       -> Self QR verification
       -> MetaMask smart account + execution permissions

Frontend -> Backend Control Plane
         -> /api/agent/plan
         -> /api/agent/execute
         -> /api/dashboard

Backend -> Venice API for intent reasoning
        -> ENS provider for human-readable targets
        -> Locus API for Base USDC wallet and payments
        -> AuthorityManager on Base Sepolia / Status Sepolia
        -> ERC-8004 identity registry
        -> Filecoin Pin CLI for log persistence
        -> EigenCompute endpoint for external attested decision execution
```

## Repo Layout

```text
/contracts
/backend
/frontend
/agent
/eigencompute
README.md
AGENTS.md
agent.json
agent_log.json
conversation.txt
```

## Simulated Demo Mode

- Self sessions auto-verify
- Venice planning uses local heuristics
- Base and Status authority lanes return simulated tx hashes while still enforcing max spend and whitelisted targets
- Locus returns simulated settlement receipts
- Filecoin uploads return simulated CIDs
- EigenCompute returns simulated TEE attestations
- MetaMask setup can be simulated in the dashboard without a browser wallet

Set `MOCK_MODE=false` if you want to switch the repo back to real integrations later.

## Final-Hour Upgrade Strategy

If you have limited time before judging, do not spread effort equally across every partner. The fastest remaining real proofs from the current setup are:

1. Status Sepolia deploy plus one real authority execution
2. Base Sepolia deploy plus one real ERC-8004 registration
3. MetaMask execution permissions from a browser wallet that supports delegations
4. Locus payment settlement if wallet funding clears

The detailed final-hour ranking and commands live in `FINAL_HOUR_PLAN.md`.

## Previously Captured Live Evidence

- Locus owner address: `0x5e59B8ed62515D2C2BeB2F6955ed430e70af4B16`
- Locus smart wallet: `0x9f6ec1480cbc88ac4697a9acb8024f751e5bf89a`
- Locus wallet id: `b35bd016-e9cf-408d-9e74-5a97d7e76b8c`
- Locus wallet status: `deployed`
- Locus credit request id: `f661941a-1b96-4079-b33c-c28aea60a6e7`
- Locus credit request status: `PENDING` as of `2026-03-19T09:54:39.131Z`
- ENS resolution used in the dashboard: `vitalik.eth -> 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`
- Status Sepolia deployment attempt result: rejected due `insufficient funds for gas * price + value`
- AuthorityManager contract tests: `4 passing`

These artifacts are recorded in [`agent_log.json`](/Users/ASHWIN%20GOYAL/OneDrive/Desktop/syntheai/agent_log.json) and [`agent.json`](/Users/ASHWIN%20GOYAL/OneDrive/Desktop/syntheai/agent.json).

## Integration Coverage

### Locus

- simulated wallet status and send flow in demo mode
- existing live beta evidence preserved in the logs

### MetaMask

- smart account address derivation with `@metamask/smart-accounts-kit`
- execution permission request flow via `wallet_requestExecutionPermissions`

### ERC-8004

- `agent.json` manifest generation
- on-chain registry contract for registering agent metadata URIs
- identity registration route in backend

### Status Network

- simulated authority lane with revocation and target enforcement in demo mode
- compatible bytecode target (`paris`) retained for later funded deployment

### Filecoin

- simulated CID generation in demo mode
- live Filecoin Pin CLI retained behind `MOCK_MODE=false`

### ENS

- forward resolution in backend
- ENS surface in the dashboard

### Self Protocol

- auto-verified simulated sessions in demo mode
- live QR verification retained behind `MOCK_MODE=false`

### EigenCompute

- simulated TEE receipts in demo mode
- deployable container retained for later live use

### Venice

- local heuristic planner in demo mode
- live Venice adapter retained behind `MOCK_MODE=false`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Review the local runtime file:

```bash
.env.local
```

3. Keep `MOCK_MODE=true` for the quick simulated flow, or set `MOCK_MODE=false` for live integrations.

4. Compile and test contracts:

```bash
npm run compile --workspace contracts
npm run test --workspace contracts
```

5. Start the backend:

```bash
npm run dev --workspace backend
```

6. Start the frontend:

```bash
npm run dev --workspace frontend
```

7. Use the CLI agent if you want a terminal entrypoint:

```bash
npm run start --workspace agent -- "Resolve vitalik.eth"
```

## Deployment Commands

Base Sepolia:

```bash
npm run deploy:base-sepolia --workspace contracts
```

Ethereum Sepolia:

```bash
npm run deploy:sepolia --workspace contracts
```

Status Sepolia:

```bash
npm run deploy:status-sepolia --workspace contracts
```

## Demo Flow

1. Start the backend and frontend with the default mock mode.
2. Click `New Session` to auto-verify a simulated Self session.
3. Click `Simulate Wallet` to generate mock MetaMask smart account and permission payloads.
4. Execute intents from the dashboard or `agent/agent.js`.
5. Inspect simulated tx hashes, mock CIDs, and mock TEE receipts in the dashboard and `agent_log.json`.

For a judge-facing talk track, use `DEMO_SCRIPT.md`.

## Live Mode Requirements

- Base Sepolia deployment needs a funded owner wallet.
- Status Sepolia deployment needs a funded owner wallet.
- Filecoin uploads need `FILECOIN_PRIVATE_KEY`.
- Venice reasoning needs `VENICE_API_KEY`.
- Self verification needs `SELF_SCOPE` and `SELF_ENDPOINT`.
- EigenCompute verification needs `EIGENCOMPUTE_URL`.

## Verification Summary

- `npm run compile --workspace contracts`
- `npm run test --workspace contracts`
- `npm run build --workspace frontend`
- backend smoke-tested with `GET /api/dashboard`
