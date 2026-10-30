"use strict";

// 스터디 퀘스트는 브라우저 안에서만 실행됩니다. API 키와 서버가 필요 없습니다.
const SAVE_KEY = "study-quest-offline-v2";
const MONSTERS = [
  { emoji: "🟢", name: "개념 슬라임" },
  { emoji: "🦇", name: "암기 박쥐" },
  { emoji: "👾", name: "문제 고블린" },
  { emoji: "🐉", name: "시험 드래곤" }
];

const SAMPLE_PACK = {
  title: "코딩 기초 미니 던전",
  questions: [
    { question: "C언어에서 정수를 출력할 때 주로 사용하는 서식 지정자는?", options: ["%f", "%d", "%c", "%s"], answerIndex: 1, explanation: "%d는 정수를 10진수 형태로 출력할 때 사용해." },
    { question: "C언어에서 화면에 문장을 출력하는 함수는?", options: ["printf()", "scanf()", "return()", "for()"], answerIndex: 0, explanation: "printf()는 문자열이나 변수의 값을 화면에 출력하는 함수야." },
    { question: "리눅스에서 현재 작업 중인 폴더 위치를 확인하는 명령어는?", options: ["cd", "ls", "pwd", "mkdir"], answerIndex: 2, explanation: "pwd는 현재 작업 디렉터리의 경로를 보여 줘." },
    { question: "리눅스에서 파일이나 폴더 목록을 확인하는 명령어는?", options: ["ls", "cat", "pwd", "rm"], answerIndex: 0, explanation: "ls 명령어는 디렉터리의 내용을 나열해." },
    { question: "JavaScript에서 배열에 들어 있는 요소의 개수를 확인할 때 사용하는 것은?", options: [".count", ".size()", ".total", ".length"], answerIndex: 3, explanation: "배열의 length 속성을 사용하면 요소 개수를 알 수 있어." },
    { question: "JavaScript에서 버튼 클릭 이벤트를 등록할 때 사용할 수 있는 메서드는?", options: ["getTime()", "addEventListener()", "split()", "push()"], answerIndex: 1, explanation: "addEventListener('click', 함수) 형태로 클릭 이벤트를 등록할 수 있어." },
    { question: "2진수 1010을 10진수로 바꾸면?", options: ["8", "9", "10", "12"], answerIndex: 2, explanation: "1010₂는 8 + 2이므로 10이야." },
    { question: "C언어에서 조건이 참인 경우에만 코드를 실행하려면?", options: ["if", "printf", "include", "break"], answerIndex: 0, explanation: "if문은 조건식이 참일 때 내부 코드를 실행해." },
    { question: "HTML에서 가장 큰 제목을 나타내는 태그는?", options: ["<p>", "<div>", "<h1>", "<span>"], answerIndex: 2, explanation: "<h1>은 가장 높은 단계의 제목을 나타내는 태그야." },
    { question: "CSS에서 글자 색상을 지정하는 속성은?", options: ["background", "color", "width", "margin"], answerIndex: 1, explanation: "color 속성으로 텍스트 색상을 설정할 수 있어." }
  ]
};

const $ = (id) => document.getElementById(id);
const ui = {
  jsonFile: $("jsonFile"), jsonPaste: $("jsonPaste"), loadPasteBtn: $("loadPasteBtn"),
  demoBtn: $("demoBtn"), importStatus: $("importStatus"), level: $("level"),
  xpLabel: $("xpLabel"), xpFill: $("xpFill"), coins: $("coins"),
  kills: $("kills"), correctTotal: $("correctTotal"), resetBtn: $("resetBtn"),
  monsterEmoji: $("monsterEmoji"), monsterName: $("monsterName"),
  monsterHpLabel: $("monsterHpLabel"), monsterHpFill: $("monsterHpFill"),
  arenaHint: $("arenaHint"), modePill: $("modePill"), questCount: $("questCount"),
  questionTag: $("questionTag"), questionProgress: $("questionProgress"),
  questionText: $("questionText"), options: $("options"), feedback: $("feedback"),
  nextBtn: $("nextBtn"), wrongCount: $("wrongCount"), wrongList: $("wrongList"),
  reviewBtn: $("reviewBtn")
};

function initialState() {
  return {
    title: "", questions: [], index: 0, phase: "battle", reviewQueue: [],
    reviewIndex: 0, wrong: [], answered: false, selected: -1, feedbackText: "",
    feedbackType: "", level: 1, xp: 0, coins: 0, kills: 0, correctTotal: 0,
    monsterHp: 50, monsterIndex: 0
  };
}

let state = initialState();

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }
  catch (error) { console.warn("저장할 수 없어:", error.message); }
}

function readSave() {
  try {
    const stored = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (stored && Array.isArray(stored.questions) && Array.isArray(stored.wrong) &&
        stored.phase && Number.isInteger(stored.level) && stored.level > 0) {
      state = { ...initialState(), ...stored };
      if (!Array.isArray(state.reviewQueue)) state.reviewQueue = [];
      setStatus("이전에 플레이한 진행 상황을 불러왔어.", "good");
    }
  } catch (error) { console.warn("이전 진행 상황을 읽지 못했어:", error.message); }
}

function setStatus(text, kind = "") {
  ui.importStatus.textContent = text;
  ui.importStatus.className = `import-status ${kind}`.trim();
}

function normalizePack(input) {
  const rawQuestions = Array.isArray(input) ? input : input && input.questions;
  if (!Array.isArray(rawQuestions) || rawQuestions.length !== 10) {
    throw new Error("문제는 정확히 10개여야 해. ChatGPT에 '객관식 10문제 JSON으로 만들어줘'라고 요청해 줘.");
  }
  const questions = rawQuestions.map((q, index) => {
    if (!q || typeof q.question !== "string" || !q.question.trim() ||
        !Array.isArray(q.options) || q.options.length !== 4 ||
        !q.options.every((item) => typeof item === "string" && item.trim()) ||
        !Number.isInteger(q.answerIndex) || q.answerIndex < 0 || q.answerIndex > 3) {
      throw new Error(`${index + 1}번 문제 형식이 잘못됐어. question, options 4개, answerIndex(0~3)를 확인해 줘.`);
    }
    return {
      id: `q${index + 1}`,
      question: q.question.trim().slice(0, 600),
      options: q.options.map((item) => item.trim().slice(0, 300)),
      answerIndex: q.answerIndex,
      explanation: typeof q.explanation === "string" ? q.explanation.trim().slice(0, 1000) : "자료에서 해당 개념을 다시 확인해 봐."
    };
  });
  return {
    title: (input && typeof input.title === "string" ? input.title.trim() : "나의 공부 퀘스트").slice(0, 100) || "나의 공부 퀘스트",
    questions
  };
}

function parsePastedJson(text) {
  let cleaned = text.trim();
  // ChatGPT의 ```json 코드블록을 통째로 붙여넣은 경우에도 지원.
  const match = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (match) cleaned = match[1];
  try { return normalizePack(JSON.parse(cleaned)); }
  catch (error) {
    if (error instanceof SyntaxError) throw new Error("JSON 문법을 읽지 못했어. 코드블록 안의 { 부터 } 까지 모두 복사했는지 확인해 줘.");
    throw error;
  }
}

function startPack(pack) {
  if (state.questions.length && !confirm("새 문제를 시작하면 현재 문제 진행과 오답 노트가 초기화돼. 계속할까? (레벨과 코인은 유지돼)")) return;
  state = {
    ...state,
    title: pack.title,
    questions: pack.questions,
    index: 0,
    phase: "battle",
    reviewQueue: [], reviewIndex: 0,
    wrong: [], answered: false, selected: -1,
    feedbackText: "", feedbackType: "",
    monsterHp: 50, monsterIndex: 0
  };
  save();
  render();
  setStatus(`준비 완료! '${pack.title}' 객관식 10문제를 불러왔어. 전투를 시작하자!`, "good");
  ui.jsonPaste.value = "";
  ui.jsonFile.value = "";
}

ui.demoBtn.addEventListener("click", () => startPack(normalizePack(SAMPLE_PACK)));
ui.loadPasteBtn.addEventListener("click", () => {
  if (!ui.jsonPaste.value.trim()) { setStatus("먼저 ChatGPT가 만든 JSON을 붙여넣어 줘.", "error"); return; }
  try { startPack(parsePastedJson(ui.jsonPaste.value)); }
  catch (error) { setStatus(error.message, "error"); }
});
ui.jsonFile.addEventListener("change", async () => {
  const file = ui.jsonFile.files && ui.jsonFile.files[0];
  if (!file) return;
  if (file.size > 1024 * 1024) { setStatus("JSON 파일은 1MB 이하로 올려 줘.", "error"); return; }
  try {
    const pack = parsePastedJson(await file.text());
    startPack(pack);
  } catch (error) { setStatus(error.message, "error"); }
});

function expNeeded() { return state.level * 100; }
function earnExp(amount) {
  state.xp += amount;
  let leveledUp = false;
  while (state.xp >= expNeeded()) {
    state.xp -= expNeeded();
    state.level += 1;
    leveledUp = true;
  }
  return leveledUp;
}

function currentQuestions() {
  return state.phase === "review" ? state.reviewQueue : state.questions;
}
function currentIndex() {
  return state.phase === "review" ? state.reviewIndex : state.index;
}
function getQuestion() { return currentQuestions()[currentIndex()] || null; }
function battleDone() { return state.questions.length > 0 && state.index >= state.questions.length; }
function reviewDone() { return state.phase === "review" && state.reviewIndex >= state.reviewQueue.length; }
function canReview() {
  return state.wrong.length > 0 && (battleDone() || reviewDone());
}

function answer(index) {
  const question = getQuestion();
  if (!question || state.answered) return;
  state.answered = true;
  state.selected = index;
  const isCorrect = index === question.answerIndex;
  let extra = "";
  if (isCorrect) {
    if (state.phase === "battle") {
      state.correctTotal += 1;
      state.coins += 2;
      const leveledUp = earnExp(10);
      state.monsterHp -= 25;
      if (state.monsterHp <= 0) {
        state.kills += 1;
        state.coins += 10;
        state.monsterIndex += 1;
        state.monsterHp = 50;
        const killLevel = earnExp(20);
        extra = "\n🏆 몬스터 처치! +10 코인, +20 추가 XP";
        if (leveledUp || killLevel) extra += ` · 레벨 ${state.level} 달성!`;
      } else if (leveledUp) extra = `\n🎉 레벨 ${state.level} 달성!`;
      state.feedbackText = `✅ 정답! 몬스터에게 25 데미지! +10 XP, +2 코인.\n💡 ${question.explanation}${extra}`;
    } else {
      state.wrong = state.wrong.filter((item) => item.id !== question.id);
      state.coins += 1;
      const leveledUp = earnExp(5);
      state.feedbackText = `✅ 복습 정답! 오답 노트에서 제거했어. +5 XP, +1 코인.\n💡 ${question.explanation}${leveledUp ? `\n🎉 레벨 ${state.level} 달성!` : ""}`;
    }
    state.feedbackType = "good";
  } else {
    if (!state.wrong.some((item) => item.id === question.id)) state.wrong.push({ ...question });
    state.feedbackText = `❌ 아쉽지만 오답! 정답은 ${["①", "②", "③", "④"][question.answerIndex]} ${question.options[question.answerIndex]}\n💡 ${question.explanation}`;
    state.feedbackType = "bad";
  }
  save();
  render();
}

function moveNext() {
  if (!state.answered) return;
  if (state.phase === "battle") state.index += 1;
  else state.reviewIndex += 1;
  state.answered = false;
  state.selected = -1;
  state.feedbackText = "";
  state.feedbackType = "";
  save();
  render();
}
ui.nextBtn.addEventListener("click", moveNext);

ui.reviewBtn.addEventListener("click", () => {
  if (!canReview()) return;
  state.phase = "review";
  state.reviewQueue = state.wrong.map((q) => ({ ...q }));
  state.reviewIndex = 0;
  state.answered = false;
  state.selected = -1;
  state.feedbackText = "";
  state.feedbackType = "";
  save();
  render();
  setStatus(`오답 ${state.reviewQueue.length}문제 복습을 시작했어!`, "good");
});

ui.resetBtn.addEventListener("click", () => {
  if (!confirm("레벨과 코인, 진행 상황, 오답 노트를 모두 초기화할까?")) return;
  state = initialState();
  save();
  render();
  setStatus("게임 기록을 초기화했어. 새 퀘스트를 시작해 봐.");
});

function renderHero() {
  ui.level.textContent = String(state.level);
  ui.xpLabel.textContent = `${state.xp} / ${expNeeded()}`;
  ui.xpFill.style.width = `${Math.min(100, 100 * state.xp / expNeeded())}%`;
  ui.coins.textContent = String(state.coins);
  ui.kills.textContent = String(state.kills);
  ui.correctTotal.textContent = String(state.correctTotal);
  const heroTitle = document.querySelector(".hero-title");
  heroTitle.textContent = state.level >= 5 ? "지식의 용사" : state.level >= 3 ? "학습 전사" : "학습 견습생";
}

function renderMonster() {
  const noPack = !state.questions.length;
  const won = battleDone() && state.phase === "battle";
  const monster = MONSTERS[state.monsterIndex % MONSTERS.length];
  ui.monsterEmoji.textContent = won ? "🏆" : noPack ? "👾" : monster.emoji;
  ui.monsterName.textContent = won ? "던전 클리어!" : noPack ? "대기 중인 몬스터" : monster.name;
  ui.monsterHpLabel.textContent = won ? "CLEAR" : `${state.monsterHp} / 50`;
  ui.monsterHpFill.style.width = won ? "100%" : `${100 * state.monsterHp / 50}%`;
  ui.arenaHint.textContent = won
    ? "모든 문제를 풀었어! 아래 오답 노트도 확인해 봐."
    : state.phase === "review"
      ? "복습 모드: 틀린 문제를 다시 풀어 보자!"
      : noPack ? "문제를 불러오면 전투가 시작돼." : "정답을 맞힐 때마다 몬스터 HP가 25씩 줄어들어.";
}

function renderQuestion() {
  const questions = currentQuestions();
  const index = currentIndex();
  const q = getQuestion();
  const noPack = state.questions.length === 0;
  ui.options.replaceChildren();
  ui.modePill.textContent = noPack ? "전투 준비" : state.phase === "review" ? "오답 복습" : battleDone() ? "퀘스트 완료" : "전투 진행 중";
  ui.questCount.textContent = `${Math.min(index, questions.length)} / ${questions.length || 10}`;
  ui.questionProgress.style.width = `${questions.length ? Math.min(100, (index / questions.length) * 100) : 0}%`;
  ui.feedback.textContent = state.feedbackText;
  ui.feedback.className = `feedback ${state.feedbackType}`.trim();
  ui.nextBtn.disabled = !state.answered || !q;
  ui.nextBtn.textContent = state.phase === "review" ? "다음 복습 문제 →" : "다음 문제 →";

  if (!q) {
    ui.questionTag.textContent = noPack ? "QUEST READY" : state.phase === "review" ? "REVIEW COMPLETE" : "QUEST COMPLETE";
    ui.questionText.textContent = noPack
      ? "문제를 불러오고 첫 전투를 시작해 봐!"
      : state.phase === "review"
        ? state.wrong.length ? "복습 완료! 아직 남은 오답은 다시 도전해 봐." : "완벽해! 오답을 전부 해결했어!"
        : `🎉 '${state.title}' 퀘스트 완료!`;
    if (!noPack) {
      ui.questionProgress.style.width = "100%";
      ui.feedback.textContent = state.phase === "review" ? "오답을 모두 해결할 때까지 반복해 봐." : "아래 오답 노트에서 틀린 문제를 다시 풀 수 있어.";
      ui.feedback.className = "feedback good";
    }
    ui.nextBtn.disabled = true;
    ui.nextBtn.textContent = "퀘스트 완료";
    return;
  }

  ui.questionTag.textContent = `${state.phase === "review" ? "REVIEW" : "QUEST"} ${index + 1} / ${questions.length}`;
  ui.questionText.textContent = q.question;
  q.options.forEach((option, optionIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option";
    const number = document.createElement("span");
    number.className = "number";
    number.textContent = String(optionIndex + 1);
    const label = document.createElement("span");
    label.textContent = option;
    button.append(number, label);
    button.disabled = state.answered;
    if (state.answered) {
      if (optionIndex === q.answerIndex) button.classList.add("correct");
      else if (optionIndex === state.selected) button.classList.add("wrong");
    }
    button.addEventListener("click", () => answer(optionIndex));
    ui.options.appendChild(button);
  });
}

function renderWrong() {
  ui.wrongCount.textContent = `${state.wrong.length}문제`;
  ui.wrongList.replaceChildren();
  if (!state.wrong.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "아직 틀린 문제가 없어. 퀘스트를 시작해 봐!";
    ui.wrongList.appendChild(empty);
  } else {
    state.wrong.forEach((q, i) => {
      const card = document.createElement("article");
      card.className = "wrong-card";
      const title = document.createElement("strong");
      title.textContent = `${i + 1}. ${q.question}`;
      const answerLabel = document.createElement("p");
      answerLabel.className = "answer";
      answerLabel.textContent = `정답: ${["①", "②", "③", "④"][q.answerIndex]} ${q.options[q.answerIndex]}`;
      const explanation = document.createElement("p");
      explanation.textContent = `해설: ${q.explanation}`;
      card.append(title, answerLabel, explanation);
      ui.wrongList.appendChild(card);
    });
  }
  ui.reviewBtn.disabled = !canReview();
  ui.reviewBtn.textContent = state.wrong.length ? `오답 ${state.wrong.length}문제 다시 풀기 ↗` : "오답 다시 풀기 ↗";
}

function render() { renderHero(); renderMonster(); renderQuestion(); renderWrong(); }
readSave();
render();
