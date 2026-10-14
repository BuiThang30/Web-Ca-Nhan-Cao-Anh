/* ---------- Cấu hình phân trang (giống Forum) ---------- */
const myLimit = 3;     // cột trái: bài của tôi
const sideLimit = 4;   // sidebar bên phải

let myOffset = 0;
let myTotal = 0;
let sideOffset = 0;
let sideTotal = 0;
let started = false;

const myPosts = document.querySelector("#myPosts");
const sideCard = document.querySelector("#sideCard");
const postText = document.querySelector("#postText");
const postBtn = document.querySelector("#postBtn");

/* ---------- Helper ---------- */
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function getAvatarHtml(nickname, hasAvatar) {
  if (!nickname) return "";
  if (hasAvatar) {
    return `<img src="/api/avatar/${encodeURIComponent(nickname)}" alt="${esc(nickname)}">`;
  }
  return esc(nickname.charAt(0).toUpperCase());
}

/* ---------- Hộp thoại xác nhận (thay cho confirm/alert của trình duyệt) ---------- */
function confirmBox(message, { title = "Xác nhận", okText = "Xóa", cancelText = "Hủy", danger = true } = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "overlay open";
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <h3></h3>
        <p class="dialog-text"></p>
        <div class="dialog-actions">
          ${cancelText ? `<button class="btn ghost" data-act="cancel"></button>` : ""}
          <button class="btn ${danger ? "danger" : ""}" data-act="ok"></button>
        </div>
      </div>`;

    overlay.querySelector("h3").textContent = title;
    overlay.querySelector(".dialog-text").textContent = message;
    overlay.querySelector('[data-act="ok"]').textContent = okText;
    if (cancelText) overlay.querySelector('[data-act="cancel"]').textContent = cancelText;

    const onKey = (e) => {
      if (e.key === "Escape") close(false);
    };
    function close(result) {
      document.removeEventListener("keydown", onKey);
      overlay.remove();
      resolve(result);
    }

    overlay.addEventListener("click", (e) => {
      const act = e.target.dataset?.act;
      if (e.target === overlay || act === "cancel") close(false);
      else if (act === "ok") close(true);
    });

    document.addEventListener("keydown", onKey);
    document.body.appendChild(overlay);
    overlay.querySelector('[data-act="ok"]').focus();
  });
}

const TRASH_ICON = `
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
`;

/* ---------- 1. Bài đăng của tôi (cột trái, giống Forum) ---------- */
async function loadMine() {
  try {
    const data = await api(`/api/posts?mine=1&limit=${myLimit}&offset=${myOffset}`);
    myTotal = data.total || 0;
    const items = data.items || [];

    // Xóa bài cuối của một trang -> lùi về trang trước
    if (!items.length && myOffset > 0) {
      myOffset = Math.max(0, myOffset - myLimit);
      return loadMine();
    }

    let html = `<div class="feed-container"><div>`;

    if (items.length) {
      items.forEach((post) => {
        html += `
          <div class="clickable-post" data-id="${post.id}">
            <div class="post-head">
              <div class="avatar">${getAvatarHtml(user.nickname, user.hasAvatar)}</div>
              <h2 class="post-name">${esc(user.nickname)}</h2>
              <button class="delete-btn" data-del="${post.id}" title="Xóa bài viết" aria-label="Xóa bài viết">${TRASH_ICON}</button>
            </div>
            <p class="post-body" style="margin-top:12px; text-transform:none;">${esc(post.content)}</p>
          </div>
          <hr class="rule">
        `;
      });
    } else {
      html += `<div class="empty" style="text-transform:none; font-family:var(--font-body);">Bạn chưa đăng bài nào.</div>`;
    }

    html += `</div>`;

    const totalPages = Math.ceil(myTotal / myLimit);
    if (totalPages > 1) {
      const currentPage = Math.floor(myOffset / myLimit);
      html += `<div class="dots">`;
      for (let i = 0; i < totalPages; i++) {
        html += `<button class="dot ${i === currentPage ? "active" : ""}" data-page="${i}"></button>`;
      }
      html += `</div>`;
    }

    html += `</div>`;
    myPosts.innerHTML = html;

    // Bấm vào bài -> sang trang tương ứng bên Forum
    myPosts.querySelectorAll(".clickable-post").forEach((el) => {
      el.onclick = () => {
        location.href = `/forum?post=${el.dataset.id}`;
      };
    });

    // Bấm thùng rác -> xóa bài của mình
    myPosts.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.onclick = async (e) => {
        e.stopPropagation(); // không cho click lan ra để chuyển trang
        if (!(await confirmBox("Bạn có chắc chắn muốn xóa bài viết này không?", { title: "Xóa bài viết" }))) return;

        try {
          await api(`/api/posts/${btn.dataset.del}`, { method: "DELETE" });
          await loadMine();
          sideOffset = 0;
          await loadSide();
        } catch (err) {
          await confirmBox(err.message || "Không thể xóa bài viết.", {
            title: "Lỗi", okText: "Đóng", cancelText: null, danger: false,
          });
        }
      };
    });

    // Chấm phân trang
    myPosts.querySelectorAll(".dot").forEach((dot) => {
      dot.onclick = () => {
        myOffset = Number(dot.dataset.page) * myLimit;
        loadMine();
        window.scrollTo({ top: 0, behavior: "smooth" });
      };
    });
  } catch (e) {
    myPosts.innerHTML = `<div class="empty">${esc(e.message || "Lỗi tải bài viết.")}</div>`;
  }
}

/* ---------- 2. Sidebar (cột phải, giống Forum) ---------- */
async function loadSide() {
  try {
    const data = await api(`/api/posts?mine=1&limit=${sideLimit}&offset=${sideOffset}`);
    sideTotal = data.total || 0;

    let html = `<div class="side-container"><div>`;

    (data.items || []).forEach((post) => {
      html += `
        <div class="side-item" data-id="${post.id}">
          <h4 class="side-name">${esc(post.nickname || "USER")}</h4>
          <p class="side-text" style="text-transform:none;">${esc(post.content)}</p>
        </div>
        <hr class="side-rule">
      `;
    });

    html += `</div>`;

    const totalPages = Math.ceil(sideTotal / sideLimit);
    if (totalPages > 1) {
      const currentPage = Math.floor(sideOffset / sideLimit);
      html += `<div class="dots" style="margin-top:auto;">`;
      for (let i = 0; i < totalPages; i++) {
        html += `<button class="dot ${i === currentPage ? "active" : ""}" data-page="${i}"></button>`;
      }
      html += `</div>`;
    }

    html += `</div>`;
    sideCard.innerHTML = html;

    sideCard.querySelectorAll(".side-item").forEach((el) => {
      el.onclick = () => {
        location.href = `/forum?post=${el.dataset.id}`;
      };
    });

    sideCard.querySelectorAll(".dot").forEach((dot) => {
      dot.onclick = () => {
        sideOffset = Number(dot.dataset.page) * sideLimit;
        loadSide();
      };
    });
  } catch (e) {
    sideCard.innerHTML = '<div class="empty">Trống</div>';
  }
}

async function reloadMine() {
  myOffset = 0;
  sideOffset = 0;
  await loadMine();
  await loadSide();
}

/* ---------- Đăng bài ---------- */
async function submitPost() {
  const content = postText.value.trim();
  const error = document.querySelector("#postErr");

  if (!content) {
    error.textContent = "Hãy nhập nội dung bài đăng.";
    return;
  }

  postBtn.disabled = true;

  try {
    await api("/api/posts", { method: "POST", body: { content } });
    postText.value = "";
    error.textContent = "";
    await reloadMine();
  } catch (e) {
    error.textContent = e.message;
  }

  postBtn.disabled = false;
}

postBtn.onclick = submitPost;
postText.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitPost();
});

/* ---------- Khởi tạo ---------- */
function render() {
  const allowed = !!user?.nickname;
  document.querySelector("#guard").hidden = allowed;
  document.querySelector("#feed").hidden = !allowed;

  if (!allowed) {
    document.querySelector("#guardBtn").textContent = user ? "Đặt biệt danh" : "Đăng nhập";
    return;
  }

  renderMe();

  if (!started) {
    started = true;
    loadMine();
    loadSide();
  }
}

function renderMe() {
  document.querySelector("#meName").textContent = user.nickname;
  document.querySelector("#meAvatar").innerHTML = getAvatarHtml(user.nickname, user.hasAvatar);
}

/* ---------- Đổi ảnh đại diện ---------- */
function toSquareJpeg(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      const size = 256;
      const side = Math.min(image.width, image.height);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      canvas.getContext("2d").drawImage(
        image,
        (image.width - side) / 2, (image.height - side) / 2,
        side, side, 0, 0, size, size
      );

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Không đọc được ảnh."));
    };

    image.src = url;
  });
}

document.querySelector("#avatarFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  const error = document.querySelector("#avatarErr");
  e.target.value = "";

  if (!file) return;
  error.textContent = "";

  try {
    const image = await toSquareJpeg(file);
    const data = await api("/api/avatar", { method: "POST", body: { image } });

    user = data.user;
    renderMe();
    reloadMine();
  } catch (err) {
    error.textContent = err.message;
  }
});

document.querySelector("#guardBtn").onclick = () => (user ? openAccount() : openLogin());

document.addEventListener("auth-change", () => {
  if (user?.nickname && started) {
    renderMe();
    reloadMine();
  } else {
    render();
  }
});

ready.then(render);