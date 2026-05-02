import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { AIService } from "./src/services/aiService";

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
      
      if (!response.ok) {
        if (response.status === 429) {
          return res.status(429).json({ error: "API Quota Exceeded", status: "RESOURCE_EXHAUSTED" });
        }
        throw new Error(`Upstream API status ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error proxying football API:", error);
      res.status(500).json({ error: "Failed to fetch football data" });
    }
  });

  // AI Endpoints
  app.get("/api/ai/status", async (req, res) => {
    try {
      const status = await AIService.getStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Context error" });
    }
  });

  app.get("/api/ai/banners", async (req, res) => {
    const round = parseInt(req.query.round as string) || 1;
    const force = req.query.force === "true";
    try {
      const banners = await AIService.getMultiAgentBanners(round, force);
      res.json(banners);
    } catch (error) {
      res.status(500).json({ error: "AI Error" });
    }
  });

  app.get("/api/ai/orchestrate", async (req, res) => {
    const desc = req.query.matchDescription as string;
    const force = req.query.force === "true";
    try {
      const result = await AIService.orchestrateMatchContext(desc, force);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "AI Orchestration Error" });
    }
  });

  app.post("/api/ai/verify-players", async (req, res) => {
    const { players, competition, force } = req.body;
    try {
      const verified = await AIService.verifyTopPlayers(players, competition, force);
      res.json(verified);
    } catch (error) {
      res.json(players); // Fallback to original
    }
  });

  app.post("/api/ai/check-schedule", async (req, res) => {
    const { currentSchedule, force } = req.body;
    try {
      const result = await AIService.checkMatchSchedule(currentSchedule, force);
      res.json(result);
    } catch (error) {
      res.json({ updatedSchedule: currentSchedule, changesFound: false });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
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

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }

  return app;
}

const appPromise = startServer();
export default async (req: any, res: any) => {
  const app = await appPromise;
  app(req, res);
};
