require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "400kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", require("./routers/api"));

app.get("/", (req, res) => {
  res.redirect("/home");
});

app.get("/:page", (req, res) => {
  const page = req.params.page;

  if (!/^[a-zA-Z0-9_-]+$/.test(page)) {
    return res.status(404).send("Trang không tồn tại!");
  }

  const filePath = path.join(__dirname, "public", `${page}.html`);

  res.sendFile(filePath, (err) => {
    if (err && !res.headersSent) {
      res.status(404).send("Trang không tồn tại!");
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Lỗi máy chủ." });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});