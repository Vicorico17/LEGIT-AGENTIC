const form = document.querySelector("#audit-form");
const targetInput = document.querySelector("#target");
const statusBox = document.querySelector("#status");
const results = document.querySelector("#results");
let latestReport = null;
const HISTORY_KEY = "legit-agentic-score-history";

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

function markdown(report) {
  const rows = report.signals.map((signal) => `| ${signal.status.toUpperCase()} | ${signal.category} | ${signal.id} | ${String(signal.evidence).replaceAll("|", "\\|")} |`).join("\n");
  const work = report.signals.filter((signal) => signal.status !== "pass").map((signal, index) => `${index + 1}. **${signal.id}:** ${signal.recommendation} (${signal.evidence})`).join("\n");
  return `# Agentic audit: ${report.finalUrl || report.target}\n\n- Readiness: **${report.readinessScore}/100 (${report.grade})**\n- Pages sampled: **${report.pagesSampled}**\n- Audited: **${report.auditedAt}**\n\n> ${report.scopeNote}\n\n## Signals\n\n| Status | Category | Signal | Evidence |\n|---|---|---|---|\n${rows}\n\n## Recommended work\n\n${work}\n`;
}

function download(name, type, contents) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([contents], { type }));
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
}

function categoryScores(report) {
  const categories = new Map();
  report.signals.filter((signal) => signal.weight > 0).forEach((signal) => {
    const current = categories.get(signal.category) || { earned: 0, possible: 0 };
    current.possible += signal.weight;
    current.earned += signal.weight * (signal.status === "pass" ? 1 : signal.status === "warn" ? 0.5 : 0);
    categories.set(signal.category, current);
  });
  return [...categories.entries()].map(([name, value]) => ({ name, score: value.possible ? Math.round((value.earned / value.possible) * 100) : 0, ...value }));
}

function saveHistory(report) {
  const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  const entry = { target: report.finalUrl || report.target, score: report.readinessScore, grade: report.grade, auditedAt: report.auditedAt };
  const history = [entry, ...existing.filter((item) => item.target !== entry.target)].slice(0, 5);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return history;
}

function renderHistory(history) {
  document.querySelector("#score-history").innerHTML = history.length
    ? history.map((item) => `<div class="history-entry"><strong>${escapeHtml(item.score)}</strong><span title="${escapeHtml(item.target)}">${escapeHtml(item.target)}</span><time>${escapeHtml(new Date(item.auditedAt).toLocaleDateString())}</time></div>`).join("")
    : "<p>No previous scores in this browser yet.</p>";
}

function scoreSummary(report) {
  return `LEGIT AGENTIC SCORE\n${report.finalUrl || report.target}\nScore: ${report.readinessScore}/100 (${report.grade})\nPassed: ${report.signals.filter((item) => item.status === "pass").length} · Warnings: ${report.signals.filter((item) => item.status === "warn").length} · Failed: ${report.signals.filter((item) => item.status === "fail").length}\nPages sampled: ${report.pagesSampled}`;
}

function render(report) {
  latestReport = report;
  const counts = { pass: 0, warn: 0, fail: 0 };
  report.signals.forEach((signal) => { counts[signal.status] += 1; });
  document.querySelector("#score-value").textContent = report.readinessScore;
  document.querySelector("#grade-value").textContent = `Grade ${report.grade}`;
  document.querySelector("#result-target").textContent = report.finalUrl || report.target;
  document.querySelector("#pass-count").textContent = counts.pass;
  document.querySelector("#warn-count").textContent = counts.warn;
  document.querySelector("#fail-count").textContent = counts.fail;
  document.querySelector("#page-count").textContent = report.pagesSampled;
  document.querySelector("#category-list").innerHTML = categoryScores(report).map((category) => `
    <div class="category-row"><div class="category-row-head"><span>${escapeHtml(category.name)}</span><strong>${category.score}/100</strong></div><div class="category-track"><div class="category-fill" style="width:${category.score}%"></div></div><small>${category.earned.toFixed(1)} of ${category.possible} weighted points</small></div>`).join("");
  const opportunities = report.signals.filter((signal) => signal.status !== "pass").sort((a, b) => (b.weight || 0) - (a.weight || 0)).slice(0, 3);
  document.querySelector("#opportunity-list").innerHTML = opportunities.length
    ? opportunities.map((signal, index) => `<div class="opportunity"><span class="opportunity-number">0${index + 1}</span><div><strong>${escapeHtml(signal.id.replaceAll("-", " "))}</strong><span>${escapeHtml(signal.evidence)} · ${signal.weight ? `${signal.weight} points at stake` : "not scored"}</span></div></div>`).join("")
    : "<p>Everything sampled passed. Keep monitoring as your business changes.</p>";
  document.querySelector("#signal-list").innerHTML = report.signals.map((signal) => `
    <article class="signal signal--${signal.status}">
      <div class="signal-top"><span class="pill">${escapeHtml(signal.status)}</span><span class="category">${escapeHtml(signal.category)}</span><span class="weight">${signal.weight ? `${signal.weight} pts` : "unscored"}</span></div>
      <h3>${escapeHtml(signal.id.replaceAll("-", " "))}</h3>
      <p class="evidence">${escapeHtml(signal.evidence)}</p>
      ${signal.status === "pass" ? "" : `<p class="recommendation recommendation--locked">🔒 Improvement recommendation included in the paid plan.</p>`}
    </article>`).join("");
  results.hidden = false;
  renderHistory(saveHistory(report));
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button");
  button.disabled = true;
  results.hidden = true;
  statusBox.hidden = false;
  statusBox.className = "status status--loading";
  statusBox.textContent = "Inspecting public pages and machine-readable surfaces…";
  try {
    const response = await fetch("/api/audit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ target: targetInput.value }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "The audit could not be completed.");
    statusBox.hidden = true;
    render(body);
  } catch (error) {
    statusBox.className = "status status--error";
    statusBox.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

document.querySelector("#download-json").addEventListener("click", () => latestReport && download("agentic-audit.json", "application/json", `${JSON.stringify(latestReport, null, 2)}\n`));
document.querySelector("#download-md").addEventListener("click", () => latestReport && download("AGENTIC-AUDIT.md", "text/markdown", markdown(latestReport)));
document.querySelector("#copy-summary").addEventListener("click", async (event) => {
  if (!latestReport) return;
  await navigator.clipboard.writeText(scoreSummary(latestReport));
  const button = event.currentTarget;
  const label = button.textContent;
  button.textContent = "Copied ✓";
  setTimeout(() => { button.textContent = label; }, 1800);
});
document.querySelector("#new-audit").addEventListener("click", () => {
  results.hidden = true;
  targetInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
renderHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"));
