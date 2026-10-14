const screens = {
  pick: $("#pick"),
  ask: $("#ask"),
  result: $("#result"),
};

const state = {
  topic: null,
  answers: [],
};

const LEVEL_CLASS = {
  "cấp cứu": "lv-cap-cuu",
  "cao": "lv-cao",
  "trung bình": "lv-trung-binh",
  "thấp": "lv-thap",
};

function showScreen(name) {
  Object.entries(screens).forEach(([key, element]) => {
    element.classList.toggle("active", key === name);
  });
  window.scrollTo(0, 0);
}

/* ---------- Chọn vấn đề ---------- */
function renderTopics() {
  const box = $("#topics");
  box.innerHTML = "";

  QUIZ.forEach((topic) => {
    const button = document.createElement("button");
    button.className = "topic";
    button.textContent = topic.name;
    button.onclick = () => startTopic(topic.id);
    box.appendChild(button);
  });
}

function startTopic(id) {
  state.topic = QUIZ.find((topic) => topic.id === id);
  state.answers = [];
  renderAsk();
  showScreen("ask");
}

/* ---------- Câu hỏi ---------- */
function isComplete() {
  return state.topic.questions.every((_, index) => state.answers[index]);
}

function updateSubmit() {
  $("#submitBtn").classList.toggle("disabled", !isComplete());
}

function renderHero(topic) {
  const hero = $("#askHero");
  const image = $("#askImg");

  hero.classList.toggle("empty", !topic.image);
  image.alt = topic.name;
  image.onerror = () => hero.classList.add("empty");
  image.onload = () => hero.classList.remove("empty");
  image.src = topic.image || "";
}

function renderAsk() {
  const topic = state.topic;
  $("#askTopic").textContent = topic.name;
  $("#formErr").textContent = "";
  renderHero(topic);

  const box = $("#questions");
  box.innerHTML = "";

  topic.questions.forEach((question, index) => {
    const section = document.createElement("section");
    section.className = "question" + (index % 2 === 1 ? " right" : "");

    const title = document.createElement("h2");
    title.className = "q-title";
    title.textContent = question.title;

    const options = document.createElement("div");
    options.className = "options";
    options.setAttribute("role", "radiogroup");
    options.setAttribute("aria-label", question.title);

    question.options.forEach((option) => {
      const button = document.createElement("button");
      button.className = "option";
      button.type = "button";
      button.textContent = option.text;
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", "false");

      button.onclick = () => {
        state.answers[index] = option.key;

        [...options.children].forEach((item) => {
          const selected = item === button;
          item.classList.toggle("selected", selected);
          item.setAttribute("aria-checked", String(selected));
        });

        section.classList.remove("missing");
        $("#formErr").textContent = "";
        updateSubmit();
      };

      options.appendChild(button);
    });

    section.append(title, options);
    box.appendChild(section);
  });

  updateSubmit();
}

function submitAnswers() {
  const topic = state.topic;
  const sections = $$("#questions .question");
  let firstMissing = null;

  topic.questions.forEach((_, index) => {
    const missing = !state.answers[index];
    sections[index].classList.toggle("missing", missing);
    if (missing && !firstMissing) firstMissing = sections[index];
  });

  if (firstMissing) {
    $("#formErr").textContent = "Vui lòng chọn đáp án cho tất cả các câu hỏi.";
    firstMissing.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  renderResult();
  showScreen("result");
}

/* ---------- Kết quả ---------- */
function findResult(topic, answers) {
  return topic.results.find((result) =>
    result.answers.every((answer, index) => answer === answers[index])
  );
}

function renderResult() {
  const topic = state.topic;
  const result = findResult(topic, state.answers);
  const warnTitle = $("#warnTitle");

  $("#resultTopic").textContent = topic.name;
  $("#resultTitle").textContent = (result || topic.fallback).title;
  $("#advice").textContent = (result || topic.fallback).advice;

  warnTitle.innerHTML = "";

  if (result) {
    const level = document.createElement("span");
    level.className = LEVEL_CLASS[result.level.toLowerCase()] || "";
    level.textContent = result.level;
    warnTitle.append("Cảnh báo: ", level);
  } else {
    warnTitle.textContent = "Lưu ý:";
  }

  $("#callBtn").hidden = result?.level.toLowerCase() !== "cấp cứu";
}

/* ---------- Sự kiện ---------- */
$("#submitBtn").onclick = submitAnswers;
$("#backToPick").onclick = () => showScreen("pick");
$("#backToAsk").onclick = () => showScreen("ask");

renderTopics();