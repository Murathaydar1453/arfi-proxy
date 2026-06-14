const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

app.get("/klines", async (req, res) => {
  try {
    const r = await axios.get("https://api.coingecko.com/api/v3/coins/bitcoin/ohlc", {
      params: {
        vs_currency: "usd",
        days: "1"
      }
    });
    res.json(r.data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/ping", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy running on port " + PORT));
