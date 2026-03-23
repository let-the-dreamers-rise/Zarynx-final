const express = require("express");
const agentService = require("../services/agent-service");

const router = express.Router();

router.post("/plan", async (req, res, next) => {
  try {
    res.json(await agentService.planIntent(req.body));
  } catch (error) {
    next(error);
  }
});

router.post("/execute", async (req, res, next) => {
  try {
    res.json(await agentService.executeIntent(req.body));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
