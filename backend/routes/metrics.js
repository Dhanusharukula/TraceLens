const express = require("express");
const router = express.Router();
const db = require("../db/database");

router.get("/", (req, res) => {
  db.all("SELECT * FROM logs", [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    const totalRequests = rows.length;

    const failedRequests = rows.filter(
      (log) => log.status >= 500
    ).length;

    const successfulRequests = rows.filter(
      (log) => log.status === 200
    ).length;

    const avgLatency =
      totalRequests > 0
        ? Math.round(
            rows.reduce((sum, log) => sum + log.latency, 0) /
              totalRequests
          )
        : 0;

    const successRate =
      totalRequests > 0
        ? Math.round((successfulRequests / totalRequests) * 100)
        : 0;

    res.json({
      totalRequests,
      failedRequests,
      successfulRequests,
      avgLatency,
      successRate
    });
  });
});

module.exports = router;