# Open Trends

A free, open-source, local browser app for turning Google Keyword Planner exports into theme-level trend analysis for **any category**.

No ads, no tracking, no accounts: everything runs in your browser and your data is never uploaded.

You define the category searches and the keyword buckets (themes); Open Trends tags each search term against them and produces theme-level and term-level growth, size, velocity, seasonality and top-search tables — plus brand/product attribution and an Excel export. The bundled example is a 22-theme fragrance taxonomy.

Everything runs locally in the browser. No data is uploaded.

## Quick start

1. Double-click `index.html` (or open it in Chrome/Edge). It opens on the Overview with a pre-computed fragrance example already loaded.
2. Drop in a Keyword Planner export (`.xlsx`, `.xls` or `.csv`). The workbook `Fragrance Trends GKP Data Sep2026.xlsx` works — use any sheet with a `Keyword` column and monthly date columns (Google names the sheet after the export time, so the name varies).
3. Check the detected sheet, short/long windows and keyword dedupe setting.
4. Click **Run analysis**.
5. Explore the tabs and use **Export → Download full Excel workbook**.

## Using your own category

Open Trends is category-agnostic. The two inputs are:

1. **Category searches** — a Google Keyword Planner export for the category (any set of search terms with monthly volumes).
2. **Keyword buckets (themes)** — a dictionary mapping each theme name to a Boolean query or a list of terms. Upload it under **Category definitions** (`example-categories.xlsx` / `.json` show the expected shape), or paste it into the panel and press **Apply dictionary**.

The bundled 22 fragrance themes (from `Fragrance Groups Definitions.xlsx`) stay loaded as a working example until you replace them. The brand and product dictionaries are optional and also replaceable.

> The first-paint analysis (`fragrance-trends.js`) is a pre-computed snapshot of the fragrance example. It is a demo, not a limit: upload your own export and definitions to analyse any category in the browser.

## What the tool expects

A table with:

- a **keyword** column (`Keyword`, `Query`, `Search term`, …);
- an **AMS / average monthly searches** column (optional — if missing, AMS is estimated from the monthly values);
- **monthly date columns** (e.g. `2020-02-01`, `Feb-2020`, `01/02/2020`).

The parser auto-detects the header row, so extra title rows are fine.

## Theme definitions

The older 11-theme workbook term list is still available with **Load workbook term list**.

Each theme is either a **Boolean query** or a plain **term list**. The shipped 22 fragrance themes are queries, because the definitions in the source file are queries:

```
((water OR rain OR aqua OR marine OR glacier OR oasis OR ice OR snow OR frost ...)
 NEAR/3
 (scent OR fragrance OR perfume OR aroma OR smell OR bouquet OR note* OR fragranc*))
OR
(#aquatic OR #marine OR #ozonic)
NOT
(recipe OR cooking OR drink OR "beach party" OR vacation OR travel OR weather)
```

### Query syntax

| Syntax | Meaning |
|---|---|
| `OR` | either side matches |
| `AND`, or two terms side by side | both sides must match |
| `NOT` | right side must not match |
| `NEAR/n` | both sides match, with at most *n* words between them |
| `( … )` | grouping |
| `"sea salt"` | exact phrase |
| `note*`, `bath?` | `*` = any run of characters, `?` = one character |
| `#aquatic` | hashtag prefix; the `#` is ignored when matching |

Precedence runs **`NEAR` → `AND` → `OR` → binary `NOT`**, so

```
A OR B NOT C      ≡      (A OR B) AND NOT C
```

which is how the source definitions read.

Matching runs against the **words** of each search term, not the raw string, so `NEAR/3` counts whole words. Very light English stemming is applied so `scented` matches `scent` and `roses` matches `rose` — but `rosemary` does not match `rose`.

### Terms inside a theme

The **Terms** tab and the Excel `Term Growth` sheet list the positive atoms of each query (the note words, not the `NOT` exclusions). Atoms shared by four or more themes — `scent`, `fragrance`, `perfume`, `aroma`, `note*`, `fragranc*` — are treated as category words and omitted, so a theme is broken down by its actual notes. Terms still overlap: one keyword can contribute to several themes and several terms.

### Product context toggle

Most fragrance definitions ask for a note **near a scent word** (`scent`, `fragrance`, `perfume`, `aroma`, `smell`, `bouquet`, `note*`), and most do not list product words. Without help, `sandalwood candle` and `vanilla wax melt` do not match anything.

**Treat product words as search context** (on by default) adds a product vocabulary to the right-hand side of every `NEAR/n` at compile time: candle, wax melt, wax warmer, diffuser, air freshener, room spray, car freshener, incense, soap, body wash, lotion, body mist, body spray, perfume oil, cologne, detergent, laundry, scented.

### Bare note searches

A search that is *only* a note and filler words — `sandalwood`, `patchouli oil`, `white musk`, `bergamot essential oil` — has no context word at all, so the `NEAR` test cannot pass. **Also match bare note searches** (on by default) accepts those using the distinctive notes of each query, and only those:

- the keyword must be at most three words, and every word must be a note of the group or filler (`pure`, `essential`, `oil`, `black`, `white`, `men`, `women`, …);
- category words (`perfume`, `candle`, `bath`, `fragrance`, `wax`, `spray`, …) never count as notes;
- words shared by four or more groups are ignored, as in the term tables;
- so `sandalwood` → Woody, `white musk` → Musk/Animalic, but `vanilla extract`, `rose garden`, `wood wick`, `air freshener` and `bath and body works` stay out.

Coverage on the full 22,524-keyword Sep 2026 export:

| Mode | Keywords matched | AMS matched |
|---|---|---|
| Definitions exactly as written | 1,630 (7.2%) | 9.99M (4.6%) |
| + product context | 2,496 (11.1%) | 11.69M (5.4%) |
| + bare notes (default) | 2,571 (11.4%) | 13.08M (6.1%) |

Both settings apply immediately and re-run the analysis.

### Why most searches are not in a theme

The example definitions classify a search only when it names a **note**. Most of a Keyword Planner export does not. On the Sep 2026 export the remainder splits like this:

| Bucket | Keywords | AMS | Share of AMS |
|---|---|---|---|
| Classified by the theme definitions | 2,571 | 13.08M | 6.1% |
| Brand searches with no note word | 8,045 | 118.64M | 55.2% |
| Product or category searches with no note word | 7,390 | 50.01M | 23.3% |
| Everything else (no theme match) | 4,518 | 33.34M | 15.5% |

Bath & Body Works retailer searches alone account for 321 keywords and 1.79M AMS (`bath and bath works`, `bath and body works coupons`, `bath works near me`, …), and most of them carry no note word. A note cannot be inferred from a retailer name, and mapping `bath` to Clean & Linen at that scale would just relabel the retailer as a note. Those searches are attributed to the brand instead, in **Brands & products**.

The **Coverage** card on the Overview tab shows this split for the file you loaded, lists the 20 largest unclassified searches with the reason, and **Download unclassified CSV** exports all of them so the definitions or brand dictionary can be extended.

### Workbook term list

**Load workbook term list** restores the original 11-theme, ~417-term fragrance dictionary from the manual workbook (`Outdoor`, `REM Scents`, `Floral`, `Gourmand`, `Aromatic`, `Fresh`, `Fruit`, `Tropical`, `Citrus`, `Linen`, `Lavender`). Term lists keep the older forgiving matching:

- case-insensitive;
- substring-based by default, so `flower` matches `flowerbomb`;
- short terms (≤ 4 characters) match whole words, so `tea` does not match `steam`;
- `*` and `?` wildcards are supported.

### Editing and uploading

Edit the JSON directly and press **Apply dictionary**, or upload a dictionary from JSON or from an Excel/CSV table with a group column and a term/query column. A cell that reads like a Boolean expression (`OR`, `AND`, `NOT`, `NEAR/n`, parentheses, `*`, `?`) becomes a group query instead of a term.

```json
{
  "Gourmand": "((vanilla OR caramel OR praline) NEAR/3 (scent OR perfume OR candle)) NOT (recipe)",
  "Fruit": ["cherry", "apple", "strawberry"]
}
```

## Brands and products (optional dimension)

The second dimension attributes matched keywords to **brands** and **product types**, so you can answer “which brands and products are driving this theme”. The bundled brand and product dictionaries are a fragrance starter set — replace them with your own for a different category.

- 112 fragrance brands, including aliases validated against brand sites and retailer listings (Bath & Body Works = `bbw`, `b&bw`; Le Labo = `santal 33`; Thymes = `frasier fir`; Tyler = `glamorous wash`; Al Haramain = `amber oud`; Maison Francis Kurkdjian = `baccarat rouge`, `gentle fluidity`; `mahogany teakwood` / `mahogany apple` → Bath & Body Works).
- 16 product types: perfume, cologne, candle, wax melt, diffuser, air freshener, room spray, body mist, lotion / body care, hair mist, hand soap, car freshener, incense, laundry, candle accessory, gift set.

The dictionary is editable in the **Brand & product dictionary** panel and exports as `Brand Growth`, `Product Types` and `Brand Mix` sheets.

Attribution notes:

- A keyword can belong to several brands only when the brand aliases overlap; brand rows are deduplicated per keyword.
- Brand/type **share** is a share of total AMS in the file, not of a theme.
- Theme × brand **share of theme** is the brand’s AMS inside that theme divided by the theme’s AMS. Brands that do not appear in a theme are omitted.
- Brand ownership is not rolled up: Yankee Candle and WoodWick are listed separately even though both belong to Newell Brands.

### Spelling variants and misspellings

Keyword Planner data is full of typos and variants. The brand dictionary carries aliases for the common ones, and a small normalisation map rewrites them before attribution:

- `barakkat`, `barakat`, `barrakat` → `baccarat` (Maison Francis Kurkdjian)
- `acqua de gio`, `acqua gio` → `acqua di gio` (Giorgio Armani)
- `bleu chanel`, `chanel de bleu` → `bleu de chanel` (Chanel)
- `lelabo` → `le labo`, `ysl` → `yves saint laurent`, `mkf` → `maison francis kurkdjian`

Plus a new brand, **Acqua di Parma**. The normalisation is applied only to brand/product attribution, never to fragrance-family matching, and the displayed keyword is rewritten to the canonical form. The map is editable in `default_brands.js` (`window.BRAND_NORMALIZE`) and brand aliases in `window.DEFAULT_BRANDS`.

**Fuzzy matching (opt-in).** For messy exports, the **Fuzzy match brand aliases** toggle (off by default) attributes a search to a brand when one of its aliases is within one edit of a search word, catching novel single-character typos such as `creed aventuss`, `dior sauvaage`, `versace eross`, `tom ford oud woodd`. It only fires when exact matching found nothing, only for aliases of at least two words (or single brand names of six characters or more), allows at most one fuzzy word per alias, and only when exactly one brand matches, so `cat urine smell remover` and `best scents for women` stay unattributed. Leave it off for clean data.

## Outputs

| Tab | What it shows |
|---|---|
| **Overview** | KPI cards (keywords and AMS classified), velocity bubble map (size vs short- and long-term growth), fastest-growing themes, and a coverage breakdown with the largest unclassified searches |
| **Theme growth** | Size, share, latest month, short-term and long-term growth for each theme, plus a monthly volume chart |
| **Theme deep dive** | What is driving a theme: term contributions, biggest risers/drags, growth concentration, brand and product-type mix, and the keywords behind the change |
| **Terms** | Term-level size, keyword count, latest month and growth within a theme, plus the keywords behind each term |
| **Brands & products** | Brand or product-type table with size, share, growth and top search; filter by keyword term; click a row for its top searches and product mix |
| **Top searches** | Top keywords by AMS for a theme, with their own growth; filter by keyword term |
| **Seasonality** | Monthly volume over time or a Jan–Dec seasonality index; heatmap table; focus on a single keyword term |
| **Export** | Full Excel workbook, theme/term/top-search/driver/brand/product CSVs, full JSON |

Definitions:

- **Size** = sum of AMS for every keyword tagged with the theme. It is a scale signal, not a monthly volume.
- **Short-term growth** = `(latest month − start of short window) ÷ start of short window`. Default window: 12 months.
- **Long-term growth** = same calculation over the long window. Default: 48 months.
- **Seasonality index** = average volume for a calendar month ÷ average month for that theme × 100. 100 = an average month.
- **Share** = theme size ÷ AMS of all classified keywords. Themes can overlap, so shares can sum above 100%.

### Keyword-term filters

Three tabs can be narrowed to a single keyword term (the note or ingredient behind a theme):

- **Brands & products** — pick a term in the **Keyword term** dropdown (grouped by theme). The brand or product-type table is then measured only on that term's keywords, and the spotlight lists the searches inside the term for the selected brand. Growth columns are theme-level, so the term view ranks by size instead.
- **Top searches** — pick a term to restrict the list to keywords matching it.
- **Seasonality** — pick a term to chart that term's own monthly volume and seasonality index instead of whole themes. Selecting a theme chip clears the term filter.

Term options are rebuilt whenever the theme selector changes, and "All terms" restores the unfiltered view.

### Theme deep dive

Open **Theme deep dive** (or click **Deep dive →** on a theme row) to see which terms are driving a theme:

- **Term contribution** — each term’s change in monthly volume versus the window start, and that change as a share of the theme’s starting volume.
- **Biggest riser / drag** — the term adding or removing the most volume.
- **Fastest growing term** — strongest growth among terms with at least 1% of theme size.
- **Top 3 concentration** — how much of the gross positive change comes from the top three terms. High concentration means the trend rests on a few terms.
- **Brand mix / product mix** — which brands and product types make up the theme, with each one’s top search.
- **Keyword-level drivers** — the individual searches (top 20 risers and top 10 decliners) behind the term movements.

Term contributions overlap when one keyword matches several terms, so they can add up to more than the theme change. The keyword table is additive.

The defaults reproduce the workbook logic: with the Sep 2026 export (Oct 2022 to Sep 2026), the 12-month baseline is Oct 2025 and the 48-month baseline is Oct 2022.

## Excel export

The downloaded workbook contains:

- `Summary`
- `Theme Growth`
- `Term Growth`
- `Term Drivers`
- `Keyword Drivers`
- `Top Searches`
- `Brand Growth`
- `Product Types`
- `Brand Mix`
- `Seasonality Index`
- `Monthly Volumes`
- `Classification` (one row per theme: `term` rows for term lists, one `query` row for Boolean themes)

Growth columns are written as percentages.

## Method and limitations

**Definition artifacts.** These come from the definitions themselves and are reported rather than silently corrected:

- `bath` matches **Bath & Body Works**, so Clean & Linen is ~93% Bath & Body Works by AMS in this data set. The word is a genuine bath-note term, but in a home-fragrance export it mostly catches the retailer.
- `couture` matches **Juicy Couture**, so Premium Fragrances is partly a brand signal.
- `Zodiac` matches no keyword in the Sep 2026 export (it matched `zodiac candles` in the older one) and stays in the theme list at zero for completeness.
- `Dupes & Clones` matches 74 keywords (226,610 AMS) in this export.

**Coverage.** A query-only taxonomy is deliberately precise: it needs a note, so most keywords stay unclassified. That is a property of the definitions and of the export, not a parsing failure. The Coverage card and the unclassified CSV show exactly what was left out and why.

**Brand research.** Brand and alias coverage was checked against brand websites and retailer listings, and category share against published market summaries (home-fragrance share rankings, Statista 2024 most-searched fragrance rankings: Dior Sauvage, Versace Eros, Creed Aventus). Treat brand share in this tool as a search-share proxy, not revenue share.

**Other notes.**

- Large exports are parsed in memory. The preloaded Sep 2026 export is 5.9 MB; the older 84 MB workbook still works but parses more slowly.
- Theme, term and brand tags overlap by design; only keyword-level tables are additive.
- The manual workbook has a few quirks (for example placeholder `zxcvbnm` columns and terms that never matched because of non-breaking spaces). This tool uses the effective term list from the workbook and normalises whitespace, so small differences in absolute volumes are expected.
