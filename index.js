const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.BYBIT_API_KEY || "";
const API_SECRET = process.env.BYBIT_API_SECRET || "";
const BASE = "https://api.bybit.com";

app.get("/klines", async (req, res) => {
  try {
    const symbol = req.query.symbol || "BTCUSDT";
    const interval = req.query.interval || "15";
    const limit = req.query.limit || "200";
    const r = await axios.get(BASE + "/v5/market/kline", {
      params: { category: "linear", symbol, interval, limit }
    });
    res.json(r.data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/ping", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy running on port " + PORT));
