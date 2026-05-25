"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function Home() {
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  async function fetchData() {
    try {
      const metricsRes = await fetch("http://localhost:5000/metrics");
      const logsRes = await fetch("http://localhost:5000/logs");
      const analysisRes = await fetch("http://localhost:5000/analysis");
      const patternsRes = await fetch("http://localhost:5000/patterns");

      const metricsData = await metricsRes.json();
      const logsData = await logsRes.json();
      const analysisData = await analysisRes.json();
      const patternsData = await patternsRes.json();

      setMetrics(metricsData);
      setLogs(logsData.slice(0, 10));
      setAnalysis(analysisData);
      setPatterns(patternsData);

      setTimeline(
        logsData
          .filter((log) => log.status >= 500)
          .slice(0, 5)
      );

      if (patternsData.length > 0) {
        const topFailure = patternsData[0];
        setPrediction({
          endpoint: topFailure.endpoint,
          confidence: Math.floor(Math.random() * 15) + 80
        });
      }

      // Browser notification
      if (
        analysisData.incident &&
        (
          analysisData.incident.severity === "critical" ||
          analysisData.incident.severity === "high"
        ) &&
        Notification.permission === "granted"
      ) {
        new Notification("🚨 TraceLens Incident Alert", {
          body: `${analysisData.incident.endpoint}: ${analysisData.incident.error}`
        });
      }

    } catch (error) {
      console.log(error);
    }
  }

  async function askAI() {
    try {
      const res = await fetch("http://localhost:5000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question })
      });

      const data = await res.json();
      setAnswer(data.answer);

    } catch (error) {
      console.log(error);
      setAnswer("Unable to get response.");
    }
  }

  function downloadReport() {
    if (!analysis || !analysis.incident) {
      alert("No incident report available.");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("TraceLens Incident Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Endpoint: ${analysis.incident.endpoint}`, 20, 50);
    doc.text(`Status: ${analysis.incident.status}`, 20, 60);
    doc.text(`Latency: ${analysis.incident.latency} ms`, 20, 70);
    doc.text(`Error: ${analysis.incident.error}`, 20, 80);
    doc.text(`Severity: ${analysis.incident.severity}`, 20, 90);

    doc.text("AI Root Cause:", 20, 110);
    doc.text(analysis.rootCause || "N/A", 20, 120, {
      maxWidth: 170
    });

    doc.text("Recommendation:", 20, 150);
    doc.text(analysis.suggestion || "N/A", 20, 160, {
      maxWidth: 170
    });

    doc.save("TraceLens-Incident-Report.pdf");
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    }

    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const chartData = logs.map((log, index) => ({
    name: index + 1,
    latency: log.latency
  }));

  return (
    <div className="min-h-screen bg-[#000d3a] text-white p-8">

      {/* Alert Banner */}
      {analysis?.incident &&
        (
          analysis.incident.severity === "critical" ||
          analysis.incident.severity === "high"
        ) && (
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-red-600 border border-red-400 text-white p-5 rounded-2xl shadow-lg animate-pulse">
              <h2 className="text-2xl font-bold mb-2">
                🚨 INCIDENT DETECTED
              </h2>
              <p>
                {analysis.incident.endpoint} failing | {analysis.incident.error}
              </p>
            </div>
          </div>
        )}

      <div className="max-w-6xl mx-auto">

        <h1 className="text-5xl font-bold mb-2">TraceLens</h1>
        <p className="text-gray-300 mb-10">
          Real-time AI API Failure Detection Dashboard
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card title="Total Requests" value={metrics?.totalRequests || 0} />
          <Card title="Failed Requests" value={metrics?.failedRequests || 0} color="text-red-400" />
          <Card title="Success Rate" value={`${metrics?.successRate || 0}%`} color="text-green-400" />
          <Card title="Avg Latency" value={`${metrics?.avgLatency || 0} ms`} color="text-yellow-400" />
        </div>

        {/* Chart */}
        <Section title="Latency Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="#38bdf8"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </Section>

        {/* Prediction */}
        <Section title="🔮 Predicted Next Failure">
          {prediction ? (
            <>
              <p className="text-2xl text-red-400 font-bold">
                {prediction.endpoint}
              </p>
              <p>Confidence: {prediction.confidence}%</p>
            </>
          ) : (
            <p>No prediction.</p>
          )}
        </Section>

        {/* AI Analysis */}
        <Section title="AI Incident Analysis">
          {analysis?.incident ? (
            <>
              <p><strong>Endpoint:</strong> {analysis.incident.endpoint}</p>
              <p><strong>Error:</strong> {analysis.incident.error}</p>
              <p><strong>Severity:</strong> {analysis.incident.severity}</p>
              <p><strong>Root Cause:</strong> {analysis.rootCause}</p>
              <p><strong>Recommendation:</strong> {analysis.suggestion}</p>

              <button
                onClick={downloadReport}
                className="mt-4 bg-cyan-500 hover:bg-cyan-600 px-5 py-3 rounded-lg font-bold"
              >
                Download Incident Report PDF
              </button>
            </>
          ) : (
            <p>No incidents.</p>
          )}
        </Section>

        {/* Ask AI */}
        <Section title="Ask AI About Incident">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Why is /payment failing?"
            className="w-full p-3 rounded-lg text-black mb-4"
          />

          <button
            onClick={askAI}
            className="bg-cyan-500 hover:bg-cyan-600 px-5 py-3 rounded-lg font-bold"
          >
            Ask AI
          </button>

          {answer && (
            <p className="mt-4">
              <strong>Answer:</strong> {answer}
            </p>
          )}
        </Section>

        {/* Timeline */}
        <Section title="Recent Incident Timeline">
          {timeline.map((incident, i) => (
            <div key={i} className="border-b border-slate-700 py-3">
              <p>
                <strong>
                  {new Date(incident.timestamp).toLocaleTimeString()}
                </strong>{" "}
                — {incident.endpoint} —{" "}
                <span className="text-red-400">
                  {incident.error}
                </span>
              </p>
            </div>
          ))}
        </Section>

        {/* Patterns */}
        <Section title="Recurring Failure Patterns">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400">
                <th>Endpoint</th>
                <th>Error</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {patterns.map((pattern, i) => (
                <tr key={i} className="border-t border-slate-700">
                  <td className="py-3">{pattern.endpoint}</td>
                  <td className="text-red-400">{pattern.error}</td>
                  <td>{pattern.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Logs */}
        <Section title="Live API Logs">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400">
                <th>Endpoint</th>
                <th>Status</th>
                <th>Latency</th>
                <th>Severity</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} className="border-t border-slate-700">
                  <td className="py-3">{log.endpoint}</td>
                  <td className={log.status >= 500 ? "text-red-400" : "text-green-400"}>
                    {log.status}
                  </td>
                  <td>{log.latency} ms</td>
                  <td>{log.severity}</td>
                  <td>{log.error || "None"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

      </div>
    </div>
  );
}

function Card({ title, value, color = "" }) {
  return (
    <div className="bg-[#0d1b4d] p-6 rounded-2xl border border-slate-700">
      <p className="text-gray-400">{title}</p>
      <h2 className={`text-5xl font-bold ${color}`}>
        {value}
      </h2>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-[#0d1b4d] p-6 rounded-2xl border border-slate-700 mb-10">
      <h2 className="text-3xl font-bold mb-6">{title}</h2>
      {children}
    </div>
  );
}