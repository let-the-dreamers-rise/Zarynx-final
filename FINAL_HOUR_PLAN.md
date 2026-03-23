# ZARYNX Final Hour Plan

## What is already real

- Synthesis project is published: `https://synthesis.devfolio.co/projects/zarynx-vaap-c97a`
- Moltbook post is live: `https://www.moltbook.com/post/12c2b1f0-4700-4a1e-a5a9-cc81931b98e8`
- Public demo is live: `https://skill-deploy-hxmacndaqk-codex-agent-deploys.vercel.app`
- Status Sepolia gasless authority proof is live:
  - contract: `0x6DB5C52b5146d278c1cb158832659EF562382013`
  - deploy tx: `0xd301899d35ccd629db9823359121f297633cc2ade81007ca5428d1997cd069dc`
  - execute tx: `0x4e07ac649efe5831bd0152832f7dc754a5984c5c94156d5138cbdcf23533f25d`
  - revoke tx: `0xd18c27ad245f96bc36d1f21d37d664c8585c26fabbe29a60a3f0106201f441f5`
  - blocked tx after revoke: `0x7a7cc0804f334b239b10d184de196499412f00a2d6e3b8450461867c1a2702f5`
- Locus wallet was created for the project:
  - wallet id: `b35bd016-e9cf-408d-9e74-5a97d7e76b8c`
  - wallet address: `0x9f6ec1480cbc88ac4697a9acb8024f751e5bf89a`
  - credit request id: `f661941a-1b96-4079-b33c-c28aea60a6e7`
- ENS resolution is already captured:
  - `vitalik.eth -> 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`

These proof points are recorded in `agent.json`, `agent_log.json`, the published Synthesis record, and the Moltbook post.

## Best remaining real integrations in 60 minutes

### 1. Base Sepolia + ERC-8004

This is now the highest-ROI remaining proof because the Status lane is already live.

Why it matters:
- directly improves Protocol Labs ERC-8004 scoring
- gives you real onchain proof for the authority layer, not just the manifest
- strengthens the Open Track story because the operator/agent model becomes verifiable onchain

What you need:
- Base Sepolia ETH on `0x2aF9Bd8b228012A7d9bbF8f3daBF6B222a9d8f51`

Commands:

```bash
npm run deploy:base-sepolia --workspace contracts
```

Then register the agent manifest through the registry route and capture the tx hash.

### 2. MetaMask Delegations

This is worth doing only if your browser wallet already supports the execution permission methods.

Why it matters:
- meaningful fit for the MetaMask track
- visually strong in a live demo
- pairs well with bounded authority because the operator delegates a constrained right instead of trusting backend code

What you need:
- local frontend running with a browser that has MetaMask
- a wallet that supports:
  - `wallet_getSupportedExecutionPermissions`
  - `wallet_requestExecutionPermissions`

The current frontend already has a real-capable path in `frontend/components/MetaMaskSmartAccountCard.js`.

### 3. Locus payment settlement

Do this only if the Locus wallet gets funded or the credit request clears in time.

Why it matters:
- Locus is mandatory and already partially real in this repo
- one real payment would convert a strong integration into a fully judge-proof one

Current blocker:
- Locus wallet balance is still `0.0 USDC`
- credit request status is still `PENDING`

## Do not spend the last hour on these unless credentials appear immediately

- Venice: no `VENICE_API_KEY`
- Self: no `SELF_SCOPE` and no `SELF_ENDPOINT`
- Filecoin: no `FILECOIN_PRIVATE_KEY`
- EigenCompute: no live EigenCompute endpoint

These can still be described architecturally, but they are not the best final-hour betting market from the current machine state.

## Recommended attack order

1. Fund Base Sepolia and land one real authority or ERC-8004 transaction.
2. Demo MetaMask delegations live from the local frontend if the wallet methods are supported.
3. Keep Locus in the talk track as an already-live wallet integration, and upgrade it to a real payment only if funding clears.
4. Do not revisit Status unless you want to add contract funding for a nonzero transfer demo.
