import React, { useState } from "react";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function App() {
  const [repo, setRepo] = useState("");
  const [data, setData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeRepo = async () => {
    try {
      setLoading(true);
      setError("");
      setData([]);
      setInsights([]);

      console.log("🚀 Calling backend...");

      const res = await fetch(
        "https://backend-gsxw.onrender.com/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ repoUrl: repo }),
        }
      );

      const result = await res.json();
      console.log("📦 Data:", result);

      setData(result);

      const ai = await fetch(
        "https://backend-gsxw.onrender.com/ai-insights",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metrics: result }),
        }
      );

      const aiResult = await ai.json();
      setInsights(aiResult.suggestions);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to analyze repo. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: data.map((d) => d.file),
    datasets: [
      {
        label: "Complexity",
        data: data.map((d) => d.complexity),
        backgroundColor: "#3b82f6",
      },
      {
        label: "Maintainability",
        data: data.map((d) => d.maintainability),
        backgroundColor: "#22c55e",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "#fff" },
      },
    },
    scales: {
      x: {
        ticks: { color: "#fff" },
      },
      y: {
        ticks: { color: "#fff" },
      },
    },
  };

  return (
    <div
      style={{
        padding: "30px",
        background: "#0f172a",
        color: "white",
        minHeight: "100vh",
        fontFamily: "Arial",
      }}
    >
      <h1>🚀 Technical Debt Visualizer</h1>

      {/* INPUT */}
      <div style={{ marginBottom: "20px" }}>
        <input
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          placeholder="Enter GitHub Repo URL"
          style={{
            padding: "10px",
            width: "320px",
            marginRight: "10px",
            borderRadius: "6px",
            border: "none",
          }}
        />

        <button
          onClick={analyzeRepo}
          style={{
            padding: "10px 16px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Analyze
        </button>
      </div>

      {/* LOADING */}
      {loading && <p>⏳ Analyzing repo...</p>}

      {/* ERROR */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* RESULTS */}
      {data.length > 0 && (
        <>
          <h2>📊 Results</h2>

          <div
            style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            <Bar data={chartData} options={chartOptions} />
          </div>

          {/* FILE CARDS */}
          <div style={{ display: "grid", gap: "10px" }}>
            {data.map((item, i) => (
              <div
                key={i}
                style={{
                  background: "#1e293b",
                  padding: "15px",
                  borderRadius: "8px",
                }}
              >
                <p>
                  <b>{item.file}</b>
                </p>
                <p>📈 Complexity: {item.complexity}</p>
                <p>🛠 Maintainability: {item.maintainability}</p>
                <p>📄 Lines: {item.lines}</p>
                <p>🔧 Functions: {item.functions}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* AI INSIGHTS */}
      {insights.length > 0 && (
        <div
          style={{
            marginTop: "30px",
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h2>🤖 AI Insights</h2>

          {insights.map((s, i) => (
            <p key={i}>• {s}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;