const $ = (id) => document.getElementById(id);
let mode = "web";
let webThreadId = localStorage.getItem("familyGptPublicThreadId") || crypto.randomUUID();
let codexConnected = false;
let sending = false; // one request at a time; Enter calls requestSubmit() even when the button is disabled
const histories = { web: [], codex: [] };

function escapeStateMessage() {
  return mode === "web" ? "무엇이든 물어보세요" : codexConnected ? "Codex 보조 모드" : "Codex는 관리자 연결 후 사용할 수 있습니다";
}
function renderMessages() {
  const root = $("messages"); root.replaceChildren();
  const history = histories[mode];
  if (!history.length) { const empty = document.createElement("div"); empty.id = "empty"; empty.className = "empty"; empty.textContent = escapeStateMessage(); root.appendChild(empty); return; }
  for (const item of history) { const node = document.createElement("div"); node.className = `message ${item.role}`; node.textContent = item.content; root.appendChild(node); }
  root.scrollTop = root.scrollHeight;
}
function addMessage(role, text, extra = "", persist = true) {
  $("empty")?.remove();
  const node = document.createElement("div"); node.className = `message ${role} ${extra}`.trim(); node.textContent = text; $("messages").appendChild(node); $("messages").scrollTop = $("messages").scrollHeight;
  if (persist) histories[mode].push({ role, content: text });
  return node;
}
async function jsonFetch(url, options = {}) { const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } }); const body = await response.json().catch(() => ({})); if (!response.ok) { const error = new Error(body.error || `HTTP ${response.status}`); error.status = response.status; throw error; } return body; }

const CODE_KEY = "familyGptAccessCode";
const CODE_HEADER = "x-family-code";
const codeHeaders = (code) => ({ [CODE_HEADER]: encodeURIComponent(code) });
function showAccessGate(message = "") {
  $("accessGate").hidden = false; $("accessError").textContent = message; $("accessCode").value = ""; $("accessCode").focus();
}
async function familyFetch(url, options = {}) {
  const code = localStorage.getItem(CODE_KEY) || "";
  if (!code) { showAccessGate(); throw new Error("가족 접속 코드가 필요합니다."); }
  try { return await jsonFetch(url, { ...options, headers: { ...codeHeaders(code), ...(options.headers || {}) } }); }
  catch (error) { if (error.status === 401) { localStorage.removeItem(CODE_KEY); showAccessGate(error.message); } throw error; }
}
async function submitAccessCode(event) {
  event.preventDefault(); const code = $("accessCode").value.trim(); if (!code) return;
  $("accessSubmit").disabled = true; $("accessError").textContent = "확인 중…";
  let accepted = false;
  try { await jsonFetch("/api/job?id=00000000-0000-0000-0000-000000000000", { headers: codeHeaders(code) }); accepted = true; }
  catch (error) { if (error.status === 404) accepted = true; else $("accessError").textContent = error.message; }
  finally { $("accessSubmit").disabled = false; }
  if (!accepted) return;
  localStorage.setItem(CODE_KEY, code); $("accessError").textContent = ""; $("accessGate").hidden = true; $("prompt").focus();
}

async function refreshHealth() {
  const [web, codex] = await Promise.all([
    jsonFetch("/api/health").catch(() => ({ bridge: "offline" })),
    jsonFetch("/api/codex-auth").catch(() => ({ connected: false })),
  ]);
  const webGood = web.bridge === "online" && web.modelAvailable === true;
  codexConnected = codex.connected === true;
  if (mode === "web") {
    $("status").textContent = webGood ? `● ${web.resolvedModel || "GPT-5.6 Sol"} 연결됨` : "○ ChatGPT worker 오프라인";
    $("status").dataset.state = webGood ? "online" : "offline";
    $("send").disabled = sending;
  } else {
    $("status").textContent = codexConnected ? "● Codex 연결됨" : "○ Codex 미연결";
    $("status").dataset.state = codexConnected ? "online" : "offline";
    $("send").disabled = sending || !codexConnected;
  }
  $("sidebarStatus").textContent = `GPT Web ${webGood ? "온라인" : "오프라인"} · Codex ${codexConnected ? "연결됨" : "미연결"}`;
  if (!histories[mode].length) renderMessages();
}

// The server fails queued jobs after 15 min and marks generating jobs uncertain after 16 min,
// so keep polling a little longer than that before giving up on our own.
const POLL_WINDOW_MS = 16.5 * 60_000;
async function poll(jobId, pending) {
  let deadline = Date.now() + POLL_WINDOW_MS; let generating = false; let networkErrors = 0;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    let job;
    try { job = await familyFetch(`/api/job?id=${encodeURIComponent(jobId)}`); networkErrors = 0; }
    catch (error) { if (error.status || ++networkErrors >= 5) throw error; continue; }
    if (job.status === "queued") pending.textContent = "Mac mini worker 대기 중…";
    if (job.status === "generating") { pending.textContent = "ChatGPT가 생각 중…"; if (!generating) { generating = true; deadline = Date.now() + POLL_WINDOW_MS; } }
    if (job.status === "completed") { pending.classList.remove("pending"); pending.textContent = job.output || "(빈 응답)"; histories.web.push({ role: "assistant", content: pending.textContent }); return; }
    if (["failed", "uncertain"].includes(job.status)) throw new Error(job.error || `Job ${job.status}`);
  }
  throw new Error("응답 대기 시간이 초과되었습니다.");
}

async function submitWeb(prompt, pending) {
  const result = await familyFetch("/api/chat", { method: "POST", body: JSON.stringify({ prompt, threadId: webThreadId }) });
  localStorage.setItem("familyGptPublicThreadId", webThreadId);
  await poll(result.jobId, pending);
}
async function submitCodex(pending) {
  const result = await familyFetch("/api/codex", { method: "POST", body: JSON.stringify({ model: "auto", messages: histories.codex }) });
  pending.classList.remove("pending"); pending.textContent = result.output || "(빈 응답)";
  histories.codex.push({ role: "assistant", content: pending.textContent });
  $("modelPill").textContent = `Codex · ${result.model || "Auto"}`;
}

function setMode(next) {
  if (!["web", "codex"].includes(next) || next === mode) return;
  mode = next;
  document.querySelectorAll(".mode-button").forEach((button) => button.classList.toggle("active", button.dataset.mode === mode));
  $("modeTitle").textContent = mode === "web" ? "GPT Web" : "Codex";
  $("modelPill").textContent = mode === "web" ? "GPT-5.6 Sol" : "Codex · Auto";
  $("prompt").placeholder = mode === "web" ? "메시지 입력" : "Codex에 메시지 입력";
  renderMessages();
  closeSidebar();
  refreshHealth().catch(() => {});
}
function openSidebar() { $("sidebar").classList.add("open"); $("backdrop").classList.add("show"); }
function closeSidebar() { $("sidebar").classList.remove("open"); $("backdrop").classList.remove("show"); }

document.querySelectorAll(".mode-button").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
$("menuToggle").addEventListener("click", openSidebar); $("backdrop").addEventListener("click", closeSidebar);
$("composer").addEventListener("submit", async (event) => {
  event.preventDefault(); if (sending) return; const prompt = $("prompt").value.trim(); if (!prompt) return;
  if (mode === "codex" && !codexConnected) return;
  if (!localStorage.getItem(CODE_KEY)) { showAccessGate(); return; }
  $("prompt").value = ""; addMessage("user", prompt); const pending = addMessage("assistant", "전송 중…", "pending", false); $("send").disabled = true; sending = true;
  try { if (mode === "web") await submitWeb(prompt, pending); else await submitCodex(pending); }
  catch (error) { pending.classList.remove("pending"); pending.textContent = `오류: ${error.message}`; }
  finally { sending = false; if (mode === "web" || codexConnected) $("send").disabled = false; $("prompt").focus(); }
});
$("newChat").addEventListener("click", () => { histories[mode] = []; if (mode === "web") { webThreadId = crypto.randomUUID(); localStorage.setItem("familyGptPublicThreadId", webThreadId); } renderMessages(); });
$("prompt").addEventListener("keydown", (event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); $("composer").requestSubmit(); } });
$("accessForm").addEventListener("submit", submitAccessCode);
if (!localStorage.getItem(CODE_KEY)) showAccessGate();
renderMessages(); refreshHealth().catch(() => {}); setInterval(() => refreshHealth().catch(() => {}), 15000);
