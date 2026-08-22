# LEGIT AGENTIC — Next steps

## P0 — Turn the paid offer into a real product

- [ ] Choose and connect a payment provider: Stripe, Lemon Squeezy, or Polar.
- [ ] Add a real checkout URL to the paid-plan CTAs.
- [ ] Create a paid-report endpoint that receives a completed audit and payment confirmation.
- [ ] Generate the personalized improvement report from failed and warned signals.
- [ ] Include priority, expected score opportunity, plain-language fix, implementation notes, and a verification checklist.
- [ ] Deliver the paid report by email and provide a downloadable Markdown/PDF version.
- [ ] Do not expose paid recommendations before payment is confirmed.

## P1 — Capture and understand demand

- [ ] Add optional email capture after the free score.
- [ ] Store audit history so users can compare scores over time.
- [ ] Add a simple consent/privacy notice for email collection.
- [ ] Add lightweight analytics for audit starts, completed audits, upgrade clicks, and paid conversions.
- [ ] Add a feedback prompt: “Was this score useful?”

## P1 — Improve the audit product

- [ ] Add a visible “top opportunity” summary to the free results.
- [ ] Add category scores for Access, Context, Trust, and Action.
- [ ] Add a score explanation page with methodology and weighting.
- [ ] Add industry-specific checks for ecommerce, SaaS, local business, and service companies.
- [ ] Add AI visibility tracking as a separate, observational product—not part of the technical SCORE.
- [ ] Add scheduled re-scoring and score-change notifications.

## P2 — Trust, conversion, and polish

- [ ] Add a real sample paid report with redacted example data.
- [ ] Add testimonials, customer logos, or before/after score case studies.
- [ ] Add a custom domain and production Vercel deployment.
- [ ] Add a privacy policy, terms, and clear data-retention language.
- [ ] Add error monitoring and rate limiting to `/api/audit`.
- [ ] Add abuse protection for repeated audits and hostile public URLs.
- [ ] Run a full responsive visual QA pass on desktop and mobile.
- [ ] Add accessibility checks for keyboard navigation, contrast, and screen readers.

## Later — Services and growth

- [ ] Create a team dashboard for agencies and multi-site businesses.
- [ ] Add white-label reports for consultants and agencies.
- [ ] Add a “done with you” implementation service workflow.
- [ ] Publish the methodology as a public benchmark and comparison guide.
- [ ] Add integrations for CMS, analytics, Search Console, and structured-data validation.

## Current state

- Free website audit and SCORE are working.
- Free results show evidence and pass/warning/fail status.
- Paid recommendations are currently represented by a locked CTA.
- The site is deployed to Vercel as a preview.
- The latest GitHub commit is the product-experience update.
