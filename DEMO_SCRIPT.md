# ZARYNX Judge Demo Script

## 30-second opener

"ZARYNX VAAP stands for Verifiable Agent Authority Protocol. The core idea is simple: AI agents should not receive unlimited backend trust. They should receive bounded execution rights that are identity-linked, revocable, and enforceable through protocol rules. In ZARYNX, the operator expresses intent in natural language, the agent converts that into one structured action, and the execution layer either allows or rejects that action based on authority constraints."

## 4-5 minute demo

### 1. Start with the proof package

Open:
- `README.md`
- `agent.json`
- `agent_log.json`
- the published Synthesis page

Say:

"This project is built as a verifiable proof package. The architecture, manifest, execution logs, public submission, and live demo are all available for inspection. Judges can verify both the control plane and the evidence layer."

### 2. Explain the bounded authority model

Open the live demo:
- `https://skill-deploy-hxmacndaqk-codex-agent-deploys.vercel.app`

Say:

"The operator does not give the agent unlimited power. The agent is expected to act through an `AuthorityManager` policy surface that defines who the agent is, what targets are allowed, and how much value can move per action. The important property here is bounded authority, not backend trust."

### 3. Show the agent loop

In the dashboard, walk through:
- intent input
- structured plan
- execution result
- log table

Say:

"ZARYNX takes natural language, turns it into a structured action, then routes that action through identity and authority checks. Every step is written back to structured receipts so both humans and machines can audit what happened."

### 4. Show one allowed action

Use the intent:

`Resolve vitalik.eth`

Say:

"Here the agent resolves an ENS name to an execution address. ENS is not cosmetic in this project. It is part of the execution path and the operator UX, so human-readable identity feeds directly into safer action routing."

### 5. Show one bounded action and one rejection

Use the intents:

`Send 0.00005 ETH to vitalik.eth on Status Sepolia`

then

`Send 1 ETH to vitalik.eth on Status Sepolia`

Say:

"This is the key behavior. A valid bounded action goes through the authority lane. But when the requested amount exceeds the permitted window, the agent does not get to improvise. The action is rejected, and the rejection itself is logged as evidence."

### 6. Show the receipts and partner story

Open `agent_log.json` and point to:
- Locus wallet registration
- Locus credit request
- ENS resolution
- Status execution lane
- ERC-8004 registration flow
- Filecoin upload flow

Say:

"The project is organized around receipts. The agent manifest lives in `agent.json`, the execution history lives in `agent_log.json`, and the public submission includes the live demo plus the Moltbook post. That gives judges a unified trail across code, UX, and evidence."

### 7. Close with the protocol thesis

Say:

"The point of ZARYNX is not just to make agents act. It is to make agent authority legible, bounded, and revocable. That is the missing trust primitive for autonomous systems that touch money, APIs, and onchain state."

## 90-second lightning version

"ZARYNX gives AI agents bounded execution rights instead of unlimited backend trust. The operator submits natural-language intent, the agent emits a structured action, and the authority layer decides whether that action is permitted. ENS is part of the execution path, Locus handles payment rails, ERC-8004 provides agent receipts and manifest structure, and every result is written to machine-readable logs. The strongest product behavior is not the success case. It is the rejection case. When the agent tries to exceed its authority, the action is denied and logged. That is what makes the system trustworthy."

## Track mapping

- `Synthesis Open Track`: bounded authority as the core protocol primitive
- `Locus`: agent wallet creation and payment rail integration
- `MetaMask Delegations`: bounded operator-to-agent execution rights
- `ERC-8004`: `agent.json` + `agent_log.json` + identity registry flow
- `Status Network`: gasless bounded agent execution lane
- `Filecoin`: persistent evidence storage for logs and manifests
- `Self`: identity-gated operator authorization
- `ENS`: human-readable targets in planning and execution
- `EigenCompute`: verifiable off-chain decision execution
- `Venice`: private reasoning path for structured action planning

## Judge Q and A

### What is the core innovation?

"Bounded, inspectable agent authority. The agent is useful without being omnipotent."

### Why is this better than a normal AI agent app?

"Most AI agent apps trust backend code to enforce limits. ZARYNX moves that trust boundary into explicit policy and verifiable receipts."

### Where should a judge verify the system?

- `contracts/AuthorityManager.sol`
- `agent.json`
- `agent_log.json`
- `backend/routes`
- the live Synthesis page
- the live demo URL

### What should we highlight if time is short?

"The thesis, the bounded success path, the rejection path, and the receipt trail."
