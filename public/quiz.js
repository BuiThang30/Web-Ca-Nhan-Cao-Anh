const screens = {
  pick: $("#pick"),
  ask: $("#ask"),
  result: $("#result"),
};

const state = {
  topic: null,
  answers: [],
  currentQuestion: 0,
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
  state.currentQuestion = 0;
  renderAsk();
  showScreen("ask");
}

/* ---------- Câu hỏi ---------- */
function isComplete() {
  return !!state.answers[state.currentQuestion];
}

function allAnswered() {
  return state.topic.questions.every((_, i) => !!state.answers[i]);
}

function updateSubmit() {
  // Nút "Gửi" chỉ sáng khi đã trả lời hết; nút "Tiếp" mờ khi câu hiện tại chưa chọn
  const isLast = state.currentQuestion === state.topic.questions.length - 1;
  $("#submitBtn").classList.toggle("disabled", !allAnswered());
  $("#nextBtn").classList.toggle("disabled", !isComplete() && !isLast);
  $("#nextBtn").hidden = isLast;
}

function renderHero(topic) {
  const hero = $("#askHero");
  const image = $("#askImg");

  // Ẩn ảnh nếu topic không có ảnh HOẶC nếu không phải là câu hỏi đầu tiên (từ câu 2 trở đi)
  if (!topic.image || state.currentQuestion > 0) {
    hero.classList.add("empty");
  } else {
    hero.classList.remove("empty");
    image.alt = topic.name;
    image.onerror = () => hero.classList.add("empty");
    image.onload = () => hero.classList.remove("empty");
    image.src = topic.image || "";
  }
}

function renderAsk() {
  const topic = state.topic;
  const qIndex = state.currentQuestion;
  const question = topic.questions[qIndex];
  $("#askTopic").textContent = topic.name;
  $("#formErr").textContent = "";
  renderHero(topic);

  const box = $("#questions");
  box.innerHTML = "";

  // Render câu hỏi hiện tại
  const section = document.createElement("section");
  section.className = "question";

  const title = document.createElement("h2");
  title.className = "q-title";
  title.textContent = question.title.replace(/^\d+\.\s*/, "");

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
    
    // Khôi phục đáp án nếu người dùng bấm quay lại
    const isSelected = state.answers[qIndex] === option.key;
    button.setAttribute("aria-checked", String(isSelected));
    if (isSelected) button.classList.add("selected");

    button.onclick = () => {
      state.answers[qIndex] = option.key;

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
  updateSubmit();
}

function warnMissing(message) {
  $("#formErr").textContent = message;
  const section = $("#questions .question");
  section.classList.add("missing");
  section.scrollIntoView({ behavior: "smooth", block: "center" });
}

// "Tiếp": sang câu kế tiếp (cần chọn đáp án trước)
function goNext() {
  if (!isComplete()) {
    warnMissing("Vui lòng chọn đáp án trước khi tiếp tục.");
    return;
  }
  if (state.currentQuestion < state.topic.questions.length - 1) {
    state.currentQuestion++;
    renderAsk();
    window.scrollTo(0, 0);
  }
}

// "Trước": lùi một câu, hoặc về trang chọn vấn đề nếu đang ở câu đầu
function goPrev() {
  if (state.currentQuestion > 0) {
    state.currentQuestion--;
    renderAsk();
    window.scrollTo(0, 0);
  } else {
    showScreen("pick");
  }
}

// "Gửi": cần trả lời đủ mọi câu, nếu thiếu thì nhảy tới câu chưa trả lời
function submitAnswers() {
  const total = state.topic.questions.length;
  const missing = state.topic.questions.filter((_, i) => !state.answers[i]).length;
  if (missing > 0) {
    const first = state.topic.questions.findIndex((_, i) => !state.answers[i]);
    state.currentQuestion = first;
    renderAsk();
    warnMissing(`Bạn còn ${missing}/${total} câu chưa trả lời. Hãy trả lời hết trước khi gửi.`);
    return;
  }
  renderResult();
  showScreen("result");
}

/* ---------- Kết quả ---------- */
function findResult(topic, answers) {
  let matchedResult = null;
  let matchCount = 0;

  for (const result of topic.results) {
    let isMatch = true;
    for (const key in result.conditions) {
      const qIndex = parseInt(key, 10);
      const reqAns = result.conditions[key];
      const userAns = answers[qIndex];

      if (Array.isArray(reqAns)) {
        if (!reqAns.includes(userAns)) isMatch = false;
      } else {
        if (userAns !== reqAns) isMatch = false;
      }
    }
    
    if (isMatch) {
      matchCount++;
      matchedResult = result;
    }
  }

  if (matchCount !== 1) return null;
  return matchedResult;
}

function renderResult() {
  const topic = state.topic;
  const result = findResult(topic, state.answers);
  const warnTitle = $("#warnTitle");
  const finalResult = result || topic.fallback;

  $("#resultTopic").textContent = topic.name;
  $("#resultTitle").textContent = finalResult.title;
  $("#advice").textContent = finalResult.advice;

  warnTitle.innerHTML = "";

  if (result && result.level) {
    const levelSpan = document.createElement("span");
    levelSpan.className = LEVEL_CLASS[result.level.toLowerCase()] || "";
    levelSpan.textContent = result.level;
    warnTitle.append("Cảnh báo: ", levelSpan);
  } else {
    warnTitle.textContent = "Lưu ý:";
  }

  $("#callBtn").hidden = finalResult.level?.toLowerCase() !== "cấp cứu";
}

/* ---------- Sự kiện ---------- */
$("#submitBtn").onclick = submitAnswers;

// Nút Back lùi về câu hỏi trước hoặc ra ngoài trang chọn chủ đề
$("#prevBtn").onclick = goPrev;
$("#nextBtn").onclick = goNext;
$("#backToPick").onclick = () => showScreen("pick");

$("#backToAsk").onclick = () => {
  showScreen("ask");
};

renderTopics();