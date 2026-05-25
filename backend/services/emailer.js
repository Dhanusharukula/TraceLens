const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true,
  maxConnections: 1,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendIncidentEmail(incident, analysis) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `🚨 TraceLens Alert: ${incident.endpoint}`,
    text: `
TraceLens Critical Incident

Endpoint: ${incident.endpoint}
Error: ${incident.error}
Severity: ${incident.severity}
Latency: ${incident.latency} ms

Root Cause:
${analysis.rootCause}

Recommendation:
${analysis.suggestion}
`
  });

  console.log("Email sent");
}

module.exports = { sendIncidentEmail };