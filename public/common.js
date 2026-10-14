const $ = (selector) => document.querySelector(selector); const $$ = (selector) => [...document.querySelectorAll(selector)];

const open = (selector) => $(selector).classList.add("open");
const close = (selector) => $(selector).classList.remove("open");

async function api(url, { method = "GET", body } = {}) {
  const res = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try { data = await res.json(); } catch {}

  if (!res.ok) {
    const error = new Error(data?.error || "Có lỗi xảy ra.");
    error.status = res.status;
    throw error;
  }
  return data;
}

let user = null;
let config = {};
let tokenClient = null;

/* ---------- Dựng thanh menu và popup dùng chung ---------- */
const NAV_LINKS = [
  { key: "quiz", label: "HealQuiz", href: "/quiz" },
  { key: "forum", label: "Forum", href: "/forum" },
  { key: "blog", label: "Blog", href: "/blog" },
];

const GOOGLE_ICON =
  '<svg width="30" height="30" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';

const SEARCH_ICON =
  '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#007651" stroke-width="3" stroke-linecap="round"><circle cx="14" cy="14" r="9"/><path d="M21 21l8 8"/></svg>';

const MENU_ICON =
  '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>';

function buildChrome() {
  const navElement = document.querySelector("#nav");

  if (navElement) {
    const active = navElement.dataset.active;
    const links = NAV_LINKS.map((link) => {
      const on = link.key === active ? " on" : "";
      return `<a class="pill${on}" href="${link.href}">${link.label}</a>`;
    }).join("");

    navElement.innerHTML = `
      <button class="icon-btn nav-toggle" id="navToggle" aria-label="Menu">${MENU_ICON}</button>
      
      <div class="nav-links" id="navLinks">
        ${links}
        <button class="pill" id="loginBtn">Login</button>
      </div>
      
      <div class="search" id="search">
        <input id="searchInput" type="search" placeholder="Search..." autocomplete="off">
        <button class="icon-btn" id="searchBtn" aria-label="Tìm kiếm">${SEARCH_ICON}</button>
      </div>`;
  }

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div class="overlay" id="loginModal">
      <div class="modal">
        <button class="close" data-close aria-label="Đóng">×</button>
        <h3 class="login-title">Login <span>or</span> Join</h3>
        <div class="title-line"></div>
        <button class="google-btn" id="googleBtn">${GOOGLE_ICON}<span>Login with Google</span></button>
        <div class="err" id="loginErr"></div>
      </div>
    </div>

    <div class="overlay" id="accountModal">
      <div class="modal">
        <button class="close" id="accountClose" aria-label="Đóng">×</button>
        <h3 id="accountTitle">Đổi biệt danh</h3>
        <p class="muted" id="accountHint">Biệt danh sẽ hiển thị khi bạn bình luận.</p>
        <input id="nickInput" maxlength="20" placeholder="Nhập biệt danh" autocomplete="off">
        <div class="err" id="nickErr"></div>
        <button class="btn" id="nickSave">Xác nhận</button>
        <a class="btn ghost profile-link" id="profileLink" href="/profile">Trang cá nhân</a>
        <hr class="divider">
        <button class="btn ghost" id="logoutBtn">Đăng xuất</button>
      </div>
    </div>`
  );
}

buildChrome();

/* ---------- Logic Menu Toggle (Mobile) ---------- */
const navToggle = $("#navToggle");
const navLinks = $("#navLinks");  if (navToggle) { navToggle.addEventListener("click", (e) => { e.stopPropagation(); navLinks.classList.toggle("open"); }); }  /* ---------- Popup Logic ---------- */ $$("[data-close]").forEach((button) => {
  button.onclick = () => button.closest(".overlay").classList.remove("open");
});

$("#accountClose").onclick = () => close("#accountModal");  $$(".overlay").forEach((overlay) => {
  overlay.addEventListener("mousedown", (e) => {
    if (e.target === overlay) overlay.classList.remove("open");
  });
});

/* ---------- Trạng thái đăng nhập ---------- */
function refreshAuthUI() {
  const greeting = user?.nickname ? "Xin chào " + user.nickname : "Login";
  const btn = $("#loginBtn");
  if (btn) {
    btn.textContent = greeting;
    btn.title = greeting;
  }
  document.dispatchEvent(new CustomEvent("auth-change"));
}

function openLogin() {
  $("#loginErr").textContent = "";
  open("#loginModal");
}

function openAccount() {
  const hasNickname = !!user?.nickname;
  $("#accountTitle").textContent = hasNickname ? "Đổi biệt danh" : "Đặt biệt danh";
  $("#accountHint").textContent = hasNickname
    ? "Xin chào " + user.nickname
    : "Hãy đặt biệt danh để tham gia bình luận.";
  $("#nickInput").value = user?.nickname || "";
  $("#nickErr").textContent = "";
  
  // Nút chuyển đến trang cá nhân
  const profileLink = $("#profileLink");
  if (profileLink) {
    profileLink.hidden = !hasNickname || location.pathname === "/profile";
  }

  open("#accountModal");
  setTimeout(() => $("#nickInput").focus(), 50);
}

function afterLogin(loggedInUser) {
  user = loggedInUser;
  close("#loginModal");
  refreshAuthUI();
  if (!user.nickname) openAccount();
}

if ($("#loginBtn")) {
  $("#loginBtn").onclick = () => {
    if (navLinks) navLinks.classList.remove("open"); 
    user ? openAccount() : openLogin();
  };
}

/* ---------- Đăng nhập Google & Demo ---------- */
function loadGoogleScript() {
  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;

  script.onload = () => {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: config.googleClientId,
      scope: "openid email profile",
      callback: async (resp) => {
        if (resp.error) {
          $("#loginErr").textContent = "Đăng nhập Google thất bại.";
          return;
        }
        try {
          const data = await api("/api/auth/google", {
            method: "POST",
            body: { accessToken: resp.access_token },
          });
          afterLogin(data.user);
        } catch (e) {
          $("#loginErr").textContent = e.message;
        }
      },
    });
  };
  document.head.appendChild(script);
}

$("#googleBtn").onclick = async () => {
  $("#loginErr").textContent = "";

  if (config.googleClientId) {
    if (!tokenClient) {
      $("#loginErr").textContent = "Google chưa tải xong, hãy thử lại.";
      return;
    }
    tokenClient.requestAccessToken();
    return;
  }

  const email = prompt("[DEMO] Nhập email Google để giả lập đăng nhập:", "ban@gmail.com");
  if (!email) return;

  try {
    const data = await api("/api/auth/dev", { method: "POST", body: { email } });
    afterLogin(data.user);
  } catch (e) {
    $("#loginErr").textContent = e.message;
  }
};

/* ---------- Biệt danh & đăng xuất ---------- */
async function saveNickname() {
  const value = $("#nickInput").value.trim();
  const error = $("#nickErr");

  if (value.length < 3 || value.length > 20) {
    error.textContent = "Biệt danh dài từ 3 đến 20 ký tự.";
    return;
  }

  if (!/^[\p{L}\p{N}_. -]+$/u.test(value)) {
    error.textContent = "Chỉ dùng chữ, số, dấu cách, _ . -";
    return;
  }

  if (value === user?.nickname) {
    close("#accountModal");
    return;
  }

  try {
    const data = await api("/api/nickname", { method: "POST", body: { nickname: value } });
    user = data.user;
    close("#accountModal");
    refreshAuthUI();
  } catch (e) {
    error.textContent = e.message;
    if (e.status === 401) {
      user = null;
      close("#accountModal");
      refreshAuthUI();
    }
  }
}

$("#nickSave").onclick = saveNickname;

$("#nickInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") saveNickname();
});

$("#logoutBtn").onclick = async () => {
  try { await api("/api/logout", { method: "POST" }); } catch {}
  user = null;
  close("#accountModal");
  refreshAuthUI();
  if (location.pathname === "/profile") location.href = "/forum";
};

/* ---------- Hệ thống Tìm kiếm Toàn Cục ---------- */
const nav = $("#nav");
const searchBox = $("#search");
const searchInput = $("#searchInput");

const SEARCH_INDEX = [
  { id: "vac-xin", title: "Vai trò và cơ chế hoạt động của vắc xin" },
  { id: "benh-pho-bien", title: "Một số căn bệnh phổ biến ở Việt Nam" },
  { id: "paracetamol", title: "Cách sử dụng thuốc giảm đau Paracetamol an toàn" },
  { id: "thoi-quen", title: "Các thói quen hàng ngày tốt cho sức khỏe" },
  { id: "dung-thuoc", title: "Vì sao cần dùng thuốc theo đúng chỉ định?" }
];

let searchDropdown = null;
if (searchBox) {
  searchDropdown = document.createElement("div");
  searchDropdown.className = "search-dropdown";
  searchBox.appendChild(searchDropdown);
}

function renderSearchDropdown(query = "") {
  if (!searchDropdown) return;
  const q = query.toLowerCase().trim();
  const filtered = SEARCH_INDEX.filter(item => item.title.toLowerCase().includes(q));

  if (filtered.length === 0) {
    searchDropdown.innerHTML = '<div class="search-item" style="pointer-events: none; opacity: 0.6;">Không tìm thấy bài viết.</div>';
  } else {
    searchDropdown.innerHTML = filtered.map(item => `
      <a class="search-item" href="/blog#${item.id}">${item.title}</a>
    `).join('');
  }
}

function openSearch() {
  if (!nav || !searchDropdown) return;
  nav.classList.add("searching");
  searchDropdown.classList.add("open");
  if (navLinks) navLinks.classList.remove("open"); 
  renderSearchDropdown(searchInput.value);
  searchInput.focus();
}

if ($("#searchBtn")) {
  $("#searchBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    openSearch();
  });
}

if (searchInput) {
  searchInput.addEventListener("focus", openSearch);
  searchInput.addEventListener("keyup", (e) => {
    renderSearchDropdown(searchInput.value);
    
    // Nếu gõ Enter ở trang không có onSearch, chuyển về trang /forum
    if (e.key === "Enter" && typeof window.onSearch !== "function") {
      location.href = "/forum?q=" + encodeURIComponent(searchInput.value.trim());
    }
  });
}

// Bấm ra ngoài thì đóng các menu đang mở
document.addEventListener("click", (e) => {
  if (navLinks && navLinks.classList.contains("open")) {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove("open");
    }
  }

  if (searchBox && !searchBox.contains(e.target)) {
    if (searchDropdown) searchDropdown.classList.remove("open");
    if (searchInput && searchInput.value.trim() === "") {
      nav.classList.remove("searching");
    }
  }
});

if (searchDropdown) {
  searchDropdown.addEventListener("click", (e) => {
    e.stopPropagation(); 
  });
}

/* ---------- Khởi động chung ---------- */
const ready = (async () => {
  try { config = await api("/api/config"); } catch {}
  try { user = (await api("/api/me")).user; } catch {}

  if (config.googleClientId) loadGoogleScript();
  refreshAuthUI();
})();