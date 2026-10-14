function hasStarted() {
  try {
    return sessionStorage.getItem("hs_started") === "1";
  } catch {
    return false;
  }
}

function enterApp() {
  $("#start").classList.remove("active");
  $("#app").style.display = "block";
  window.scrollTo(0, 0);
}

$("#startBtn").onclick = () => {
  try {
    sessionStorage.setItem("hs_started", "1");
  } catch {}

  enterApp();
  if (user && !user.nickname) openAccount();
};

if (hasStarted()) enterApp();

ready.then(() => {
  if (hasStarted() && user && !user.nickname) openAccount();
});