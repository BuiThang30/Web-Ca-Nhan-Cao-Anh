const listBox = $("#list");
const articleBox = $("#article");

function renderList() {
  listBox.innerHTML = "";

  BLOG_POSTS.forEach((post) => {
    const link = document.createElement("a");
    link.className = "blog-item";
    link.href = "/blog#" + post.id;
    link.textContent = post.title;
    listBox.appendChild(link);
  });
}

function route() {
  const post = BLOG_POSTS.find((item) => item.id === location.hash.slice(1));

  listBox.hidden = !!post;
  articleBox.hidden = !post;
  document.title = (post ? post.title : "Blog") + " - Healseer";

  if (post) {
    $("#articleTitle").textContent = post.title;
    $("#articleBody").innerHTML = post.html;
  }

  window.scrollTo(0, 0);
}

function onSearch(text) {
  const query = text.toLowerCase();
  const found = BLOG_POSTS.find((post) => post.title.toLowerCase().includes(query));
  location.hash = found ? found.id : "";
}

$("#backLink").addEventListener("click", (e) => {
  e.preventDefault();
  location.hash = "";
});

window.addEventListener("hashchange", route);

renderList();
route();