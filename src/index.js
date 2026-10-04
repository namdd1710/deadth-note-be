require("dotenv").config();

const crypto = require("crypto");
const express = require("express");
const { addName, listNames } = require("./db");

const password = process.env.ADD_PASSWORD;
if (!password) {
  console.error("Thiếu ADD_PASSWORD trong file .env");
  process.exit(1);
}

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

function isCorrectPassword(input) {
  const given = Buffer.from(String(input ?? ""), "utf8");
  const expected = Buffer.from(password, "utf8");
  if (given.length !== expected.length) return false;
  return crypto.timingSafeEqual(given, expected);
}

app.get("/names", async (_req, res) => {
  res.json(await listNames());
});

app.post("/names", async (req, res) => {
  const { name, password: givenPassword } = req.body ?? {};

  if (!isCorrectPassword(givenPassword)) {
    res.status(401).json({ error: "Sai mật khẩu" });
    return;
  }

  const trimmed = typeof name === "string" ? name.trim() : "";
  if (!trimmed) {
    res.status(400).json({ error: "Tên không được để trống" });
    return;
  }
  if (trimmed.length > 100) {
    res.status(400).json({ error: "Tên tối đa 100 ký tự" });
    return;
  }

  res.status(201).json(await addName(trimmed));
});

app.use((err, _req, res, next) => {
  if (err.type === "entity.parse.failed") {
    res.status(400).json({ error: "JSON không hợp lệ" });
    return;
  }
  console.error(err);
  if (res.headersSent) {
    next(err);
    return;
  }
  res.status(500).json({ error: "Không ghi được vào database" });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
