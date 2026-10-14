const express = require("express");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const store = require("../db");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const DEV_LOGIN = !CLIENT_ID || process.env.ALLOW_DEV_LOGIN === "1";
const oauth = CLIENT_ID ? new OAuth2Client(CLIENT_ID) : null;

const POST_MAX = 2000;
const COMMENT_MAX = 1000;

const router = express.Router();

/* ---------- Phiên đăng nhập (lưu trong RAM) ---------- */
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const sessions = new Map();

const tokenOf = (req) => (req.headers.cookie || "").match(/(?:^|;\s*)hs_sid=([^;]+)/)?.[1];

function startSession(res, email) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { email, exp: Date.now() + SESSION_MS });

  res.setHeader(
    "Set-Cookie",
    `hs_sid=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_MS / 1000}` +
      (process.env.NODE_ENV === "production" ? "; Secure" : "")
  );
}

router.use((req, _res, next) => {
  const session = sessions.get(tokenOf(req));
  if (session && session.exp > Date.now()) req.user = store.getUser(session.email);
  next();
});

/* ---------- Hàm hỗ trợ ---------- */
const publicUser = (user) =>
  user && { email: user.email, nickname: user.nickname, hasAvatar: !!user.has_avatar };

function needLogin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Bạn cần đăng nhập." });
  next();
}

function needNickname(req, res, next) {
  if (!req.user.nickname) {
    return res.status(403).json({ error: "Bạn cần đặt biệt danh trước khi đăng bài hoặc bình luận." });
  }
  next();
}

function nicknameError(value) {
  if (typeof value !== "string") return "Biệt danh không hợp lệ.";

  const nickname = value.trim();
  if (nickname.length < 3 || nickname.length > 20) return "Biệt danh dài từ 3 đến 20 ký tự.";
  if (!/^[\p{L}\p{N}_. -]+$/u.test(nickname)) return "Chỉ dùng chữ, số, dấu cách, _ . -";

  return null;
}

function toInt(value, min, max, fallback) {
  const number = Number.parseInt(value, 10);
  if (Number.isNaN(number)) return fallback;
  return Math.min(Math.max(number, min), max);
}

function readContent(body, max) {
  const content = typeof body.content === "string" ? body.content.trim() : "";
  return content && content.length <= max ? content : null;
}

function findPost(req, res, next) {
  const id = Number(req.params.id);
  const post = Number.isInteger(id) && id > 0 ? store.getPost(id) : null;

  if (!post) return res.status(404).json({ error: "Không tìm thấy bài đăng." });

  req.post = post;
  next();
}

/* ---------- Cấu hình & tài khoản ---------- */
router.get("/config", (_req, res) => {
  res.json({ googleClientId: CLIENT_ID, devLogin: DEV_LOGIN });
});

router.get("/me", (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.post("/auth/google", async (req, res) => {
  if (!oauth) return res.status(400).json({ error: "Chưa cấu hình GOOGLE_CLIENT_ID." });

  try {
    const info = await oauth.getTokenInfo(String(req.body.accessToken || ""));

    if (info.aud !== CLIENT_ID || !info.email || !info.email_verified) {
      throw new Error("invalid");
    }

    const user = store.upsertUser(info.email.toLowerCase());
    startSession(res, user.email);
    res.json({ user: publicUser(user) });
  } catch {
    res.status(401).json({ error: "Đăng nhập Google thất bại." });
  }
});

router.post("/auth/dev", (req, res) => {
  if (!DEV_LOGIN) return res.status(403).json({ error: "Đăng nhập giả lập đã tắt." });

  const email = String(req.body.email || "").trim().toLowerCase();

  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    return res.status(400).json({ error: "Email không hợp lệ." });
  }

  const user = store.upsertUser(email);
  startSession(res, user.email);
  res.json({ user: publicUser(user) });
});

router.post("/logout", (req, res) => {
  sessions.delete(tokenOf(req));
  res.setHeader("Set-Cookie", "hs_sid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
  res.json({ ok: true });
});

router.post("/nickname", needLogin, (req, res) => {
  const error = nicknameError(req.body.nickname);
  if (error) return res.status(400).json({ error });

  try {
    store.setNickname(req.user.email, req.body.nickname.trim());
  } catch (e) {
    if (String(e.code).startsWith("SQLITE_CONSTRAINT")) {
      return res.status(409).json({ error: "Biệt danh này đã có người dùng." });
    }
    throw e;
  }

  res.json({ user: publicUser(store.getUser(req.user.email)) });
});

/* ---------- Ảnh đại diện ---------- */
const AVATAR_MAX = 200 * 1024;

function imageType(buffer) {
  if (buffer.length > 12) {
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
    if (buffer.subarray(0, 4).toString("hex") === "89504e47") return "image/png";
    if (buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP") {
      return "image/webp";
    }
  }
  return null;
}

router.post("/avatar", needLogin, (req, res) => {
  const match = /^data:image\/[a-z]+;base64,([A-Za-z0-9+/=]+)$/.exec(String(req.body.image || ""));
  const buffer = match ? Buffer.from(match[1], "base64") : null;

  if (!buffer || buffer.length > AVATAR_MAX || !imageType(buffer)) {
    return res.status(400).json({ error: "Ảnh không hợp lệ (JPG, PNG hoặc WEBP, tối đa 200KB)." });
  }

  store.setAvatar(req.user.email, buffer);
  res.json({ user: publicUser(store.getUser(req.user.email)) });
});

router.get("/avatar/:nickname", (req, res) => {
  const buffer = store.getAvatar(req.params.nickname);
  const type = buffer && imageType(buffer);

  if (!type) return res.status(404).end();

  res.set({
    "Content-Type": type,
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
  });
  res.send(buffer);
});

/* ---------- Bài đăng ---------- */
router.get("/posts", (req, res) => {
  const mine = req.query.mine === "1";

  if (mine && !req.user?.nickname) {
    return res.status(401).json({ error: "Bạn cần đăng nhập." });
  }

  res.json(
    store.listPosts({
      search: String(req.query.q || "").trim().slice(0, 100),
      nickname: mine ? req.user.nickname : null,
      limit: toInt(req.query.limit, 1, 20, 10),
      offset: toInt(req.query.offset, 0, 100000, 0),
    })
  );
});

router.post("/posts", needLogin, needNickname, (req, res) => {
  const content = readContent(req.body, POST_MAX);

  if (!content) {
    return res.status(400).json({ error: `Bài đăng phải từ 1 đến ${POST_MAX} ký tự.` });
  }

  const id = store.addPost(req.user.nickname, content);
  res.status(201).json({ post: store.getPost(id) });
});

router.get("/posts/:id", findPost, (req, res) => {
  res.json({ post: req.post });
});

/* Xóa bài đăng: chỉ chủ bài mới được xóa */
router.delete("/posts/:id", needLogin, findPost, (req, res) => {
  if (!req.user.nickname || req.post.nickname !== req.user.nickname) {
    return res.status(403).json({ error: "Bạn chỉ có thể xóa bài viết của chính mình." });
  }

  store.deletePost(req.post.id);
  res.json({ ok: true });
});

/* ---------- Bình luận theo bài đăng ---------- */
router.get("/posts/:id/comments", findPost, (req, res) => {
  res.json(
    store.listComments(
      req.post.id,
      toInt(req.query.limit, 1, 20, 5),
      toInt(req.query.offset, 0, 100000, 0)
    )
  );
});

router.post("/posts/:id/comments", needLogin, needNickname, findPost, (req, res) => {
  const content = readContent(req.body, COMMENT_MAX);

  if (!content) {
    return res.status(400).json({ error: `Bình luận phải từ 1 đến ${COMMENT_MAX} ký tự.` });
  }

  store.addComment(req.post.id, req.user.nickname, content);
  res.status(201).json({ ok: true });
});

router.use((_req, res) => {
  res.status(404).json({ error: "Không tìm thấy." });
});

module.exports = router;