require("dotenv").config();
require("./db/database");
const express = require("express");
const cors = require("cors");
const { generateLog } = require("./services/simulator");
const logsRoute = require("./routes/logs");
const metricsRoute = require("./routes/metrics");
const analysisRoute = require("./routes/analysis");
const patternsRoute = require("./routes/patterns");
const askRoute = require("./routes/ask");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/logs", logsRoute);
app.use("/metrics", metricsRoute);
app.use("/analysis", analysisRoute);
app.use("/patterns", patternsRoute);
app.use("/ask", askRoute);

app.get("/", (req, res) => {
  res.send("TraceLens backend running successfully");
});

const PORT = 5000;

setInterval(() => {
  generateLog();
}, 3000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});