import assert from "node:assert/strict";
import { test } from "node:test";

// Minimal DOM stand-in: just enough of the API that public/app.js touches.
function fakeElement(id = "") {
  const listeners = {};
  const classes = new Set();
  const el = {
    id, hidden: false, value: "", textContent: "", disabled: false, placeholder: "", className: "",
    dataset: {}, children: [], scrollTop: 0, scrollHeight: 0, attributes: {},
    classList: { add: (c) => classes.add(c), remove: (c) => classes.delete(c), toggle: (c, on) => (on ?? !classes.has(c)) ? classes.add(c) : classes.delete(c), contains: (c) => classes.has(c) },
    addEventListener(type, fn) { (listeners[type] ||= []).push(fn); },
    async dispatch(type, event = {}) { for (const fn of listeners[type] || []) await fn({ preventDefault() {}, ...event }); },
    appendChild(child) { el.children.push(child); return child; },
    replaceChildren(...nodes) { el.children = nodes; },
    setAttribute(name, value) { el.attributes[name] = String(value); },
    getAttribute(name) { return el.attributes[name] ?? null; },
    remove() {}, focus() {}, requestSubmit() { return el.dispatch("submit"); },
  };
  return el;
}

const elements = new Map();
const byId = (id) => { if (!elements.has(id)) elements.set(id, fakeElement(id)); return elements.get(id); };
const modeButtons = ["web", "codex"].map((mode) => Object.assign(fakeElement(), { dataset: { mode } }));
const store = new Map([["familyGptAccessCode", "family-test-code"]]);
const codexBodies = [];
let codexReply = { status: 500, body: { error: "boom" } };

const documentListeners = {};
globalThis.document = {
  getElementById: byId, createElement: () => fakeElement(), querySelectorAll: () => modeButtons,
  querySelector: () => modeButtons.find((button) => button.classList.contains("active")) || null,
  addEventListener(type, fn) { (documentListeners[type] ||= []).push(fn); },
};
globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
globalThis.setInterval = () => 0;
globalThis.fetch = async (url, init = {}) => {
  const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  if (url === "/api/health") return json(200, { bridge: "offline" });
  if (url === "/api/codex-auth") return json(200, { connected: true });
  if (url === "/api/codex") { codexBodies.push(JSON.parse(init.body)); return json(codexReply.status, codexReply.body); }
  return json(404, {});
};

await import("../public/app.js");
await new Promise((resolve) => setImmediate(resolve));

test("a failed Codex request does not leave a dangling user turn in the history", async () => {
  await modeButtons[1].dispatch("click");
  await new Promise((resolve) => setImmediate(resolve));
  byId("prompt").value = "first question";
  await byId("composer").dispatch("submit");
  assert.equal(byId("prompt").value, "first question", "prompt is restored for a retry");

  codexReply = { status: 200, body: { output: "answer", model: "gpt-5.6-terra" } };
  byId("prompt").value = "second question";
  await byId("composer").dispatch("submit");
  assert.deepEqual(codexBodies.at(-1).messages, [{ role: "user", content: "second question" }]);
});

test("mode buttons expose aria-pressed and Escape closes the mobile sidebar", async () => {
  assert.equal(modeButtons[1].getAttribute("aria-pressed"), "true");
  assert.equal(modeButtons[0].getAttribute("aria-pressed"), "false");
  await byId("menuToggle").dispatch("click");
  assert.equal(byId("sidebar").classList.contains("open"), true);
  assert.equal(byId("menuToggle").getAttribute("aria-expanded"), "true");
  for (const fn of documentListeners.keydown || []) fn({ key: "Escape" });
  assert.equal(byId("sidebar").classList.contains("open"), false);
  assert.equal(byId("menuToggle").getAttribute("aria-expanded"), "false");
});

test("Enter that confirms a Korean IME composition does not send", async () => {
  const before = codexBodies.length;
  byId("prompt").value = "안녕";
  await byId("prompt").dispatch("keydown", { key: "Enter", isComposing: true });
  assert.equal(codexBodies.length, before);
  await byId("prompt").dispatch("keydown", { key: "Enter", isComposing: false });
  assert.equal(codexBodies.length, before + 1);
});
