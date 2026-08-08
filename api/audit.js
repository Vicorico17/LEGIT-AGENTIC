import { auditSite } from "../src/audit.js";

export const config = { maxDuration: 60 };

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Use POST." });
  }
  try {
    const target = typeof request.body?.target === "string" ? request.body.target.trim() : "";
    if (!target || target.length > 2048) return response.status(400).json({ error: "Enter a valid public domain or URL." });
    const report = await auditSite(target, { maxPages: 5, timeoutMs: 8_000 });
    response.setHeader("Cache-Control", "no-store");
    return response.status(200).json(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Audit failed.";
    return response.status(400).json({ error: message });
  }
}
