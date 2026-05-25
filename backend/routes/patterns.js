const express = require("express");
const router = express.Router();
const db = require("../db/database");

router.get("/", (req, res) => {
  db.all(
    `
    SELECT
      endpoint,
      error,
      COUNT(*) as count
    FROM logs
    WHERE status >= 500
    GROUP BY endpoint, error
    ORDER BY count DESC
    LIMIT 10
    `,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }

      res.json(rows);
    }
  );
});

module.exports = router;