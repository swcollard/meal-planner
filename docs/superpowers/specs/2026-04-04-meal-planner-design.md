# Meal Planner Web App — Design Spec

## Context

A local-only web app that wraps an existing meal planning agent prompt. The agent generates weekly meal plans tailored to a family of 3 in Texas, incorporating HEB sales, seasonal produce, and dietary constraints (severe sesame allergy). The app provides a UI for submitting plan requests, rendering structured results, and keeping a history of plans and cooking journal notes. Future goal: feed cooking history back to Claude to learn preferences.

## Stack

- **Framework**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS, light-mode design
- **API**: Anthropic SDK (`@anthropic-ai/sdk`) called from Next.js API routes
- **Storage**: JSON files on local filesystem in `data/` directory
- **Runtime**: Local only — `npm run dev`

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Combined timeline feed — past plans with inline journal notes |
| `/new` | New plan form with structured fields + freeform notes |
| `/plan/[id]` | Full plan detail view for a specific week |

### Layout
- Top navigation bar (blog-style, not sidebar)
- Nav items: app name/logo, "+ New Plan" button, "History" link
- Content centered, max-width container

### `/new` — New Plan Form

Structured fields for common overrides:
- **Week of** — date picker, defaults to next Monday
- **Theme** — text input (e.g., "Tex-Mex", "Mediterranean")
- **Avoid** — text input (ingredients/cuisines to skip)
- **Feature** — text input (ingredient to use up)
- **Easy cleanup days** — multi-select, defaults to Wednesday
- **Easy lunch day** — select, defaults to Tuesday
- **Additional notes** — freeform textarea for any other overrides (GUESTS, DATE NIGHT, BUDGET FOCUS, etc.)

Submit button triggers generation. Response streams back in real-time, then redirects to the plan detail view.

### `/plan/[id]` — Plan Detail View

Renders the structured plan JSON with sections:
1. **HEB Sales** — red-themed card (HEB brand color `#ee3333`), lists sale items with prices
2. **In Season** — green-themed card, lists seasonal Texas produce
3. **Weekend Cooking Projects** — numbered list with name + description
4. **Breakfast** — options for the week
5. **Meal Table** — 7-day grid (Sun–Sat) with lunch and dinner columns
   - Tuesday lunch highlighted with ⚡ "EASY ASSEMBLY" flag
   - Wednesday dinner highlighted with 🍳 "ONE PAN" flag
6. **Grocery List** — organized by store section (Meat & Seafood, Produce, Dairy & Eggs, Pantry & Dry Goods), sale items flagged in red

Below the plan: inline journal section with "+ Add note" per day.

### `/` — Timeline / History

Scrollable feed of weekly cards, newest first. Each card shows:
- Week date + theme
- Highlights summary (cooking projects, key meals)
- "View Full Plan" link → `/plan/[id]`
- Journal notes inline (if any), with "+ Add note" affordance

## API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/generate` | POST | Accepts form data, assembles agent prompt + overrides, calls Claude, streams response, saves structured JSON |
| `/api/plans` | GET | Lists all saved plans (sorted newest first) |
| `/api/plans/[id]` | GET | Returns a specific plan by UUID |
| `/api/journal` | POST | Creates or updates journal entries for a plan |
| `/api/journal/[planId]` | GET | Returns journal entries for a specific plan |

## Data Storage

All data stored as JSON files in `data/` directory at project root.

### File naming
- Plans: `data/plans/YYYY-MM-DD-<uuid>.json`
- Journal: `data/journal/YYYY-MM-DD-<uuid>.json`

UUID ensures multiple plans generated on the same day don't collide.

### Plan schema

```json
{
  "id": "<uuid>",
  "weekOf": "2026-04-07",
  "theme": "Tex-Mex",
  "createdAt": "2026-04-04T14:30:00Z",
  "formInputs": {
    "theme": "Tex-Mex",
    "avoid": "",
    "feature": "",
    "easyCleanupDays": ["Wednesday"],
    "easyLunchDay": "Tuesday",
    "notes": ""
  },
  "sales": [
    { "item": "Bone-in chicken thighs", "price": "$1.29/lb" }
  ],
  "seasonal": ["Strawberries", "Spinach", "Snap peas"],
  "cookingProjects": [
    { "name": "Carnitas", "description": "4lb pork shoulder, low and slow." }
  ],
  "breakfast": [
    { "name": "Breakfast burritos", "description": "Batch-made, grab from freezer" }
  ],
  "meals": [
    {
      "day": "Sunday",
      "lunch": { "name": "Grilled chicken tostadas", "flags": [] },
      "dinner": { "name": "Carnitas with pickled onions", "flags": [] }
    },
    {
      "day": "Tuesday",
      "lunch": { "name": "Cold carnitas salad", "flags": ["easy-assembly"] },
      "dinner": { "name": "Beef picadillo", "flags": [] }
    },
    {
      "day": "Wednesday",
      "lunch": { "name": "Picadillo quesadillas", "flags": [] },
      "dinner": { "name": "Sheet pan chicken & veg", "flags": ["one-pan"] }
    }
  ],
  "groceryList": {
    "Meat & Seafood": [
      { "item": "Chicken thighs (bone-in)", "onSale": true }
    ],
    "Produce": [
      { "item": "Roma tomatoes", "onSale": true }
    ],
    "Dairy & Eggs": [
      { "item": "Cotija cheese", "onSale": false }
    ],
    "Pantry & Dry Goods": [
      { "item": "Tortillas", "onSale": false }
    ]
  }
}
```

### Journal schema

```json
{
  "id": "<uuid>",
  "planId": "<plan-uuid>",
  "weekOf": "2026-04-07",
  "entries": [
    { "day": "Sunday", "note": "Made the carnitas — amazing" },
    { "day": "Wednesday", "note": "Swapped for takeout pizza" }
  ]
}
```

## Claude Integration

### Prompt Assembly

The API route combines:
1. The base agent prompt (stored as a string constant or file in the project)
2. Override block assembled from form inputs:
   ```
   THEME: Tex-Mex
   AVOID: beef
   EASY CLEANUP: Wednesday
   EASY LUNCH: Tuesday
   ```
3. A system instruction telling Claude to return **valid JSON** matching the plan schema above, not markdown

### Streaming

Use the Anthropic SDK's streaming API to show generation progress on the client. The full response is parsed as JSON and saved to disk once complete.

### Web Search

The agent prompt instructs Claude to search for HEB weekly ads and seasonal produce. The API call should enable web search via the Anthropic SDK's server-side tool (`web_search` tool). If web search is unavailable or fails, Claude will fall back to its training knowledge for seasonal produce and general HEB pricing patterns — acceptable for v1.

## Error Handling

- If Claude returns malformed JSON: show raw text with an error banner, allow retry
- If API key is missing: show setup instructions on the `/new` page
- File write failures: return 500 with descriptive error

## Environment

- `ANTHROPIC_API_KEY` in `.env.local` (gitignored)
- No other external services required

## Visual Mockups

Brainstorming mockups saved in `.superpowers/brainstorm/` for reference:
- `app-layout.html` — layout comparison (chose top-nav blog style)
- `new-plan-form.html` — new plan form
- `plan-result-v2.html` — plan detail view with HEB red branding
- `timeline.html` — combined history/journal timeline
