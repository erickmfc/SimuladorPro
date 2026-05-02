import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Proxy for Football Data
  app.get("/api/football/:endpoint(*)", async (req, res) => {
    const endpoint = req.params.endpoint;
    const query = req.url.split("?")[1] || "";
    const url = `https://v3.football.api-sports.io/${endpoint}${query ? "?" + query : ""}`;

    if (!API_FOOTBALL_KEY) {
      console.warn("API_FOOTBALL_KEY not set. Serving empty or fallback will be handled by client.");
      return res.status(503).json({ error: "API Key not configured" });
    }

    try {
      const response = await fetch(url, {
        headers: {
          "x-rapidapi-key": API_FOOTBALL_KEY,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error proxying football API:", error);
      res.status(500).json({ error: "Failed to fetch football data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
