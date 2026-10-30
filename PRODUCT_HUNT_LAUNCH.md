# Product Hunt Launch Kit — Open Trends

> Everything you need to submit and launch Open Trends on Product Hunt. Copy/paste the fields below into the submission form at https://www.producthunt.com/posts/new.

---

## 1. Listing details

**Name**
```
Open Trends
```

**Tagline** (max 60 chars)
```
Free theme-level trend analysis from Keyword Planner data
```
(57 chars)

**Website / Product URL**
```
https://opentrends.win/
```

**GitHub (open source)**
```
https://github.com/saarth/OpenTrends
```

**Topics / Tags** (pick up to 3-5 on PH)
- Analytics
- Marketing
- SEO
- Open Source
- Productivity

**Pricing**
```
Free (open source, MIT)
```

**Maker**
- Name: Sarth Atul Jauhari
- Handle: @saarth
- Location: Amsterdam, Netherlands
- GitHub: https://github.com/saarth
- LinkedIn: https://www.linkedin.com/in/saarth

**Thumbnail** (240 × 240 px)
Use `logo-short.svg` exported to PNG at 240×240 on the `#1f2d4a` accent background, or crop the full logo. Keep it simple and high-contrast.

---

## 2. Short description (shown in feed / cards)

```
A free, open-source browser app that turns Google Keyword Planner exports into theme-level trend analysis for any category: growth, velocity, seasonality and top searches. No accounts, no tracking — everything runs locally in your browser.
```

---

## 3. Long description (product page body)

```
Open Trends takes a Google Keyword Planner export (keywords + monthly search volumes) and a dictionary of keyword buckets you define (themes), tags every search term against those buckets, and reports what is actually moving — at theme, term, brand and product-type level.

You supply the category searches and the keyword buckets; Open Trends does the tagging and the math. The bundled example is a 22-theme fragrance taxonomy, but the tool is category-agnostic: upload your own export and definitions to analyse any category.

What you get:

• Theme-level size, share, latest month, short- and long-term growth
• Velocity map — short-term vs long-term growth, sized by search volume
• Term-level drivers inside each theme (what's actually pulling a trend up or down)
• Brand and product-type attribution (112 brands + 16 product types in the starter set)
• Seasonality and monthly volume charts, plus a Jan–Dec seasonality index
• Top searches per theme, with their own growth
• A full Excel workbook + CSV/JSON exports for BI tools
• Coverage breakdown showing exactly which searches didn't match and why

Privacy first: everything runs in your browser. Your data is never uploaded anywhere. No ads, no tracking, no accounts. Self-hostable via Docker or any static server.

Built because manual workbook analysis of Keyword Planner data doesn't scale — and because most "trend" tools only show you a single keyword at a time, never the theme behind it.
```

---

## 4. Key features (bullet list for PH)

- 📊 Theme-level growth, size, share and velocity for any category
- 🔍 Boolean query engine (OR / AND / NOT / NEAR/n / wildcards / phrases) for defining themes
- 🏷️ Brand & product-type attribution with fuzzy typo matching
- 📈 Seasonality index + monthly volume charts
- 🧩 Coverage report + downloadable unclassified CSV
- 📥 Full Excel workbook + CSV/JSON exports
- 🔒 100% local, no uploads, no accounts, no tracking
- 🐳 Self-hostable (Docker compose included)
- 🆓 Free and open source (MIT)

---

## 5. Maker's first comment (post immediately after launch)

```
Hey Product Hunt! 👋

I'm Sarth — I work in insights & analytics (Global I&A at Reckitt) and I spend a lot of time turning Google Keyword Planner exports into "what's actually trending in this category" reports.

The manual version of this is a 40-tab workbook: tag thousands of keywords against theme definitions, sum monthly volumes, compute growth, build seasonality, repeat next month. It works, but it doesn't scale, and every new category means rebuilding the whole thing.

Open Trends is that workbook turned into a browser app:

1. Drop in a Keyword Planner export (.xlsx/.xls/.csv).
2. Define your themes as Boolean queries or plain term lists (the bundled example is 22 fragrance themes).
3. Get theme-level growth, a velocity map, term drivers, brand/product attribution, seasonality and top searches — plus a full Excel workbook export.

Everything runs locally. No uploads, no accounts, no tracking. The code is MIT on GitHub.

A few things I'm proud of:
• The query engine supports NEAR/n, NOT, wildcards and phrases, matched against words (not raw strings), with light stemming.
• "Bare note" and "product context" toggles rescue searches like "sandalwood candle" that naive keyword matching drops.
• The Coverage card tells you exactly which searches didn't match and why, and exports them as CSV so you can extend your definitions.

It's a v1 and I'd love feedback on: which categories you'd want starter dictionaries for, whether the Boolean syntax is intuitive, and any edge cases in the parser.

Try the live demo (pre-loaded fragrance example) at https://opentrends.win/ — no signup.

Happy to answer anything in the comments! 🙏
```

---

## 6. Gallery image plan (5 images, 1270 × 760 px recommended)

Product Hunt gallery images display at 1270×760. Capture these views from https://opentrends.win/ (demo data pre-loaded). Use a 1280×800 (or larger) browser window, then crop/pad to 1270×760. Name files `ph-01.png` … `ph-05.png`.

| # | File | View to capture | What to show |
|---|------|-----------------|--------------|
| 1 | ph-01.png | Overview tab (hero) | KPI cards + velocity bubble map + fastest-growing themes. This is the "wow" shot. |
| 2 | ph-02.png | Theme growth tab | Theme table with size/share/growth + monthly volume chart. |
| 3 | ph-03.png | Theme deep dive tab | Term contribution chart + driver summary + brand/product mix. |
| 4 | ph-04.png | Brands & products tab | Brand table + chart + spotlight. |
| 5 | ph-05.png | Seasonality tab | Seasonality index heatmap + monthly chart. |

Tips:
- Hide the setup card (scroll down to results) so the screenshot leads with data.
- Use the pre-loaded fragrance demo (no upload needed) — it looks complete on first paint.
- Add a subtle caption overlay in your image editor (e.g., "Theme-level growth & velocity") — PH allows text on gallery images.
- Export PNG, keep under ~5 MB each.

### Screenshots captured (ready to upload)
The 5 gallery images have been captured at 1270x760 and saved to the project root as `ph-01.png` ... `ph-05.png`:

| # | File | View |
|---|------|------|
| 1 | ph-01.png | Overview: KPIs + velocity map + fastest-growing themes |
| 2 | ph-02.png | Theme growth table + monthly volume chart |
| 3 | ph-03.png | Theme deep dive: term contributions + driver summary |
| 4 | ph-04.png | Brands & products |
| 5 | ph-05.png | Seasonality |

No manual capture needed. Review them in the Review pane and replace any you dislike.

### (Previous manual steps kept for reference)
1. Open https://opentrends.win/ in Chrome.
2. Wait for the fragrance demo to render (you'll see 2,571 keywords matched).
3. For each tab above: click the tab, scroll to top of results, take a full-window screenshot (Win: Win+Shift+S, or Chrome DevTools → device toolbar → capture screenshot).
4. Crop to 1270×760 and save as ph-0N.png.

---

## 7. Launch checklist

### Pre-launch (T-3 to T-1 days)
- [ ] Create PH account / maker profile; verify email; add bio + photo + links.
- [ ] Prepare thumbnail (240×240) and 5 gallery images (1270×760).
- [ ] Decide launch date: Tuesday–Thursday, 12:01 AM PT (PH day starts at 12:01 AM PT).
- [ ] Optional: find a well-known "hunter" to post it (increases initial visibility). If none, you can hunt it yourself.
- [ ] Pre-write the first comment (section 5) — paste immediately after posting.
- [ ] Line up 10–20 friends/colleagues to upvote + comment in the first 2 hours (no fake accounts; real people only).
- [ ] Test the live site on mobile + desktop; check OG image renders (https://opentrends.win/og-image.png).
- [ ] Ensure GitHub README has a "Launch on Product Hunt" badge placeholder ready.

### Launch day
- [ ] Post at 12:01 AM PT.
- [ ] Paste first comment within 5 minutes.
- [ ] Share link on LinkedIn, Twitter/X, relevant Slack/Discord communities (r/dataisbeautiful, r/SEO, r/marketing, indie hackers).
- [ ] Reply to every comment within the first 6 hours.
- [ ] Pin a "what's new / roadmap" reply if asked.

### Post-launch (T+1 to T+7)
- [ ] Add "Featured on Product Hunt" badge to README + site footer.
- [ ] Write a short retrospective (traffic, signups, feedback) — share on LinkedIn.
- [ ] Triage feedback into GitHub issues; tag `product-hunt`.
- [ ] Follow up with anyone who requested a starter dictionary for their category.

---

## 8. Suggested outreach message (for hunter / community)

```
Hey [name] — I just launched Open Trends on Product Hunt: a free, open-source browser tool that turns Google Keyword Planner exports into theme-level trend analysis (growth, velocity, seasonality, brand attribution). Everything runs locally, no accounts.

It'd mean a lot if you could check it out and leave a comment with feedback: [PH link]

No pressure at all — even a quick upvote helps. Thanks!
```

---

## 9. PH submission form — quick reference

- Product name: Open Trends
- Tagline: Free theme-level trend analysis from Keyword Planner data
- Website: https://opentrends.win/
- Topics: Analytics, Marketing, SEO, Open Source
- Pricing: Free
- "Is this your product?": Yes (maker)
- Maker: Sarth Jauhari

---

*Generated for the Open Trends project. Update copy as the product evolves.*
