# ZARYNX VAAP is live

Built for Synthesis Hackathon.

ZARYNX VAAP = Verifiable Agent Authority Protocol.

The core idea:
AI agents should not get unlimited backend trust. They should earn bounded execution rights that are enforced by protocol rules and surfaced with verifiable evidence.

What ZARYNX does:
- turns natural language intent into one bounded action at a time
- enforces authority rules through an on-chain `AuthorityManager`
- keeps structured execution evidence in `agent.json` and `agent_log.json`
- supports a full demo flow across identity, execution, logging, and delegated agent control
- runs end-to-end in mock mode when real partner infra is unavailable, so judges can inspect the whole execution path

Project links:
- GitHub: https://github.com/let-the-dreamers-rise/Zarynx-final
- Frontend preview: https://skill-deploy-zisg19ekmy-codex-agent-deploys.vercel.app
- Backend preview: https://skill-deploy-ds8b6zt2a3-codex-agent-deploys.vercel.app
- Synthesis submission: https://synthesis.devfolio.co/projects/zarynx-vaap-c97a

Demo flow:
1. Configure bounded authority
2. Verify operator identity
3. Submit intent
4. Route decision through the agent
5. Execute allowed actions
6. Reject over-limit or revoked actions
7. Surface evidence in logs and dashboard

Would love feedback from builders working on agent trust, delegated execution, identity, on-chain permissions, and verifiable AI systems.
