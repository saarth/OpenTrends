# LinkedIn Post — Open Trends Launch

> Ready to paste into LinkedIn. Pick the version that fits your voice. Attach one of the screenshots (`ph-01.png` … `ph-05.png`) or the `og-image.png` as the post image — LinkedIn posts with an image get ~2x reach.

---

## Version A — Story-led (recommended)

I spend a lot of time turning Google Keyword Planner exports into "what's actually trending in this category" reports.

The manual version of that is a 40-tab workbook: tag thousands of keywords against theme definitions, sum monthly volumes, compute growth, build seasonality, repeat next month. It works. It just doesn't scale — and every new category means rebuilding the whole thing.

So I built Open Trends.

It's a free, open-source browser app that takes a Google Keyword Planner export (keywords + monthly search volumes) plus a dictionary of keyword buckets you define (themes), tags every search term against those buckets, and reports what's actually moving — at theme, term, brand and product-type level.

What you get:
• Theme-level size, share, and short/long-term growth
• A velocity map (short-term vs long-term growth, sized by search volume)
• Term-level drivers inside each theme — what's actually pulling a trend up or down
• Brand and product-type attribution (112 brands + 16 product types in the starter set)
• Seasonality and monthly volume charts, plus a Jan–Dec seasonality index
• Top searches per theme, with their own growth
• A full Excel workbook + CSV/JSON exports for BI tools
• A coverage breakdown showing exactly which searches didn't match, and why

Privacy first: everything runs in your browser. Your data is never uploaded anywhere. No ads, no tracking, no accounts. Self-hostable via Docker.

The bundled example is a 22-theme fragrance taxonomy, but the tool is category-agnostic — upload your own export and definitions to analyse any category. Boolean query engine (OR / AND / NOT / NEAR/n / wildcards / phrases), matched against words, with light stemming.

Try the live demo (pre-loaded fragrance example, no signup): https://opentrends.win/
Code (MIT): https://github.com/saarth/OpenTrends

I'd love feedback, especially on:
- Which categories you'd want starter dictionaries for
- Whether the Boolean syntax is intuitive
- Any edge cases in the parser

If you work in insights, SEO, or category management and have a Keyword Planner export sitting around, give it a spin and tell me what breaks.

#OpenSource #DataAnalytics #SEO #KeywordResearch #TrendAnalysis #GoogleKeywordPlanner #MarketingAnalytics #Insights

---

## Version B — Short & punchy (for a quick post)

Turned my Keyword Planner workbook into a browser app.

Open Trends: drop in a Google Keyword Planner export, define your themes as Boolean queries, get theme-level growth, velocity, seasonality, brand attribution + a full Excel export. Runs 100% in your browser, no uploads, no accounts. Free & open source.

Try it: https://opentrends.win/
Code: https://github.com/saarth/OpenTrends

#OpenSource #SEO #DataAnalytics #TrendAnalysis

---

## Version C — Carousel/document style (if posting as a PDF carousel)

Slide 1 — Title: "I turned a 40-tab Keyword Planner workbook into a browser app"
Slide 2 — The problem: tagging thousands of keywords, summing volumes, computing growth, repeating monthly
Slide 3 — The solution: Open Trends (free, open source, runs in browser)
Slide 4 — Feature: Velocity map + theme growth
Slide 5 — Feature: Term drivers + brand/product attribution
Slide 6 — Feature: Seasonality + Excel export
Slide 7 — Privacy: no uploads, no accounts, no tracking
Slide 8 — CTA: try the demo + GitHub link

Use screenshots ph-01 … ph-05 as slide backgrounds.

---

## Posting tips

- **Image:** attach `ph-01.png` (Overview) or `og-image.png`. LinkedIn crops to ~1.91:1; 1270×760 is close enough.
- **First comment:** paste the GitHub link + "happy to answer questions" as the first comment to boost early engagement.
- **Tagging:** tag 2–3 relevant people (colleagues in insights/SEO) who'd genuinely find it useful — don't spam.
- **Timing:** Tue–Thu, 8–10 AM in your target audience's timezone.
- **Follow-up:** reply to every comment within the first 2 hours; post a "what I learned launching" follow-up 3–5 days later.
- **Hashtags:** 5–8 max; LinkedIn penalises hashtag stuffing.

---

## Suggested first comment (post immediately after publishing)

"Happy to answer questions here. If you want to try it on your own category, the 'Category definitions' panel accepts a JSON/XLSX/CSV dictionary — one row per theme with a Boolean query or term list. The example file (example-categories.xlsx) shows the expected shape. Full docs: https://github.com/saarth/OpenTrends"
