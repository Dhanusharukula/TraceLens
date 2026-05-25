const express = require("express");
const router = express.Router();
const db = require("../db/database");

router.post("/", (req, res) => {
  const { question } = req.body;

  db.get(
    "SELECT * FROM logs ORDER BY timestamp DESC LIMIT 1",
    [],
    (err, latestLog) => {
      if (err || !latestLog) {
        return res.json({
          answer: "No incident data available."
        });
      }

      const q = question.toLowerCase();

      let answer = "";

      if (q.includes("payment")) {
        answer =
          "The /payment endpoint is failing because payment gateway or external transaction service is timing out or overloaded.";
      } else if (q.includes("search")) {
        answer =
          "The /search endpoint failures indicate database query overload or rate limiting due to high traffic.";
      } else if (q.includes("login")) {
        answer =
          "The /login endpoint failures suggest authentication token issues, expired sessions, or auth service downtime.";
      } else if (q.includes("profile")) {
        answer =
          "The /profile endpoint may be failing because user session validation or database lookup is failing.";
      } else if (q.includes("latency")) {
        answer =
          "Latency spikes suggest backend resource exhaustion, slow downstream APIs, or temporary traffic surges.";
      } else {
        answer = `Based on latest incident (${latestLog.endpoint}), likely issue: ${latestLog.error}. Recommended investigation required.`;
      }

      res.json({ answer });
    }
  );
});

module.exports = router;