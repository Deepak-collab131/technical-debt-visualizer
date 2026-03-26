import React, { useState } from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeRepo = async () => {
    try {
      setLoading(true);
      setError("");
      setData(null);

      if (!repoUrl.includes("github.com")) {
        throw new Error("Invalid GitHub URL");
      }

      const parts = repoUrl.split("github.com/")[1].split("/");
      const owner = parts[0];
      const repo = parts[1];

      const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;

      const res = await fetch(url);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to fetch repo");
      }

      const files = result.tree || [];

      const jsFiles = files.filter(f => f.path.endsWith(".js")).length;
      const testFiles = files.filter(f =>
        f.path.toLowerCase().includes("test")
      ).length;
      const totalFiles = files.length;

      // Technical debt score (simple logic)
      const debtScore = Math.min(
        100,
        Math.round(((totalFiles - testFiles) / totalFiles) * 100)
      );

      setData({
        totalFiles,
        jsFiles,
        testFiles,
        debtScore
      });
    } catch (err) {
      console.error(err);
      setError("❌ Invalid repo or API error");
    } finally {
      setLoading(false);
    }
  };

  const chartData = data
    ? {
        labels: ["Total Files", "JS Files", "Test Files"],
        datasets: [
          {
            label: "Project Stats",
            data: [data.totalFiles, data.jsFiles, data.testFiles]
          }
        ]
      }
    : null;

  return (
    <div style={{ fontFamily: "Arial", background: "#0f172a", minHeight: "100vh", color: "white", padding: "30px" }}>
      
      <h1 style={{ textAlign: "center" }}>🚀 Technical Debt Visualizer</h1>

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <input
          type="text"
          placeholder="Enter GitHub repo URL"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          style={{
            width: "400px",
            padding: "12px",
            borderRadius: "8px",
            border: "none"
          }}
        />

        <br /><br />

        <button
          onClick={analyzeRepo}
          style={{
            padding: "12px 25px",
            borderRadius: "8px",
            border: "none",
            background: "#3b82f6",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Analyze
        </button>
      </div>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        {loading && <p>⏳ Analyzing...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      {data && (
        <div
          style={{
            marginTop: "40px",
            background: "#1e293b",
            padding: "20px",
            borderRadius: "12px",
            maxWidth: "600px",
            marginInline: "auto"
          }}
        >
          <h2 style={{ textAlign: "center" }}>📊 Results</h2>

          <p>📁 Total Files: {data.totalFiles}</p>
          <p>📜 JavaScript Files: {data.jsFiles}</p>
          <p>🧪 Test Files: {data.testFiles}</p>

          <h3>⚠️ Technical Debt Score: {data.debtScore}%</h3>

          <div style={{ marginTop: "20px" }}>
            <Bar data={chartData} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;