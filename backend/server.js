const axios = require("axios");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

console.log("🚀 Server file is running...");

// 🔥 ANALYZE API (NEW METHOD)
app.post("/analyze", async (req, res) => {
  console.log("🔥 ANALYZE API HIT");

  try {
    const { repoUrl } = req.body;

    const parts = repoUrl.split("github.com/")[1].split("/");
    const owner = parts[0];
    const repo = parts[1];

    // 🔥 GET FULL REPO TREE
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;

    const treeRes = await axios.get(treeUrl, {
      headers: { "User-Agent": "tech-debt-analyzer" },
    });

    const allFiles = treeRes.data.tree;

    // 🔥 FILTER JS/TS FILES
    const jsFiles = allFiles.filter((file) =>
      file.path.match(/\.(js|ts|jsx|tsx)$/)
    );

    console.log("TOTAL FILES FOUND:", jsFiles.length);

    // 🔥 LIMIT (IMPORTANT)
    const selectedFiles = jsFiles.slice(0, 10);

    // 🔥 FETCH FILE CONTENT
    const results = await Promise.all(
      selectedFiles.map(async (file) => {
        try {
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`;

          const fileData = await axios.get(rawUrl);

          const content = fileData.data;

          const lines = content.split("\n").length;
          const functions = (content.match(/function|=>/g) || []).length;
          const comments = (content.match(/\/\//g) || []).length;

          return {
            file: file.path.split("/").pop(),
            complexity: functions + Math.floor(lines / 10),
            maintainability: Math.max(100 - functions * 5, 20),
            lines,
            functions,
            comments,
          };
        } catch {
          return null;
        }
      })
    );

    const cleanResults = results.filter(Boolean);
console.log("FINAL RESULT SENT:", results);
    res.json(cleanResults);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Failed to analyze repo" });
  }
});

// 🤖 AI INSIGHTS
app.post("/ai-insights", (req, res) => {
  const { metrics } = req.body;

  let suggestions = [];

  if (!metrics || metrics.length === 0) {
    suggestions.push("No data available.");
  } else {
    const avg =
      metrics.reduce((sum, f) => sum + f.complexity, 0) /
      metrics.length;

    if (avg > 10) suggestions.push("⚠️ High complexity detected.");
    if (metrics.some((f) => f.lines > 150))
      suggestions.push("📄 Large files — split modules.");
    if (metrics.some((f) => f.comments < 2))
      suggestions.push("💬 Add comments.");

    if (suggestions.length === 0)
      suggestions.push("✅ Codebase looks clean!");
  }

  res.json({ suggestions });
});

app.listen(5000, () => {
  console.log("✅ Backend running on port 5000");
});