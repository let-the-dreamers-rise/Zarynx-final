# ZARYNX VAAP Agent Guide

## What the agent does

ZARYNX VAAP is a verifiable execution agent that turns natural-language intent into one bounded action at a time.

The agent:

- parses intent with Venice when `VENICE_API_KEY` is configured, or with the built-in mock planner when `MOCK_MODE=true`
- requires a verified Self session for money-moving actions, or auto-verifies a simulated session in mock mode
- executes on-chain calls through `AuthorityManager`, or simulated authority state in mock mode
- executes Base USDC payments through Locus, or simulated transfer receipts in mock mode
- writes structured evidence to `agent_log.json`

## Available actions

- `resolve_ens`: resolve ENS names for operator-friendly execution targets
- `onchain_transfer`: execute a whitelisted ETH transfer via the Base Sepolia authority contract
- `status_transfer`: execute a whitelisted ETH transfer via the Status Sepolia authority contract
- `locus_transfer`: send Base USDC through Locus
- `register_identity`: register the agent manifest in the ERC-8004-style identity registry
- `upload_log`: upload `agent_log.json` to Filecoin Pin

## Execution flow

1. The operator creates a Self session in the frontend.
2. The operator verifies identity with the Self QR flow.
3. The operator submits an intent through the dashboard or `agent/agent.js`.
4. The backend gathers context:
   authority state, ENS resolution, Locus balance, prior session status.
5. Venice returns structured JSON for the intended action.
6. The backend enforces prerequisites and executes the real integration, or a deterministic simulated integration when `MOCK_MODE=true`.
7. The result is written to `agent_log.json` and surfaced in the dashboard.

## How to interact

- Dashboard: `frontend/pages/index.js`
- Backend API:
  - `POST /api/agent/plan`
  - `POST /api/agent/execute`
  - `GET /api/dashboard`
- CLI:
  - `npm run start --workspace agent -- "Resolve vitalik.eth"`
  - `npm run start --workspace agent -- --plan "Upload the current agent log to Filecoin"`

## Evidence files

- `agent.json`: current agent manifest and integration metadata
- `agent_log.json`: structured execution and evidence trail
- `conversation.txt`: human-agent interaction record
