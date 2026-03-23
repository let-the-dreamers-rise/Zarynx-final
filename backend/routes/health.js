const express = require("express");
const { config } = require("../config");

const router = express.Router();

router.get("/", async (_req, res) => {
  res.json({
    ok: true,
    protocol: "ZARYNX VAAP",
    port: config.port,
    mockMode: config.mockMode,
    configured: {
      ownerKey: Boolean(config.keys.ownerPrivateKey),
      agentKey: Boolean(config.keys.agentPrivateKey),
      locus: Boolean(config.locus.apiKey),
      venice: Boolean(config.venice.apiKey),
      self: Boolean(config.self.scope && config.self.endpoint),
      filecoin: Boolean(config.filecoin.privateKey),
      eigencompute: Boolean(config.eigencompute.url),
    },
  });
});

module.exports = router;
