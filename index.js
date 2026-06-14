
const express = require("express");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.BYBIT_API_KEY || "";
const API_SECRET = process.env.BYBIT_API_SECRET || "";
const BASE = "https://api.bybit.com";

function signQuery(params) {
  const ts = Date.now().toString();
  const recv = "5000";
  const qs = Object.keys(params).sort().map(k => k + "=" + params[k]).join("&");
  const sig = crypto.createHmac("sha256", API_SECRET).update(ts + API_KEY + recv + qs).digest("hex");
  return { ts, recv, sig, qs };
}

app.get("/klines", async (req, res) => {
  try {
    const symbol = req.query.symbol || "BTCUSDT";
    const interval = req.query.interval || "15";
    const limit = req.query.limit || "200";
    const url = BASE + "/v5/market/kline?category=spot&symbol=" + symbol + "&interval=" + interval + "&limit=" + limit;
    const r = await fetch(url);
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/balance", async (req, res) => {
  try {
    const { ts, recv, sig, qs } = signQuery({ accountType: "UNIFIED" });
    const r = await fetch(BASE + "/v5/account/wallet-balance?" + qs, {
      headers: { "X-BAPI-API-KEY": API_KEY, "X-BAPI-TIMESTAMP": ts, "X-BAPI-RECV-WINDOW": recv, "X-BAPI-SIGN": sig }
    });
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/order", async (req, res) => {
  try {
    const { symbol, side, qty } = req.body;
    const body = JSON.stringify({ category: "spot", symbol, side, orderType: "Market", qty: String(qty) });
    const ts = Date.now().toString();
    const recv = "5000";
    const sig = crypto.createHmac("sha256", API_SECRET).update(ts + API_KEY + recv + body).digest("hex");
    const r = await fetch(BASE + "/v5/order/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-BAPI-API-KEY": API_KEY, "X-BAPI-TIMESTAMP": ts, "X-BAPI-RECV-WINDOW": recv, "X-BAPI-SIGN": sig },
      body
    });
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/ping", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy running on port " + PORT));
