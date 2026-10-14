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