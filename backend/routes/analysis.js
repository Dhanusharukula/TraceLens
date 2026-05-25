const express = require("express");
const router = express.Router();
const db = require("../db/database");
const { analyzeLog } = require("../services/detector");
const { sendIncidentEmail } = require("../services/emailer");

let lastEmailTime = 0;

router.get("/", async (req, res) => {
  db.get(
    "SELECT * FROM logs WHERE status >= 500 ORDER BY timestamp DESC LIMIT 1",
    [],
    async (err, row) => {
      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      if (!row) {
        return res.json({
          rootCause: "No incidents detected.",
          suggestion: "System healthy."
        });
      }

      const analysis = await analyzeLog(row);

      // send response immediately
      res.json({
        incident: row,
        ...analysis
      });

      // email in background
      const now = Date.now();

      if (
        row.severity === "critical" &&
        now - lastEmailTime > 30000
      ) {
        lastEmailTime = now;

        sendIncidentEmail(row, analysis).catch((err) =>
          console.log("Email error:", err.message)
        );
      }
    }
  );
});

module.exports = router;