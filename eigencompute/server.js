const crypto = require("crypto");
const express = require("express");

const app = express();
const port = Number(process.env.PORT || 8080);
const salt = process.env.EIGENCOMPUTE_SECRET_SALT || "zarynx-vaap";
const attestationHeader = process.env.EIGENCOMPUTE_ATTESTATION_HEADER || "x-eigen-attestation";

app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "zarynx-eigencompute",
  });
});

app.post("/", (req, res) => {
  const payload = JSON.stringify(req.body || {});
  const receipt = crypto.createHash("sha256").update(`${salt}:${payload}`).digest("hex");

  res.setHeader(attestationHeader, receipt);
  res.json({
    verdict: "EXECUTED_IN_CONTAINER",
    receipt,
    receivedAt: new Date().toISOString(),
    payload: req.body || {},
  });
});

app.listen(port, () => {
  console.log(`zarynx-eigencompute listening on ${port}`);
});
