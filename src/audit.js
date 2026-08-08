const USER_AGENT = "LEGIT-Agentic-Audit/0.1 (+https://github.com/Vicorico17/LEGIT-AGENTIC)";
const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot", "Google-Extended"];

const SIGNAL_META = {
  reachable: ["Access", 8, "Return a successful HTML response."],
  robots: ["Access", 4, "Publish a reachable robots.txt with intentional crawler rules."],
  sitemap: ["Discovery", 6, "Publish a reachable XML sitemap."],
  "ai-crawler-access": ["Access", 6, "Review robots and edge rules for the AI crawlers you intend to allow."],
  "raw-html-content": ["Extractability", 12, "Render substantive page content in the initial HTML."],
  "title-description": ["Discovery", 5, "Give every important page a descriptive title and meta description."],
  "semantic-structure": ["Navigation", 5, "Use one clear H1 plus semantic main and navigation landmarks."],
  canonical: ["Identity", 3, "Publish a canonical URL for indexable pages."],
  "structured-data": ["Machine data", 7, "Add accurate schema that represents visible page content."],
  "organization-identity": ["Identity", 5, "Define the organization and its official identity consistently."],
  "image-alt": ["Machine data", 4, "Add useful alt text to meaningful images."],
  authorship: ["Trust", 5, "Show visible expert or company attribution on citable pages."],
  freshness: ["Trust", 4, "Show published or modified dates on time-sensitive content."],
  "answer-capsules": ["Quotability", 7, "Add concise, self-contained answers to buyer questions."],
  "stat-density": ["Quotability", 5, "Support claims with concrete numbers, evidence, and sources."],
  "descriptive-links": ["Navigation", 3, "Use meaningful anchor text for internal links."],
  "llms-txt": ["Experimental", 0, "Optionally publish llms.txt as a curated guide; do not treat it as a ranking lever."],
  "security-txt": ["Trust", 1, "Optionally publish a machine-readable security contact."],
};

function normalizeTarget(value) {
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  const url = new URL(candidate);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only HTTP and HTTPS URLs are supported.");
  url.hash = "";
  return url;
}

async function request(url, timeoutMs, accept = "text/html,application/xhtml+xml") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": USER_AGENT, accept },
    });
    return {
      ok: response.ok,
      status: response.status,
      url: response.url,
      contentType: response.headers.get("content-type") || "",
      text: await response.text(),
    };
  } catch (error) {
    return { ok: false, status: 0, url: String(url), contentType: "", text: "", error: error.message };
  } finally {
    clearTimeout(timer);
  }
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:39|x27);/gi, "'");
}

function stripHtml(html) {
  return decodeEntities(html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim());
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match ? match[1] ?? match[2] ?? match[3] ?? "" : "";
}

function extractJsonLd(html) {
  const blocks = [];
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1].trim());
      blocks.push(parsed);
    } catch {
      blocks.push({ __invalid: true });
    }
  }
  return blocks;
}

function schemaTypes(value, output = new Set()) {
  if (Array.isArray(value)) value.forEach((item) => schemaTypes(item, output));
  else if (value && typeof value === "object") {
    const type = value["@type"];
    if (Array.isArray(type)) type.forEach((item) => output.add(String(item)));
    else if (type) output.add(String(type));
    Object.values(value).forEach((item) => schemaTypes(item, output));
  }
  return output;
}

function extractLinks(html, baseUrl) {
  const links = [];
  for (const match of html.matchAll(/<a\b[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = match[1] ?? match[2] ?? match[3] ?? "";
    const text = stripHtml(match[4]);
    try {
      const url = new URL(href, baseUrl);
      if (["http:", "https:"].includes(url.protocol)) links.push({ url, text });
    } catch {}
  }
  return links;
}

export function analyzeHtml(html, pageUrl = "https://example.com/") {
  const text = stripHtml(html);
  const words = text ? text.split(/\s+/).length : 0;
  const title = stripHtml(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
  const descriptionTag = [...html.matchAll(/<meta\b[^>]*>/gi)].find((match) => attr(match[0], "name").toLowerCase() === "description")?.[0];
  const description = descriptionTag ? attr(descriptionTag, "content") : "";
  const canonicalTag = [...html.matchAll(/<link\b[^>]*>/gi)].find((match) => attr(match[0], "rel").toLowerCase().split(/\s+/).includes("canonical"))?.[0];
  const canonical = canonicalTag ? attr(canonicalTag, "href") : "";
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const hasMain = /<main\b/i.test(html);
  const hasNav = /<nav\b/i.test(html);
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  const withAlt = images.filter((tag) => /\balt\s*=/i.test(tag)).length;
  const links = extractLinks(html, pageUrl);
  const internalLinks = links.filter(({ url }) => url.origin === new URL(pageUrl).origin);
  const emptyInternalLinks = internalLinks.filter(({ text }) => !text).length;
  const jsonLd = extractJsonLd(html);
  const types = [...schemaTypes(jsonLd)].sort();
  const invalidJsonLd = jsonLd.filter((block) => block.__invalid).length;
  const authorship = /\b(?:written|reviewed|authored)\s+by\b|\bby\s+[A-Z][\p{L}'’-]+(?:\s+[A-Z][\p{L}'’-]+){0,3}\b/iu.test(text)
    || types.some((type) => ["Person", "Article", "BlogPosting", "NewsArticle"].includes(type));
  const freshness = /<time\b/i.test(html) || /\b(?:published|updated|last modified)\b/i.test(text);
  const questions = (text.match(/[^.!?]{8,120}\?/g) || []).length;
  const answerPatterns = (text.match(/\b(?:in short|the answer is|here's why|because|depends on|best for|ideal for)\b/gi) || []).length;
  const numericFacts = (text.match(/(?:\b\d+(?:\.\d+)?%|\$\d[\d,.]*|\b\d+(?:\.\d+)?\s+(?:customers|users|studies|days|hours|years|tests|pages|brands|results)\b)/gi) || []).length;
  return {
    url: pageUrl,
    words,
    title,
    description,
    canonical,
    h1Count,
    hasMain,
    hasNav,
    imageCount: images.length,
    imageAltCoverage: images.length ? Math.round((withAlt / images.length) * 100) : 100,
    internalLinkCount: internalLinks.length,
    emptyInternalLinks,
    jsonLdBlocks: jsonLd.length,
    invalidJsonLd,
    schemaTypes: types,
    authorship,
    freshness,
    questionCount: questions,
    answerPatternCount: answerPatterns,
    numericFacts,
    links: internalLinks.map(({ url }) => url.href),
  };
}

export function analyzeRobots(text) {
  const groups = new Map();
  let currentAgents = [];
  let rulesSeen = false;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const directive = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (directive === "user-agent") {
      if (rulesSeen) currentAgents = [];
      rulesSeen = false;
      currentAgents.push(value.toLowerCase());
      if (!groups.has(value.toLowerCase())) groups.set(value.toLowerCase(), []);
    } else if ((directive === "allow" || directive === "disallow") && currentAgents.length) {
      rulesSeen = true;
      for (const agent of currentAgents) groups.get(agent).push({ directive, value });
    }
  }
  const bots = Object.fromEntries(AI_BOTS.map((bot) => {
    const explicit = groups.get(bot.toLowerCase());
    const rules = explicit ?? groups.get("*");
    if (!rules) return [bot, "unspecified"];
    const blocksAll = rules.some((rule) => rule.directive === "disallow" && rule.value === "/")
      && !rules.some((rule) => rule.directive === "allow" && rule.value === "/");
    return [bot, blocksAll ? "blocked" : "allowed"];
  }));
  return { bots, blocked: Object.entries(bots).filter(([, state]) => state === "blocked").map(([bot]) => bot) };
}

function signal(id, status, evidence) {
  const [category, weight, recommendation] = SIGNAL_META[id];
  return { id, category, weight, status, evidence, recommendation };
}

export function scoreSignals(signals) {
  const scored = signals.filter((item) => item.weight > 0);
  const possible = scored.reduce((sum, item) => sum + item.weight, 0);
  const earned = scored.reduce((sum, item) => sum + item.weight * (item.status === "pass" ? 1 : item.status === "warn" ? 0.5 : 0), 0);
  return possible ? Math.round((earned / possible) * 100) : 0;
}

function aggregateSignals(pages, probes, robotsAnalysis) {
  const totalWords = pages.reduce((sum, page) => sum + page.words, 0);
  const pageCount = pages.length || 1;
  const percent = (predicate) => Math.round((pages.filter(predicate).length / pageCount) * 100);
  const schemaCoverage = percent((page) => page.jsonLdBlocks > 0 && page.invalidJsonLd === 0);
  const titleCoverage = percent((page) => page.title && page.description);
  const semanticCoverage = percent((page) => page.h1Count === 1 && page.hasMain);
  const authorCoverage = percent((page) => page.authorship);
  const freshnessRelevant = pages.filter((page) => page.words >= 300);
  const freshCoverage = freshnessRelevant.length
    ? Math.round((freshnessRelevant.filter((page) => page.freshness).length / freshnessRelevant.length) * 100)
    : 100;
  const averageAlt = Math.round(pages.reduce((sum, page) => sum + page.imageAltCoverage, 0) / pageCount);
  const numericFacts = pages.reduce((sum, page) => sum + page.numericFacts, 0);
  const answerCapsules = pages.reduce((sum, page) => sum + Math.min(page.questionCount, page.answerPatternCount), 0);
  const organizationPresent = pages.some((page) => page.schemaTypes.some((type) => ["Organization", "Corporation", "LocalBusiness"].includes(type)));
  const signals = [
    signal("reachable", probes.home.ok ? "pass" : "fail", `HTTP ${probes.home.status || "error"}`),
    signal("robots", probes.robots.ok ? "pass" : "warn", `HTTP ${probes.robots.status || "error"}`),
    signal("sitemap", probes.sitemap.ok && /<urlset|<sitemapindex/i.test(probes.sitemap.text) ? "pass" : "warn", `HTTP ${probes.sitemap.status || "error"}`),
    signal("ai-crawler-access", robotsAnalysis.blocked.length ? "warn" : "pass", robotsAnalysis.blocked.length ? `Explicitly blocked: ${robotsAnalysis.blocked.join(", ")}` : "No explicit full-site AI bot blocks detected"),
    signal("raw-html-content", totalWords / pageCount >= 300 ? "pass" : totalWords / pageCount >= 100 ? "warn" : "fail", `${Math.round(totalWords / pageCount)} average extracted words`),
    signal("title-description", titleCoverage >= 90 ? "pass" : titleCoverage >= 60 ? "warn" : "fail", `${titleCoverage}% of sampled pages`),
    signal("semantic-structure", semanticCoverage >= 90 ? "pass" : semanticCoverage >= 60 ? "warn" : "fail", `${semanticCoverage}% with one H1 and a main landmark`),
    signal("canonical", percent((page) => page.canonical) >= 80 ? "pass" : "warn", `${percent((page) => page.canonical)}% of sampled pages`),
    signal("structured-data", schemaCoverage >= 80 ? "pass" : schemaCoverage > 0 ? "warn" : "fail", `${schemaCoverage}% valid JSON-LD coverage`),
    signal("organization-identity", organizationPresent ? "pass" : "warn", organizationPresent ? "Organization identity detected" : "No Organization/LocalBusiness type detected"),
    signal("image-alt", averageAlt >= 90 ? "pass" : averageAlt >= 60 ? "warn" : "fail", `${averageAlt}% average alt coverage`),
    signal("authorship", authorCoverage >= 60 ? "pass" : authorCoverage > 0 ? "warn" : "fail", `${authorCoverage}% of sampled pages`),
    signal("freshness", freshCoverage >= 60 ? "pass" : freshCoverage > 0 ? "warn" : "fail", `${freshCoverage}% of substantive pages`),
    signal("answer-capsules", answerCapsules >= pageCount ? "pass" : answerCapsules > 0 ? "warn" : "fail", `${answerCapsules} question/answer patterns`),
    signal("stat-density", numericFacts / Math.max(totalWords, 1) * 100 >= 0.5 ? "pass" : numericFacts > 0 ? "warn" : "fail", `${(numericFacts / Math.max(totalWords, 1) * 100).toFixed(2)} concrete facts per 100 words`),
    signal("descriptive-links", pages.some((page) => page.emptyInternalLinks > 0) ? "warn" : "pass", `${pages.reduce((sum, page) => sum + page.emptyInternalLinks, 0)} empty internal links`),
    signal("llms-txt", probes.llms.ok ? "pass" : "warn", `${probes.llms.status || "not found"}; experimental, zero score weight`),
    signal("security-txt", probes.security.ok ? "pass" : "warn", `HTTP ${probes.security.status || "not found"}`),
  ];
  return signals;
}

async function crawl(originUrl, maxPages, timeoutMs) {
  const queue = [originUrl.href];
  const visited = new Set();
  const pages = [];
  let homeResponse;
  while (queue.length && pages.length < maxPages) {
    const next = queue.shift();
    const normalized = new URL(next);
    normalized.hash = "";
    if (visited.has(normalized.href) || normalized.origin !== originUrl.origin) continue;
    visited.add(normalized.href);
    const response = await request(normalized, timeoutMs);
    if (!homeResponse) homeResponse = response;
    if (!response.ok || !response.contentType.includes("text/html")) continue;
    const page = analyzeHtml(response.text, response.url);
    pages.push(page);
    for (const href of page.links) {
      const url = new URL(href);
      url.hash = "";
      if (url.origin === originUrl.origin && !visited.has(url.href) && !/\.(?:jpg|jpeg|png|gif|webp|svg|pdf|zip)$/i.test(url.pathname)) queue.push(url.href);
    }
  }
  return { pages, homeResponse: homeResponse || { ok: false, status: 0, text: "", url: originUrl.href } };
}

export async function auditSite(target, options = {}) {
  const maxPages = options.maxPages ?? 10;
  const timeoutMs = options.timeoutMs ?? 10_000;
  const targetUrl = normalizeTarget(target);
  const { pages, homeResponse } = await crawl(targetUrl, maxPages, timeoutMs);
  const finalUrl = new URL(homeResponse.url || targetUrl);
  const root = new URL("/", finalUrl);
  const [robots, sitemap, llms, security] = await Promise.all([
    request(new URL("/robots.txt", root), timeoutMs, "text/plain,*/*"),
    request(new URL("/sitemap.xml", root), timeoutMs, "application/xml,text/xml,*/*"),
    request(new URL("/llms.txt", root), timeoutMs, "text/plain,*/*"),
    request(new URL("/.well-known/security.txt", root), timeoutMs, "text/plain,*/*"),
  ]);
  const robotsAnalysis = analyzeRobots(robots.ok ? robots.text : "");
  const probes = { home: homeResponse, robots, sitemap, llms, security };
  const signals = aggregateSignals(pages, probes, robotsAnalysis);
  const score = scoreSignals(signals);
  return {
    tool: { name: "LEGIT Agentic", version: "0.1.0", methodology: "technical-readiness-v1" },
    target: targetUrl.href,
    finalUrl: homeResponse.url,
    auditedAt: new Date().toISOString(),
    pagesSampled: pages.length,
    readinessScore: score,
    grade: score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F",
    scopeNote: "This score covers deterministic site readiness. It does not claim to measure live AI rankings or citations.",
    signals,
    robots: robotsAnalysis,
    pages: pages.map(({ links, ...page }) => page),
    nextStep: "Run the query matrix in methodology/query-template.json across answer engines and track mention, citation, accuracy, position, and competitors separately.",
  };
}

function escapeCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

export function renderMarkdown(report) {
  const lines = [
    `# Agentic audit: ${report.finalUrl || report.target}`,
    "",
    `- Readiness: **${report.readinessScore}/100 (${report.grade})**`,
    `- Pages sampled: **${report.pagesSampled}**`,
    `- Audited: **${report.auditedAt}**`,
    "",
    `> ${report.scopeNote}`,
    "",
    "## Signals",
    "",
    "| Status | Category | Signal | Evidence |",
    "|---|---|---|---|",
  ];
  for (const item of report.signals) {
    const icon = item.status === "pass" ? "PASS" : item.status === "warn" ? "WARN" : "FAIL";
    lines.push(`| ${icon} | ${escapeCell(item.category)} | ${escapeCell(item.id)} | ${escapeCell(item.evidence)} |`);
  }
  const issues = report.signals.filter((item) => item.status !== "pass");
  lines.push("", "## Recommended work", "");
  issues.forEach((item, index) => lines.push(`${index + 1}. **${item.id}:** ${item.recommendation} (${item.evidence})`));
  lines.push("", "## Live visibility next step", "", report.nextStep, "");
  return `${lines.join("\n")}\n`;
}
