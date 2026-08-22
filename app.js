const form = document.querySelector("#audit-form");
const targetInput = document.querySelector("#target");
const statusBox = document.querySelector("#status");
const results = document.querySelector("#results");
let latestReport = null;

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
  document.querySelector("#signal-list").innerHTML = report.signals.map((signal) => `
    <article class="signal signal--${signal.status}">
      <div class="signal-top"><span class="pill">${escapeHtml(signal.status)}</span><span class="category">${escapeHtml(signal.category)}</span><span class="weight">${signal.weight ? `${signal.weight} pts` : "unscored"}</span></div>
      <h3>${escapeHtml(signal.id.replaceAll("-", " "))}</h3>
      <p class="evidence">${escapeHtml(signal.evidence)}</p>
      ${signal.status === "pass" ? "" : `<p class="recommendation recommendation--locked">🔒 Improvement recommendation included in the paid ACORE plan.</p>`}
    </article>`).join("");
  results.hidden = false;
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
