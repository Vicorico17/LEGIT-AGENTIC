#!/usr/bin/env node

import { auditSite, renderMarkdown } from "../src/audit.js";

function help() {
  console.log(`legit-agentic <domain-or-url> [options]

Options:
  --format json|markdown   Output format (default: markdown)
  --max-pages N           Same-origin pages to inspect (default: 10, max: 25)
  --timeout MS            Request timeout (default: 10000)
  --output FILE            Write the report to a file
  --help                   Show this help

Examples:
  legit-agentic example.com
  legit-agentic https://example.com --format json --output audit.json
`);
}

function parseArgs(argv) {
  const options = { format: "markdown", maxPages: 10, timeoutMs: 10_000 };
  let target;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") return { help: true };
    if (argument === "--format") options.format = argv[++index];
    else if (argument === "--max-pages") options.maxPages = Number(argv[++index]);
    else if (argument === "--timeout") options.timeoutMs = Number(argv[++index]);
    else if (argument === "--output") options.output = argv[++index];
    else if (!target) target = argument;
    else throw new Error(`Unexpected argument: ${argument}`);
  }
  if (!target) throw new Error("A domain or URL is required.");
  if (!["json", "markdown"].includes(options.format)) throw new Error("--format must be json or markdown.");
  if (!Number.isInteger(options.maxPages) || options.maxPages < 1 || options.maxPages > 25) {
    throw new Error("--max-pages must be an integer from 1 to 25.");
  }
  if (!Number.isFinite(options.timeoutMs) || options.timeoutMs < 500 || options.timeoutMs > 60_000) {
    throw new Error("--timeout must be between 500 and 60000 milliseconds.");
  }
  return { target, options };
}

try {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) {
    help();
    process.exit(0);
  }
  const report = await auditSite(parsed.target, parsed.options);
  const output = parsed.options.format === "json"
    ? `${JSON.stringify(report, null, 2)}\n`
    : renderMarkdown(report);
  if (parsed.options.output) {
    const { writeFile } = await import("node:fs/promises");
    await writeFile(parsed.options.output, output, "utf8");
    console.error(`Wrote ${parsed.options.output}`);
  } else {
    process.stdout.write(output);
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
