const express = require("express");
const authorityService = require("../services/authority-service");

const router = express.Router();

router.get("/:network", async (req, res, next) => {
  try {
    res.json(await authorityService.getState(req.params.network));
  } catch (error) {
    next(error);
  }
});

router.get("/:network/executions", async (req, res, next) => {
  try {
    res.json(await authorityService.recentExecutions(req.params.network));
  } catch (error) {
    next(error);
  }
});

router.post("/:network/update", async (req, res, next) => {
  try {
    res.json(
      await authorityService.updateAuthority({
        networkKey: req.params.network,
        newAgent: req.body.newAgent,
        maxSpendEth: req.body.maxSpendEth,
        active: req.body.active,
      })
    );
  } catch (error) {
    next(error);
  }
});

router.post("/:network/target", async (req, res, next) => {
  try {
    res.json(
      await authorityService.setTarget({
        networkKey: req.params.network,
        target: req.body.target,
        allowed: req.body.allowed,
      })
    );
  } catch (error) {
    next(error);
  }
});

router.post("/:network/revoke", async (req, res, next) => {
  try {
    res.json(await authorityService.revoke(req.params.network));
  } catch (error) {
    next(error);
  }
});

router.post("/:network/reactivate", async (req, res, next) => {
  try {
    res.json(await authorityService.reactivate(req.params.network));
  } catch (error) {
    next(error);
  }
});

router.post("/:network/execute", async (req, res, next) => {
  try {
    res.json(
      await authorityService.execute({
        networkKey: req.params.network,
        target: req.body.target,
        amountEth: req.body.amountEth,
        data: req.body.data || "0x",
        reason: req.body.reason || "api-execution",
      })
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
