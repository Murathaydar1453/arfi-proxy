const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

app.get("/klines", async (req, res) => {
  try {
    const symbol = req.query.symbol || "BTCUSDT";
    const interval = req.query.interval || "15";
    const limit = req.query.limit || "200";
    
    const r = await axios.get("https://min-api.cryptocompare.com/data/v2/histominute", {
      params: {
        fsym: "BTC",
        tsym: "USDT",
        limit: limit,
        aggregate: interval
      }
    });
    res.json(r.data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/ping", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy running on port " + PORT));
