const express = require("express");
const crypto = require("crypto");
const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.BYBIT_API_KEY;
const API_SECRET = process.env.BYBIT_API_SECRET;
const BASE = "https://api.bybit.com";

function sign(params) {
  const ts = Date.now().toString();
  const recvWindow = "5000";
  const queryString = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join("&");
  const payload = ts + API_KEY + recvWindow + queryString;
  const signature = crypto.createHmac("sha256", API_SECRET).update(payload).digest("hex");
  return { ts, recvWindow, signature, queryString };
}

app.get("/klines", async (req, res) => {
  try {
    const { symbol = "BTCUSDT", interval = "15", limit = "200" } = req.query;
    const url = `${BASE}/v5/market/kline?category=spot&symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/balance", async (req, res) => {
  try {
    const params = { accountType: "UNIFIED" };
    const { ts, recvWindow, signature, queryString } = sign(params);
    const r = await fetch(`${BASE}/v5/account/wallet-balance?${queryString}`, {
      headers: { "X-BAPI-API-KEY": API_KEY, "X-BAPI-TIMESTAMP": ts, "X-BAPI-RECV-WINDOW": recvWindow, "X-BAPI-SIGN": signature }
    });
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/order", async (req, res) => {
  try {
    const { symbol, side, qty } = req.body;
    const params = { category: "spot", symbol, side, orderType: "Market", qty: qty.toString() };
    const ts = Date.now().toString();
    const recvWindow = "5000";
    const body = JSON.stringify(params);
    const payload = ts + API_KEY + recvWindow + body;
    const signature = crypto.createHmac("sha256", API_SECRET).update(payload).digest("hex");
    const r = await fetch(`${BASE}/v5/order/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-BAPI-API-KEY": API_KEY, "X-BAPI-TIMESTAMP": ts, "X-BAPI-RECV-WINDOW": recvWindow, "X-BAPI-SIGN": signature },
      body
    });
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/positions", async (req, res) => {
  try {
    const params = { category: "spot", limit: "20" };
    const { ts, recvWindow, signature, queryString } = sign(params);
    const r = await fetch(`${BASE}/v5/position/list?${queryString}`, {
      headers: { "X-BAPI-API-KEY": API_KEY, "X-BAPI-TIMESTAMP": ts, "X-BAPI-RECV-WINDOW": recvWindow, "X-BAPI-SIGN": signature }
    });
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
