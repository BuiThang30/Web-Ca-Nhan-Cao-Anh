const params = new URLSearchParams(location.search);
const query = params.get("q") || "";
const wantedId = Number(params.get("post")) || null;

const postBox = document.querySelector("#postBox");
const sideCard = document.querySelector("#sideCard");

// Cấu hình phân trang cột trái (Main Feed)
const leftLimit = 3;
let leftOffset = 0;
let leftTotal = 0;

// Cấu hình phân trang cột phải (Sidebar)
const rightLimit = 4;
let rightOffset = 0;
let rightTotal = 0;

if (query) {
  const searchInput = document.querySelector("#searchInput");
  if (searchInput) searchInput.value = query;
}

// Hàm hỗ trợ render HTML cho Avatar
function getAvatarHtml(nickname, hasAvatar) {
  if (!nickname) return '';
  if (hasAvatar) {
    return `<img src="/api/avatar/${encodeURIComponent(nickname)}" alt="${nickname}">`;
  }
  return nickname.charAt(0).toUpperCase();
}

// -------------------------------------------------------------------
// 1. TẢI DANH SÁCH BÀI VIẾT (CỘT TRÁI)
// -------------------------------------------------------------------
async function loadMainFeed() {
  try {
    const data = await api(`/api/posts?limit=${leftLimit}&offset=${leftOffset}` + (query ? "&q=" + encodeURIComponent(query) : ""));
    leftTotal = data.total || 0;
    
    // Lấy thông tin User đang đăng nhập
    const myName = (typeof user !== "undefined" && user?.nickname) ? user.nickname : "CHƯA ĐĂNG NHẬP";
    const myHasAvatar = (typeof user !== "undefined" && user?.hasAvatar) ? user.hasAvatar : false;
    const myAvatarHtml = getAvatarHtml(myName, myHasAvatar);

    let html = `
      <div class="create-post-box">
        <div class="post-head">
          <div class="avatar">${myAvatarHtml}</div>
          <h2 class="post-name">${myName}</h2>
        </div>
        <div class="input-wrap">
          <input type="text" id="postInput" placeholder="Ask Somethings">
        </div>
        <div class="composer-action">
          <button id="submitPostBtn">POST</button>
        </div>
        <div id="postErr" class="form-err" style="margin-top: 8px; text-align: right;"></div>
      </div>
      <hr class="rule">
      <div class="feed-container">
        <div>
    `;

    if (data.items && data.items.length > 0) {
      data.items.forEach(post => {
        const authorName = post.nickname || 'USER';
        html += `
          <div class="clickable-post" onclick="goToPost(${post.id})">
            <div class="post-head">
              <div class="avatar">${getAvatarHtml(authorName, post.has_avatar)}</div>
              <h2 class="post-name">${authorName}</h2>
            </div>
            <p class="post-body" style="margin-top:12px; text-transform:none;">${post.content}</p>
          </div>
          <hr class="rule">
        `;
      });
    } else {
      html += `<div class="empty">Chưa có bài đăng nào.</div>`;
    }
    
    html += `</div>`; 

    // Phân trang
    const totalPages = Math.ceil(leftTotal / leftLimit);
    if (totalPages > 1) {
      const currentPage = Math.floor(leftOffset / leftLimit);
      html += `<div class="dots">`;
      for (let i = 0; i < totalPages; i++) {
        html += `<button class="dot ${i === currentPage ? 'active' : ''}" onclick="changeLeftPage(${i})"></button>`;
      }
      html += `</div>`;
    }

    html += `</div>`; 
    postBox.innerHTML = html;

    const submitBtn = document.getElementById("submitPostBtn");
    const postInput = document.getElementById("postInput");
    const postErr = document.getElementById("postErr");

    submitBtn.onclick = async () => {
      if (!user?.nickname) {
        postErr.textContent = "Bạn cần đăng nhập và đặt biệt danh để đăng bài.";
        return;
      }
      const content = postInput.value.trim();
      if (!content) {
        postErr.textContent = "Hãy nhập nội dung bài đăng.";
        return;
      }
      
      submitBtn.disabled = true;
      try {
        await api("/api/posts", { method: "POST", body: { content } });
        postInput.value = "";
        postErr.textContent = "";
        leftOffset = 0; 
        rightOffset = 0;
        await loadMainFeed();
        await loadSidebarFeed();
      } catch (e) {
        postErr.textContent = e.message || "Lỗi khi đăng bài.";
      }
      submitBtn.disabled = false;
    };

    history.replaceState(null, "", "/forum" + (query ? "?q=" + encodeURIComponent(query) : ""));
  } catch (e) {
    postBox.innerHTML = '<div class="empty">Lỗi tải bài viết.</div>';
  }
}

window.changeLeftPage = function(pageIndex) {
  leftOffset = pageIndex * leftLimit;
  loadMainFeed();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// -------------------------------------------------------------------
// 2. TẢI SIDEBAR (CỘT PHẢI)
// -------------------------------------------------------------------
async function loadSidebarFeed() {
  try {
    const data = await api(`/api/posts?limit=${rightLimit}&offset=${rightOffset}` + (query ? "&q=" + encodeURIComponent(query) : ""));
    rightTotal = data.total || 0;

    let html = `<div class="side-container"><div>`;
    
    if (data.items && data.items.length > 0) {
      data.items.forEach(post => {
        const authorName = post.nickname || 'USER';
        html += `
          <div class="side-item" onclick="goToPost(${post.id})">
            <h4 class="side-name">${authorName}</h4>
            <p class="side-text" style="text-transform:none;">${post.content}</p>
          </div>
          <hr class="side-rule">
        `;
      });
    }
    html += `</div>`; 
    
    const totalPages = Math.ceil(rightTotal / rightLimit);
    if (totalPages > 1) {
      const currentPage = Math.floor(rightOffset / rightLimit);
      html += `<div class="dots" style="margin-top:auto;">`;
      for (let i = 0; i < totalPages; i++) {
        html += `<button class="dot ${i === currentPage ? 'active' : ''}" onclick="changeRightPage(${i})"></button>`;
      }
      html += `</div>`;
    }

    html += `</div>`;
    sideCard.innerHTML = html;
  } catch (e) {
    sideCard.innerHTML = '<div class="empty">Trống</div>';
  }
}

window.changeRightPage = function(pageIndex) {
  rightOffset = pageIndex * rightLimit;
  loadSidebarFeed();
}

// -------------------------------------------------------------------
// 3. GIAO DIỆN CHI TIẾT BÀI VIẾT VÀ BÌNH LUẬN
// -------------------------------------------------------------------
const commentLimit = 4; // Số bình luận mỗi trang

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

async function showPostDetail(post) {
  let comments = [];
  try {
    const commentsData = await api(`/api/posts/${post.id}/comments?limit=500`);
    comments = commentsData.items || [];
  } catch (e) {}
  
  const authorName = post.nickname || 'USER';
  
  const myName = (typeof user !== "undefined" && user?.nickname) ? user.nickname : "";
  const myHasAvatar = (typeof user !== "undefined" && user?.hasAvatar) ? user.hasAvatar : false;
  const myAvatarHtml = getAvatarHtml(myName, myHasAvatar);

  const isMine = !!user?.nickname && user.nickname === post.nickname;

  postBox.innerHTML = `
    <!-- Nút Mũi Tên Quay Lại -->
    <div class="back-arrow" onclick="loadMainFeed()" title="Quay lại danh sách">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
    </div>
    
    <div class="post-item detail-view">
      <div class="post-head">
        <div class="avatar">${getAvatarHtml(authorName, post.has_avatar)}</div>
        <h2 class="post-name">${authorName}</h2>
        ${isMine ? `<button class="delete-btn" id="deletePostBtn" title="Xóa bài viết" aria-label="Xóa bài viết">${TRASH_ICON}</button>` : ''}
      </div>
      <p class="post-body" style="margin-top: 12px; text-transform:none;">${post.content}</p>
    </div>
    <hr class="rule">
    
    <!-- Box Bình Luận Mới: Có Avatar và căn giữa -->
    <div class="comment-row" style="margin-bottom: 30px; display: flex; align-items: center; gap: clamp(12px, 1.6vw, 22px);">
      <div class="avatar" style="width: clamp(48px, 6.2vw, 80px); height: clamp(48px, 6.2vw, 80px);">${myAvatarHtml}</div>
      <div style="flex: 1; border: 3px solid var(--green); border-radius: 60px; height: clamp(50px, 6vw, 75px); display: flex; align-items: center; padding: 0 24px;">
        <input type="text" id="newCommentInput" placeholder="Viết bình luận (nhấn Enter để gửi)..." style="width:100%; border:none; outline:none; font-size: clamp(16px, 1.8vw, 20px); background: transparent; color: var(--green); font-family: var(--font-body); text-transform: none;">
      </div>
    </div>
    <div id="commentErr" class="form-err" style="margin-top: -20px; margin-bottom: 20px; padding-left: 80px;"></div>
    
    <!-- Danh sách Comments -->
    <div id="commentListBox"></div>
  `;

  // Vẽ danh sách bình luận theo trang + dot phân trang
  const commentListBox = document.getElementById("commentListBox");
  let commentPage = 0;

  function renderComments() {
    const totalPages = Math.ceil(comments.length / commentLimit);
    if (commentPage > totalPages - 1) commentPage = Math.max(totalPages - 1, 0);
    const pageItems = comments.slice(commentPage * commentLimit, (commentPage + 1) * commentLimit);

    let html = `<div class="comment-list">` + (pageItems.length > 0 ? pageItems.map(cmt => `
      <div class="comment" style="margin-bottom: 20px; display: flex; gap: clamp(12px, 1.6vw, 22px);">
        <div class="avatar" style="width: clamp(48px, 6.2vw, 80px); height: clamp(48px, 6.2vw, 80px);">${getAvatarHtml(cmt.nickname, cmt.has_avatar)}</div>
        <div class="comment-content" style="flex:1; min-width:0;">
          <div class="comment-meta" style="margin-bottom: 6px;"><strong>${cmt.nickname || 'USER'}</strong></div>
          <div style="border: 3px solid var(--green); border-radius: 20px; padding: 15px 24px;">
            <p class="comment-text" style="font-size: clamp(15px, 1.6vw, 20px); font-family: var(--font-body); color: var(--green); margin:0; text-transform: none;">${cmt.content}</p>
          </div>
        </div>
      </div>
    `).join('') : '<p class="muted" style="font-family: var(--font-body); font-size: 18px; text-transform: none;">Chưa có bình luận nào.</p>') + `</div>`;

    if (totalPages > 1) {
      html += `<div class="dots">`;
      for (let i = 0; i < totalPages; i++) {
        html += `<button class="dot ${i === commentPage ? 'active' : ''}" data-page="${i}"></button>`;
      }
      html += `</div>`;
    }

    // Có phân trang -> bọc trong khung cố định chiều cao để không bị nhảy kích cỡ
    commentListBox.innerHTML = totalPages > 1 ? `<div class="comment-box">${html}</div>` : html;
    commentListBox.querySelectorAll(".dot").forEach(btn => {
      btn.onclick = () => {
        commentPage = Number(btn.dataset.page);
        renderComments();
      };
    });
  }

  renderComments();

  // Xóa bài viết (chỉ hiện với chủ bài)
  const deletePostBtn = document.getElementById("deletePostBtn");
  if (deletePostBtn) {
    deletePostBtn.onclick = async () => {
      if (!(await confirmBox("Bạn có chắc chắn muốn xóa bài viết này không?", { title: "Xóa bài viết" }))) return;
      try {
        await api(`/api/posts/${post.id}`, { method: "DELETE" });
        leftOffset = 0;
        rightOffset = 0;
        await loadMainFeed();
        await loadSidebarFeed();
      } catch (err) {
        await confirmBox(err.message || "Không thể xóa bài viết.", {
          title: "Lỗi", okText: "Đóng", cancelText: null, danger: false,
        });
      }
    };
  }

  const commentInput = document.getElementById("newCommentInput");
  const commentErr = document.getElementById("commentErr");
  
  commentInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      if (!user?.nickname) {
        commentErr.textContent = "Bạn cần đăng nhập để bình luận.";
        return;
      }
      const content = commentInput.value.trim();
      if (!content) return;
      
      commentInput.disabled = true;
      try {
        await api(`/api/posts/${post.id}/comments`, { method: "POST", body: { content } });
        showById(post.id); 
      } catch (err) {
        commentErr.textContent = err.message || "Lỗi khi gửi bình luận.";
        commentInput.disabled = false;
      }
    }
  });

  history.replaceState(null, "", "/forum?post=" + post.id + (query ? "&q=" + encodeURIComponent(query) : ""));
}

async function showById(id) {
  try {
    const data = await api("/api/posts/" + id);
    await showPostDetail(data.post);
    return true;
  } catch {
    return false;
  }
}

function goToPost(id) {
  showById(id);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// -------------------------------------------------------------------
// 4. KHỞI CHẠY TRANG
// -------------------------------------------------------------------
async function start() {
  if (wantedId && (await showById(wantedId))) {
  } else {
    await loadMainFeed();
  }
  await loadSidebarFeed();
}

document.addEventListener("auth-change", () => {
  if (!wantedId) { 
    loadMainFeed(); 
  } else {
    showById(wantedId);
  }
});

start();