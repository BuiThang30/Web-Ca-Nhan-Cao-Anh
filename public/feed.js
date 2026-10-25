/* Thành phần dùng chung cho Forum và Trang cá nhân */

const SIDE_PAGE = 4;
const COMMENT_PAGE = 5;
const MAX_DOTS = 7;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

let avatarVersion = Date.now();

function makeAvatar(name, hasImage) {
  const box = el("div", "avatar", (name || "?").trim().charAt(0).toUpperCase());

  if (hasImage) {
    const image = document.createElement("img");
    image.alt = name;
    image.src = "/api/avatar/" + encodeURIComponent(name) + "?v=" + avatarVersion;
    image.onerror = () => image.remove();
    box.appendChild(image);
  }

  return box;
}

function timeText(ms) {
  return new Date(ms).toLocaleString("vi-VN");
}

/* ---------- Chấm chuyển trang ---------- */
function makeDots(total, current, onGo) {
  const dots = el("div", "dots");
  if (total <= 1) return dots;

  const count = Math.min(total, MAX_DOTS);
  const start = Math.min(
    Math.max(current - Math.floor(count / 2), 0),
    total - count
  );

  for (let page = start; page < start + count; page++) {
    const dot = el("button", "dot" + (page === current ? " on" : ""));
    dot.type = "button";
    dot.setAttribute("aria-label", "Trang " + (page + 1));
    dot.onclick = () => onGo(page);
    dots.appendChild(dot);
  }

  return dots;
}

/* ---------- Khung bên phải: bài đăng mới nhất ---------- */
function createSideCard(box, { mine = false, query = "", activeId = null, onPick }) {
  const state = { page: 0, activeId };

  async function load() {
    box.innerHTML = "";
    box.classList.add("loading");

    let data;
    try {
      const params = new URLSearchParams({
        limit: SIDE_PAGE,
        offset: state.page * SIDE_PAGE,
      });
      if (mine) params.set("mine", "1");
      if (query) params.set("q", query);

      data = await api("/api/posts?" + params);
    } catch {
      box.classList.remove("loading");
      box.appendChild(el("div", "empty", "Không tải được bài đăng."));
      return;
    }

    box.classList.remove("loading");

    if (!data.items.length) {
      const text = query ? "Không tìm thấy bài đăng phù hợp." : "Chưa có bài đăng nào.";
      box.appendChild(el("div", "empty", text));
      return;
    }

    data.items.forEach((post, index) => {
      if (index > 0) box.appendChild(el("hr", "side-rule"));

      const item = el("button", "side-item" + (post.id === state.activeId ? " on" : ""));
      item.type = "button";
      item.append(el("h3", "side-name", post.nickname), el("p", "side-text", post.content));

      item.onclick = () => {
        state.activeId = post.id;
        onPick(post);
        load();
      };

      box.appendChild(item);
    });

    const pages = Math.ceil(data.total / SIDE_PAGE);
    box.appendChild(
      makeDots(pages, state.page, (page) => {
        state.page = page;
        load();
      })
    );
  }

  load();

  return {
    reload(newActiveId) {
      if (newActiveId !== undefined) state.activeId = newActiveId;
      state.page = 0;
      load();
    },
    setActive(id) {
      state.activeId = id;
    },
  };
}

/* ---------- Bình luận của một bài đăng ---------- */
function createComments(postId, onCountChange) {
  const wrap = el("div", "comments");
  const form = el("div", "comment-form");
  const list = el("div", "comment-list");
  const pager = el("div", "comment-pager");
  wrap.append(form, list, pager);

  const state = { page: 0 };

  function renderForm() {
    form.innerHTML = "";

    if (!user) {
      const lock = el("button", "comment-input locked", "Đăng nhập để bình luận");
      lock.type = "button";
      lock.onclick = openLogin;
      form.append(lock);
      return;
    }

    if (!user.nickname) {
      const lock = el("button", "comment-input locked", "Đặt biệt danh để bình luận");
      lock.type = "button";
      lock.onclick = openAccount;
      form.append(lock);
      return;
    }

    const input = el("input", "comment-input");
    input.placeholder = "Viết bình luận...";
    input.maxLength = 1000;
    input.autocomplete = "off";

    const send = el("button", "send-btn", "Gửi");
    send.type = "button";

    const error = el("div", "form-err");

    async function submit() {
      const content = input.value.trim();
      if (!content) return;

      send.disabled = true;

      try {
        await api(`/api/posts/${postId}/comments`, { method: "POST", body: { content } });
        input.value = "";
        error.textContent = "";
        state.page = 0;
        await loadList();
        if (onCountChange) onCountChange();
      } catch (e) {
        error.textContent = e.message;

        if (e.status === 401) {
          user = null;
          refreshAuthUI();
        }
      }

      send.disabled = false;
    }

    send.onclick = submit;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit();
    });

    const row = el("div", "comment-row");
    row.append(makeAvatar(user.nickname, user.hasAvatar), input, send);
    form.append(row, error);
  }

  async function loadList() {
    let data;
    try {
      data = await api(
        `/api/posts/${postId}/comments?limit=${COMMENT_PAGE}&offset=${state.page * COMMENT_PAGE}`
      );
    } catch {
      list.replaceChildren(el("div", "empty", "Không tải được bình luận."));
      return;
    }

    list.innerHTML = "";

    if (!data.items.length) {
      list.appendChild(el("div", "empty", "Chưa có bình luận nào."));
    }

    data.items.forEach((item) => {
      const row = el("div", "comment");
      const bubble = el("div", "bubble");
      const meta = el("div", "comment-meta");

      meta.append(el("strong", "", item.nickname), el("span", "time", timeText(item.created_at)));
      bubble.append(meta, el("p", "", item.content));
      row.append(makeAvatar(item.nickname, item.has_avatar), bubble);
      list.appendChild(row);
    });

    const pages = Math.ceil(data.total / COMMENT_PAGE);
    pager.replaceChildren(
      makeDots(pages, state.page, (page) => {
        state.page = page;
        loadList();
      })
    );
  }

  const onAuth = () => {
    if (wrap.isConnected) {
      renderForm();
    } else {
      document.removeEventListener("auth-change", onAuth);
    }
  };
  document.addEventListener("auth-change", onAuth);

  renderForm();
  loadList();

  return wrap;
}

/* ---------- Bài đăng dạng thẻ ở danh sách: nội dung + ô bình luận + bình luận mới nhất ---------- */
const PREVIEW_COMMENTS = 1;

function sortCommentsNewest(list) {
  return list.slice().sort((a, b) => {
    if (a.id != null && b.id != null) return b.id - a.id;
    return (Number(b.created_at) || Date.parse(b.created_at) || 0) - (Number(a.created_at) || Date.parse(a.created_at) || 0);
  });
}

// onOpen(post): gọi khi bấm tên/nội dung/"Xem tất cả" để mở trang chi tiết
function createFeedPost(post, { onOpen } = {}) {
  const card = el("article", "feed-post");

  const head = el("div", "post-head fp-click");
  head.append(makeAvatar(post.nickname, post.has_avatar), el("h2", "post-name", post.nickname || "USER"));

  const body = el("p", "post-body fp-click", post.content);

  if (onOpen) {
    head.onclick = () => onOpen(post);
    body.onclick = () => onOpen(post);
  }

  const row = el("div", "fp-comment-row");
  const error = el("div", "form-err fp-err");
  const list = el("div", "fp-comments");

  async function loadList() {
    let items = [];
    try {
      const data = await api(`/api/posts/${post.id}/comments?limit=500`);
      items = sortCommentsNewest(data.items || []);
    } catch {
      list.replaceChildren();
      return;
    }

    list.replaceChildren();

    items.slice(0, PREVIEW_COMMENTS).forEach((item) => {
      const bubble = el("div", "fp-comment-body");
      bubble.appendChild(el("p", "", item.content));

      const main = el("div", "fp-comment-main");
      main.append(el("div", "fp-comment-name", item.nickname || "USER"), bubble);

      const comment = el("div", "fp-comment");
      const avatar = makeAvatar(item.nickname, item.has_avatar);
      avatar.classList.add("sm");
      comment.append(avatar, main);
      list.appendChild(comment);
    });

    if (items.length > PREVIEW_COMMENTS && onOpen) {
      const more = el("button", "fp-more", `Xem tất cả ${items.length} bình luận`);
      more.type = "button";
      more.onclick = () => onOpen(post);
      list.appendChild(more);
    }
  }

  function renderRow() {
    row.innerHTML = "";
    error.textContent = "";

    const wrap = el("div", "fp-input-wrap");
    const avatar = makeAvatar(user?.nickname || "?", !!user?.hasAvatar && !!user?.nickname);
    avatar.classList.add("sm");

    if (!user || !user.nickname) {
      const lock = el("button", "", user ? "Đặt biệt danh để bình luận" : "Đăng nhập để bình luận");
      lock.type = "button";
      lock.onclick = user ? openAccount : openLogin;
      wrap.appendChild(lock);
      row.append(avatar, wrap);
      return;
    }

    const input = el("input", "fp-input");
    input.placeholder = "Comment";
    input.maxLength = 1000;
    input.autocomplete = "off";

    input.addEventListener("keydown", async (e) => {
      if (e.key !== "Enter" || e.isComposing) return;
      e.preventDefault();

      const content = input.value.trim();
      if (!content) return;

      input.disabled = true;
      try {
        await api(`/api/posts/${post.id}/comments`, { method: "POST", body: { content } });
        input.value = "";
        error.textContent = "";
        await loadList(); // bình luận mới nằm trên cùng
      } catch (err) {
        error.textContent = err.message || "Lỗi khi gửi bình luận.";
        if (err.status === 401) {
          user = null;
          refreshAuthUI();
        }
      }
      input.disabled = false;
      input.focus();
    });

    wrap.appendChild(input);
    row.append(avatar, wrap);
  }

  const onAuth = () => {
    if (card.isConnected) {
      renderRow();
    } else {
      document.removeEventListener("auth-change", onAuth);
    }
  };
  document.addEventListener("auth-change", onAuth);

  renderRow();
  loadList();

  card.append(head, el("hr", "rule"), body, row, error, list);
  return card;
}

/* ---------- Một bài đăng đầy đủ (avatar, tên, nội dung, bình luận) ---------- */
function createPostView(post) {
  const view = el("article", "post-view");

  const head = el("div", "post-head");
  const who = el("div");
  who.append(el("h2", "post-name", post.nickname), el("div", "time", timeText(post.created_at)));
  head.append(makeAvatar(post.nickname, post.has_avatar), who);

  view.append(
    head,
    el("hr", "rule"),
    el("p", "post-body", post.content),
    el("hr", "rule"),
    createComments(post.id)
  );

  return view;
}