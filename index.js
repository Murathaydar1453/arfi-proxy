const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

app.get("/klines", async (req, res) => {
  try {
    const symbol = req.query.symbol || "BTCUSDT";
    const interval = req.query.interval || "15m";
    const limit = req.query.limit || "200";
    const tf = String(interval).match(/^\d+$/) ? interval + "m" : interval;
const r = await axios.get("https://api.binance.com/api/v3/klines", {
      params: { symbol, interval: tf, limit }
    });
    res.json(r.data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/ping", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy running on port " + PORT));
