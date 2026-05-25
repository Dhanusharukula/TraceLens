const db = require("../db/database");

const endpoints = [
  "/login",
  "/payment",
  "/orders",
  "/profile",
  "/search"
];

const errors = [
  {
    message: "Database timeout",
    severity: "critical"
  },
  {
    message: "Auth token expired",
    severity: "medium"
  },
  {
    message: "Payment gateway failure",
    severity: "high"
  },
  {
    message: "Rate limit exceeded",
    severity: "low"
  },
  {
    message: "Service unavailable",
    severity: "high"
  }
];

function generateLog() {
  const endpoint =
    endpoints[Math.floor(Math.random() * endpoints.length)];

  // only 10% failures
  const isFailure = Math.random() < 0.1;

  let status = 200;
  let latency = Math.floor(Math.random() * 300) + 100;
  let error = null;
  let severity = "normal";

  if (isFailure) {
    const randomError =
      errors[Math.floor(Math.random() * errors.length)];

    status = 500;
    latency = Math.floor(Math.random() * 4000) + 1000;
    error = randomError.message;
    severity = randomError.severity;
  }

  db.run(
    `
    INSERT INTO logs
    (timestamp, endpoint, method, status, latency, error, severity)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      new Date().toISOString(),
      endpoint,
      "GET",
      status,
      latency,
      error,
      severity
    ]
  );
}

module.exports = { generateLog };