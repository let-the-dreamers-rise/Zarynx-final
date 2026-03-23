const express = require("express");
const cors = require("cors");
const { config } = require("./config");
const healthRouter = require("./routes/health");
const authorityRouter = require("./routes/authority");
const agentRouter = require("./routes/agent");
const integrationsRouter = require("./routes/integrations");
const erc8004Service = require("./services/erc8004-service");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/health", healthRouter);
app.use("/api/authority", authorityRouter);
app.use("/api/agent", agentRouter);
app.use("/api", integrationsRouter);

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "zarynx-backend",
    message: "ZARYNX VAAP control plane online",
  });
});

app.use((error, _req, res, _next) => {
  res.status(500).json({
    error: error.message,
  });
});

erc8004Service.buildAgentCard();

app.listen(config.port, () => {
  console.log(`ZARYNX backend listening on http://localhost:${config.port}`);
});
