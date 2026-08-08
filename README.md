# LEGIT AGENTIC

An evidence-based toolkit for answering two different questions:

1. **Can AI agents access, understand, navigate, and act on this website?**
2. **Do AI answer engines actually mention, cite, and recommend this website?**

Most “AI SEO” audits blur those questions into one opaque score. LEGIT AGENTIC keeps them separate:

- **Agent Readiness** is deterministic and can be tested against the website.
- **AI Visibility** is observational and must be measured repeatedly across answer engines and buyer questions.

This repository combines the most useful ideas exposed by [40RTY AgentIQ](https://audit.40rty.ai/audit) and [Boring Marketing's AI Visibility Audit](https://boringmarketing.com/audit), removes duplicated or speculative checks, and turns the result into a reusable standard and CLI.

The repository also includes a responsive web interface and Vercel serverless endpoint for running the deterministic readiness audit without installing the CLI.

**Live web audit:** [legit-agentic.vercel.app](https://legit-agentic.vercel.app)

> [!IMPORTANT]
> A readiness score is not an AI ranking score. Passing every technical check does not guarantee that ChatGPT, Claude, Gemini, Perplexity, or Google will recommend a brand.

## What is included

- A zero-dependency Node.js website audit CLI
- Markdown and JSON reports
- A transparent scoring model
- Tests for HTML, schema, robots rules, and scoring
- A repeatable query matrix for live AI visibility experiments
- The combined methodology and implementation priorities below

## Quick start

Node.js 20 or newer is required.

```bash
git clone https://github.com/Vicorico17/LEGIT-AGENTIC.git
cd LEGIT-AGENTIC
npm test
node ./bin/legit-agentic.js https://example.com
```

Generate a machine-readable report:

```bash
node ./bin/legit-agentic.js example.com \
  --max-pages 10 \
  --format json \
  --output audit.json
```

Generate a Markdown handoff:

```bash
node ./bin/legit-agentic.js example.com \
  --format markdown \
  --output AGENTIC-AUDIT.md
```

The crawler inspects at most 10 same-origin HTML pages by default and never submits forms, logs in, purchases, or changes the target site.

## The combined model

```text
                         AGENTIC PERFORMANCE
                                  │
                  ┌───────────────┴───────────────┐
                  │                               │
          AGENT READINESS                   AI VISIBILITY
       deterministic website tests      repeated answer-engine tests
                  │                               │
     access → extraction → trust       queries → mentions → citations
     navigation → structured data      accuracy → competitors → trends
                  │                               │
                  └───────────────┬───────────────┘
                                  │
                         BUSINESS OUTCOMES
                  qualified visits, leads, sales, trust
```

### Why the split matters

Boring Marketing's public HeyGen report showed an **84/100 technical health score** but only **50% coverage across its 16 AI checks**. A site can be healthy and still lose recommendations to competitors. Conversely, a brand may be mentioned because of press, reviews, or communities even when its own website is technically weak.

## Part I: Agent Readiness

### 1. Access and discovery

Agents should receive predictable HTTP responses and find the site's important URLs.

Check:

- Successful canonical redirects and HTML responses
- Valid TLS
- An intentional `robots.txt`
- An XML sitemap
- No unintentional WAF, CAPTCHA, fingerprinting, authentication, or geo block
- Appropriate caching and rate-limit behavior
- Crawlable images and assets
- Optional machine-facing discovery files

OpenAI's crawler guidance specifically identifies robots rules, WAFs, JavaScript challenges, CAPTCHAs, authentication, and geo rules as potential access blockers.

### 2. Raw-HTML extractability

Important information should be present before client-side JavaScript executes:

- Page title and primary heading
- Substantive copy
- Product or service name
- Price, currency, availability, and variants where applicable
- Specifications and policies
- Canonical URL
- Relevant internal links

Client-side enhancement is fine. Client-side-only meaning is fragile. Google likewise recommends putting product data in initial HTML for the most reliable shopping crawls.

### 3. Semantic navigation

Pages should use:

- One clear `h1`
- A logical heading hierarchy
- `main`, `nav`, `header`, and `footer` landmarks
- Real links and buttons
- Visible, persistent form labels
- Valid ARIA
- Descriptive internal anchor text
- Stable selectors for important workflows
- Honest visibility without hidden duplicate controls

These practices serve people with disabilities, conventional crawlers, and browser-operating agents simultaneously.

### 4. Machine-readable facts

Structured data should describe visible, accurate content—not act as a shadow copy of a different reality.

Useful types include:

- `Organization` / `LocalBusiness`
- `Person` for genuine authors and reviewers
- `Article`, `BlogPosting`, or `NewsArticle`
- `Product`, `Offer`, and `ProductGroup`
- `FAQPage` where appropriate
- Shipping and merchant return policies
- Breadcrumbs

For commerce, keep name, brand, SKU, GTIN/MPN, price, currency, availability, images, variants, shipping, and returns consistent across HTML, JSON-LD, feeds, and APIs.

### 5. Identity and trust

Use the same official brand identity everywhere:

- Name and description
- Logo and canonical domain
- Contact details
- Social and directory profiles
- `sameAs` connections
- Merchant feeds and platform profiles
- Genuine author/reviewer identities
- Security contact

Trust also comes from third-party corroboration: reviews, directories, communities, independent press, research, and references.

### 6. Knowledge and policies

Publish factual, plain-text answers about:

- Shipping and delivery
- Returns and refunds
- Warranty and cancellation
- Sizing and specifications
- Compatibility and restrictions
- Support and escalation
- Privacy and data use

Do not bury core policy information only inside an image, PDF, modal, or support widget.

### 7. Commerce and post-purchase protocols

For applicable commerce sites, assess:

- Current product feeds
- Catalog search and filters
- Cart and checkout capabilities
- UCP/ACP/MCP integrations
- Safe OAuth and scoped delegated permissions
- Order status and tracking
- Returns and RMA initiation
- Refunds and support conversations

These checks are **not applicable** to ordinary brochure, portfolio, publishing, or lead-generation sites. Do not build transaction APIs just to improve an audit score.

## Part II: Quotability

Machine-readable content still needs to be useful enough to cite.

### Answer capsules

Important pages should contain short, self-contained passages that directly answer buyer questions. A useful capsule usually contains:

- The answer in the first sentence
- Relevant qualification or limitation
- A concrete fact or example
- A link to supporting evidence where needed

### Evidence density

Prefer verifiable details over promotional adjectives:

- Exact prices and limits
- Measurements and specifications
- Survey or benchmark results
- Dates and sample sizes
- Customer outcomes with context
- Methodology and cited sources

### Attribution and freshness

For citable pages, display:

- Author or responsible company
- Relevant expertise
- Reviewer when appropriate
- Published date
- Modified date
- Sources supporting claims

Not every evergreen legal or contact page requires a freshness date. Time-sensitive comparisons, guides, pricing pages, and research do.

### Buyer-intent coverage

Build content for real decisions, not just head keywords:

| Intent | Question the page should answer | Useful formats |
|---|---|---|
| Discovery | What are the best options for this use case? | category guide, best-of methodology |
| Use case | What works under this specific constraint? | solution page, case study |
| Comparison | How do the leading options differ? | comparison table, decision guide |
| Pricing | What does it cost and what changes the price? | transparent pricing explainer |
| Alternatives | What can replace a known option? | alternatives page |
| Limitations | What are the risks and poor-fit cases? | limitations, security, or trust page |
| Trust | Which provider is credible and why? | proof hub, research, reviews |
| Branded accuracy | What is this brand actually good and bad at? | about, product, FAQ, evidence pages |

Honest limitations content is particularly useful: if the brand does not explain tradeoffs, answer engines will borrow that explanation from a competitor or publisher.

## Part III: Live AI Visibility

Technical scores cannot measure this layer. It requires live, repeated observations.

### Minimum experiment

1. Define 20–50 stable buyer questions.
2. Separate branded from unbranded questions.
3. Group them by discovery, use case, comparison, pricing, alternatives, limitations, trust, and purchase intent.
4. Run each query at least three times.
5. Test ChatGPT, Perplexity, Claude, Gemini, and relevant Google AI surfaces.
6. Localize prompts when geography matters.
7. Save the answer, citations, date, engine, and run number.
8. Repeat weekly or monthly without changing the baseline query set.

Start with [`methodology/query-template.json`](methodology/query-template.json).

### Track separately

- Brand mention rate
- Domain citation rate
- Citation URLs
- Mention position
- Recommendation strength
- Share of voice
- Sentiment and framing
- Factual accuracy
- Competitors mentioned instead
- Source formats used
- Change over time

Never collapse all of these into a single number without retaining the underlying evidence.

### Source-gap analysis

When another brand wins, inspect what the answer engine cited:

- The competitor's own product page
- A guide or tutorial
- A best-of roundup
- A comparison page
- A review platform or local listing
- A community thread
- A video
- Original research

Then choose among three legitimate strategies:

1. **Create:** publish a more useful, attributable, current page.
2. **Earn:** supply real proof to the independent source already being cited.
3. **Correct:** make inaccurate brand/entity information consistent at its source.

Do not manufacture reviews, spam communities, impersonate customers, or buy undisclosed editorial placement.

## What 40RTY considers important

Inspection of 40RTY's public application exposed ten weighted layers:

| Layer | Published implementation weight | Interpretation |
|---|---:|---|
| Catalog and products | 30% | Product data, identifiers, variants, descriptions, attributes, feeds, APIs, and intent matching |
| Commerce protocols | 13% | UCP, ACP, MCP, carts, checkout, orders, payments, and fulfillment |
| AI visibility | 11% | Brand/category citations and knowledge sources |
| Discovery | 8% | Robots, sitemaps, agent-oriented files, and metadata |
| Rendering and access | 8% | SSR, JS-free facts, WAF access, stable structured data |
| Identity and trust | 6% | Organization identity, TLS, contact, and knowledge graph |
| Knowledge and policy | 6% | Shipping, returns, FAQs, help, and specifications |
| Authentication | 6% | OAuth, scoped permissions, registration, and limits |
| Agent navigation | 6% | Semantic HTML, labels, ARIA, visibility, and selectors |
| Post-purchase | 6% | Tracking, webhooks, returns, refunds, and conversation APIs |

The public UI says “85 signals,” while its exposed layer counts total 91 when six live catalog-quality signals are included. This is another reason not to treat a vendor score as an objective universal standard.

### Strong ideas to retain

- Structured and complete product facts
- Intent-aligned product descriptions and attributes
- Raw-HTML price, stock, and variants
- Searchable catalog surfaces and current feeds
- Safe transaction and post-purchase capabilities
- Access testing with real agent user agents
- Semantic, accessible navigation

### Experimental ideas to de-emphasize

- `llms.txt`
- `llms-full.txt`
- `/.well-known/llms.txt`
- `agents.md`
- `agent-manifest.json`
- Legacy `ai-plugin.json`
- Generic A2A/WebMCP manifests without a real integration

These files may be inexpensive discovery aids, but they are not established ranking levers.

## What Boring Marketing adds

Boring Marketing's free audit runs four generated buyer questions across four platforms, yielding 16 live checks. Its report adds:

- Coverage per engine and topic
- Competitors mentioned instead
- Actual citation sources
- Cited-page format classification
- Answer-capsule counts
- Concrete statistics per 100 words
- Authorship and freshness
- Thin/static extraction failures
- Prioritized content and placement opportunities

Its public research page reports, from its own continuously updated audit dataset:

- 13.7% overall citation rate across 12,593 platform checks
- 53% of brands invisible across all four tested platforms
- 51.7% of citations pointing to brands' own pages
- 36% of crawled pages thin or non-extractable
- 20.9% losing content without JavaScript
- 77% showing no visible date
- 21.2% showing author signals

These are useful directional observations, not controlled causal proof. The audit population is self-selected and classification is partly model-assisted.

Most importantly, its calibration reports approximately null generic value from `llms.txt` and blanket schema changes where extraction is already working. That does **not** make schema useless; it means schema is generally an eligibility/comprehension mechanism, not a guaranteed citation boost.

## CLI scoring

The included CLI scores only deterministic readiness signals. Every scored signal and weight is visible in [`src/audit.js`](src/audit.js).

Current categories include:

- Access and discovery
- Extractability
- Navigation
- Machine-readable data
- Identity and trust
- Quotability

Statuses receive:

- Pass: full signal weight
- Warning: half signal weight
- Fail: zero
- Experimental signal: zero score weight

The crawler intentionally uses heuristics. For example, it can detect JSON-LD syntax and types, but it cannot determine whether every claim is truthful. Human review remains required.

## Implementation order for real sites

1. Fix blocked, failed, redirected, or JavaScript-empty pages.
2. Put essential content and changing commerce facts in initial HTML.
3. Correct titles, headings, canonicals, semantic structure, and internal links.
4. Add accurate organization, author, product, offer, and policy data.
5. Publish direct answers to high-intent buyer questions.
6. Add authorship, dates, sources, numbers, examples, and limitations.
7. Build comparisons, pricing explainers, alternatives, and proof hubs.
8. Keep website, feed, profile, directory, and platform facts consistent.
9. Earn legitimate inclusion in already-cited external sources.
10. Run the fixed live query matrix repeatedly and correlate changes with qualified visits, leads, and revenue.
11. Add commerce protocols only when they support a real customer workflow.
12. Add experimental agent files last.

## Validation

```bash
npm run check
```

The test suite uses Node's built-in test runner, so there is no dependency installation step.

## Limits and non-goals

- This project does not claim access to proprietary ranking algorithms.
- One answer-engine run is not statistically reliable.
- An LLM-generated query set should be reviewed by someone who knows the market.
- Citation does not equal endorsement, accuracy, qualified traffic, or revenue.
- Structured data must match visible content.
- Robots preferences do not guarantee that every crawler will comply.
- `llms.txt` is a proposal, not a universal protocol.
- The CLI does not perform checkout, authentication, or destructive actions.

## Primary references

- [40RTY AgentIQ audit](https://audit.40rty.ai/audit)
- [40RTY Agentic Commerce Optimization manifest](https://audit.40rty.ai/manifest)
- [Boring Marketing AI Visibility Audit](https://boringmarketing.com/audit)
- [Boring Marketing public HeyGen audit](https://boringmarketing.com/audit/conY-ajdIFUa4ZOhDZX5aIxdG0WO1Ma_)
- [Boring Marketing State of AI Visibility](https://boringmarketing.com/ai-visibility-statistics)
- [Google Product structured data](https://developers.google.com/search/docs/appearance/structured-data/product)
- [Google merchant listing structured data](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing)
- [OpenAI shopping with ChatGPT Search](https://help.openai.com/en/articles/11128490-shopping-with-chatgpt-search)
- [OpenAI crawler guidance](https://help.openai.com/en/articles/20001243-advertiser-guidance-for-allowing-openai-web-crawlers)
- [Shopify agentic commerce](https://shopify.dev/docs/agents)
- [`llms.txt` proposal](https://llmstxt.org/)

## License

[MIT](LICENSE)
