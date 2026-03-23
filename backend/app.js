const path = require("path");
const express = require("express");
const cors = require("cors");
const healthRouter = require("./routes/health");
const authorityRouter = require("./routes/authority");
const agentRouter = require("./routes/agent");
const integrationsRouter = require("./routes/integrations");
const erc8004Service = require("./services/erc8004-service");

const app = express();
const publicDir = path.join(__dirname, "public");

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/health", healthRouter);
app.use("/api/authority", authorityRouter);
app.use("/api/agent", agentRouter);
app.use("/api", integrationsRouter);
app.use(express.static(publicDir));

app.get("/", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.use((error, _req, res, _next) => {
  res.status(500).json({
    error: error.message,
  });
});

erc8004Service.buildAgentCard();

module.exports = app;
