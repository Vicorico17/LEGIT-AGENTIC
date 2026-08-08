import test from "node:test";
import assert from "node:assert/strict";
import { analyzeHtml, analyzeRobots, scoreSignals } from "../src/audit.js";

const GOOD_HTML = `<!doctype html>
<html lang="en"><head>
<title>Evidence-based agentic audits</title>
<meta name="description" content="A practical audit methodology.">
<link rel="canonical" href="https://example.com/guide">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"Example"}</script>
</head><body><nav><a href="/guide">Agentic audit guide</a></nav><main>
<h1>How should a website prepare for AI agents?</h1>
<p>Written by Jane Expert. Updated August 8, 2026.</p>
<p>In short, publish extractable answers because 51.7% of 100 citations may point to owned pages.</p>
<img src="chart.png" alt="Chart showing citation coverage">
</main></body></html>`;

test("analyzeHtml extracts readiness and quotability evidence", () => {
  const result = analyzeHtml(GOOD_HTML, "https://example.com/guide");
  assert.equal(result.title, "Evidence-based agentic audits");
  assert.equal(result.h1Count, 1);
  assert.equal(result.hasMain, true);
  assert.equal(result.imageAltCoverage, 100);
  assert.deepEqual(result.schemaTypes, ["Organization"]);
  assert.equal(result.authorship, true);
  assert.equal(result.freshness, true);
  assert.equal(result.questionCount, 1);
  assert.ok(result.numericFacts >= 1);
});

test("analyzeHtml reports invalid JSON-LD", () => {
  const result = analyzeHtml('<script type="application/ld+json">{bad}</script>');
  assert.equal(result.jsonLdBlocks, 1);
  assert.equal(result.invalidJsonLd, 1);
});

test("analyzeRobots detects explicit full-site blocks", () => {
  const result = analyzeRobots("User-agent: GPTBot\nDisallow: /\n\nUser-agent: ClaudeBot\nAllow: /");
  assert.deepEqual(result.blocked, ["GPTBot"]);
  assert.equal(result.bots.ClaudeBot, "allowed");
  assert.equal(result.bots.PerplexityBot, "unspecified");
});

test("analyzeRobots applies wildcard rules when no bot-specific group exists", () => {
  const result = analyzeRobots("User-agent: *\nDisallow: /");
  assert.equal(result.blocked.length, 6);
});

test("scoreSignals treats warnings as half credit and ignores zero-weight signals", () => {
  const score = scoreSignals([
    { weight: 10, status: "pass" },
    { weight: 10, status: "warn" },
    { weight: 10, status: "fail" },
    { weight: 0, status: "pass" },
  ]);
  assert.equal(score, 50);
});
