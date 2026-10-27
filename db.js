const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(process.env.DB_FILE || path.join(__dirname, "healsearch.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const commentColumns = db.prepare("PRAGMA table_info(comments)").all();
if (commentColumns.length && !commentColumns.some((column) => column.name === "post_id")) {
  db.exec("DROP TABLE IF EXISTS comments_old; ALTER TABLE comments RENAME TO comments_old;");
}

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT NOT NULL UNIQUE COLLATE NOCASE,
    nickname   TEXT UNIQUE COLLATE NOCASE,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS posts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname   TEXT NOT NULL COLLATE NOCASE
               REFERENCES users(nickname) ON UPDATE CASCADE ON DELETE CASCADE,
    content    TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS comments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    nickname   TEXT NOT NULL COLLATE NOCASE
               REFERENCES users(nickname) ON UPDATE CASCADE ON DELETE CASCADE,
    content    TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_posts_nickname ON posts(nickname, id DESC);
  CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, id DESC);
`);

/* Thêm cột ảnh đại diện cho bảng users cũ (nếu chưa có) */
const userColumns = db.prepare("PRAGMA table_info(users)").all();
if (!userColumns.some((column) => column.name === "avatar")) {
  db.exec("ALTER TABLE users ADD COLUMN avatar BLOB");
}

const escapeLike = (text) => text.replace(/[\\%_]/g, (char) => "\\" + char);

const POST_SELECT = `
  SELECT p.id, p.nickname, p.content, p.created_at,
         (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
         (SELECT avatar IS NOT NULL FROM users u WHERE u.nickname = p.nickname) AS has_avatar
  FROM posts p`;

const q = {
  userByEmail: db.prepare(
    "SELECT id, email, nickname, avatar IS NOT NULL AS has_avatar FROM users WHERE email = ?"
  ),
  setAvatar: db.prepare("UPDATE users SET avatar = ? WHERE email = ?"),
  avatarOf: db.prepare("SELECT avatar FROM users WHERE nickname = ?"),
  insertUser: db.prepare("INSERT OR IGNORE INTO users (email, created_at) VALUES (?, ?)"),
  setNickname: db.prepare("UPDATE users SET nickname = ? WHERE email = ?"),
  insertPost: db.prepare("INSERT INTO posts (nickname, content, created_at) VALUES (?, ?, ?)"),
  postById: db.prepare(`${POST_SELECT} WHERE p.id = ?`),
  deletePost: db.prepare("DELETE FROM posts WHERE id = ?"),
  insertComment: db.prepare(
    "INSERT INTO comments (post_id, nickname, content, created_at) VALUES (?, ?, ?, ?)"
  ),
  listComments: db.prepare(`
    SELECT c.id, c.nickname, c.content, c.created_at,
           (SELECT avatar IS NOT NULL FROM users u WHERE u.nickname = c.nickname) AS has_avatar
    FROM comments c
    WHERE c.post_id = ? ORDER BY c.id DESC LIMIT ? OFFSET ?`),
  countComments: db.prepare("SELECT COUNT(*) AS total FROM comments WHERE post_id = ?"),
};

module.exports = {
  db,

  upsertUser(email) {
    q.insertUser.run(email, Date.now());
    return q.userByEmail.get(email);
  },

  getUser: (email) => q.userByEmail.get(email),

  setNickname: (email, nickname) => q.setNickname.run(nickname, email),

  setAvatar: (email, buffer) => q.setAvatar.run(buffer, email),

  getAvatar: (nickname) => q.avatarOf.get(nickname)?.avatar || null,

  addPost(nickname, content) {
    return q.insertPost.run(nickname, content, Date.now()).lastInsertRowid;
  },

  getPost: (id) => q.postById.get(id),

  // Bình luận của bài tự bị xóa theo (ON DELETE CASCADE, foreign_keys = ON)
  deletePost: (id) => q.deletePost.run(id),

  listPosts({ search, nickname, limit, offset }) {
    const where = [];
    const params = {};

    if (nickname) {
      where.push("p.nickname = @nickname");
      params.nickname = nickname;
    }

    if (search) {
      where.push("(p.content LIKE @search ESCAPE '\\' OR p.nickname LIKE @search ESCAPE '\\')");
      params.search = `%${escapeLike(search)}%`;
    }

    const clause = where.length ? ` WHERE ${where.join(" AND ")}` : "";

    const items = db
      .prepare(`${POST_SELECT}${clause} ORDER BY p.id DESC LIMIT @limit OFFSET @offset`)
      .all({ ...params, limit, offset });

    const { total } = db.prepare(`SELECT COUNT(*) AS total FROM posts p${clause}`).get(params);

    return { items, total };
  },

  addComment: (postId, nickname, content) =>
    q.insertComment.run(postId, nickname, content, Date.now()),

  listComments(postId, limit, offset) {
    return {
      items: q.listComments.all(postId, limit, offset),
      total: q.countComments.get(postId).total,
    };
  },
};