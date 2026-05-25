async function analyzeLog(log) {
  const error = (log.error || "").toLowerCase();
  const latency = log.latency || 0;
  const endpoint = log.endpoint || "unknown";

  // Database timeout
  if (error.includes("database timeout")) {
    return {
      rootCause: `Database query bottleneck detected on ${endpoint}. Backend queries may be overloaded or missing indexes.`,
      suggestion:
        "Add DB indexing, optimize slow SQL queries, increase connection pool, and monitor query execution time."
    };
  }

  // Payment issues
  if (error.includes("payment gateway")) {
    return {
      rootCause: `External payment provider failure detected on ${endpoint}. Upstream payment processor may be unavailable.`,
      suggestion:
        "Check payment gateway health, retry failed transactions, and implement circuit breaker logic."
    };
  }

  // Rate limiting
  if (error.includes("rate limit")) {
    return {
      rootCause: `API rate limit exceeded on ${endpoint}. Request traffic is higher than allowed threshold.`,
      suggestion:
        "Implement request throttling, caching, exponential backoff, or increase API quota."
    };
  }

  // Auth issues
  if (error.includes("auth token")) {
    return {
      rootCause: `Authentication token validation failed on ${endpoint}. Token may be expired or invalid.`,
      suggestion:
        "Refresh authentication tokens automatically and validate token lifecycle handling."
    };
  }

  // Service unavailable
  if (error.includes("service unavailable")) {
    return {
      rootCause: `Dependent microservice outage detected for ${endpoint}. Downstream service may be offline.`,
      suggestion:
        "Check service health, restart failed containers, and add retry mechanisms."
    };
  }

  // Latency spike
  if (latency > 2000) {
    return {
      rootCause: `High API latency spike detected (${latency} ms) on ${endpoint}.`,
      suggestion:
        "Investigate CPU, memory, DB load, network bottlenecks, and downstream API delays."
    };
  }

  return {
    rootCause: "System operating normally.",
    suggestion: "No immediate action required."
  };
}

module.exports = { analyzeLog };