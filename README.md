# SoulCars.pk — Collector Car Marketplace

A curated online marketplace for rare, vintage and classic automobiles in Pakistan. Built for collectors, by collectors.

---

## Tech Stack

- **Framework** — Next.js 15 (App Router, SSR + ISR)
- **Styling** — Tailwind CSS v4, Radix UI, Shadcn/ui
- **Data** — Google Sheets API (no database needed — client manages listings via spreadsheet)
- **Images** — Cloudinary (multi-photo galleries per car)
- **Email** — Resend (enquiry and listing submission emails)
- **Deployment** — Vercel

---

## Features

- Car listings with full detail pages (gallery, specs, price, enquiry form)
- Classic parts listings
- Multi-image gallery per car via Cloudinary folder upload
- Suggested cars carousel on every detail page
- "Sell a Car" multi-step submission form
- Client-editable page text via a Google Sheets `Content` tab (no code changes needed)
- Save listings to browser (localStorage)
- Mobile responsive

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Home page
│   ├── cars/
│   │   ├── page.tsx              # Cars listing
│   │   └── [slug]/page.tsx       # Car detail page
│   ├── parts/page.tsx            # Parts listing
│   ├── sell/page.tsx             # Sell a car form
│   ├── about/page.tsx            # About page
│   └── api/
│       ├── submit-enquiry/       # Handles buy/enquiry emails
│       └── submit-listing/       # Handles new car listing submissions
├── components/
│   ├── featured-carousel.tsx     # Home page carousel
│   ├── car-card.tsx              # Car listing card
│   ├── site-header.tsx
│   └── site-footer.tsx
└── lib/
    ├── sheets.ts                 # Google Sheets + Cloudinary data fetching
    └── cars-data.ts              # TypeScript types + fallback data
```

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/ZakiNabeel/SoulsCar-Collector-Car-Website.git
cd SoulsCar-Collector-Car-Website
npm install
```

### 2. Set up environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in all six values (see below for where to get each one).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Where to get it |
|---|---|
| `GOOGLE_SHEETS_API_KEY` | Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_SHEETS_SHEET_ID` | From the spreadsheet URL: `…/spreadsheets/d/**ID**/edit` |
| `RESEND_API_KEY` | resend.com → API Keys |
| `CLOUDINARY_CLOUD_NAME` | cloudinary.com → Settings → API Keys (blue badge at top) |
| `CLOUDINARY_API_KEY` | cloudinary.com → Settings → API Keys |
| `CLOUDINARY_API_SECRET` | cloudinary.com → Settings → API Keys (click eye icon to reveal) |

---

## Google Sheets Setup

The spreadsheet is the entire CMS. It needs three tabs:

### `Cars` tab — columns A to T

| Col | Field | Notes |
|---|---|---|
| A | slug | URL identifier e.g. `1973-porsche-911` |
| B | name | Display name e.g. `Porsche 911 T` |
| C | year | e.g. `1973` |
| D | make | e.g. `Porsche` |
| E | model | e.g. `911 T` |
| F | spec | One-line summary e.g. `Flat-6 · Manual · 78,400 km` |
| G | price | e.g. `PKR 4.85 Cr` |
| H | image | Primary image URL (Cloudinary or any public URL) |
| I | mileage | e.g. `78,400 km` |
| J | engine | e.g. `2.4L Flat-6` |
| K | transmission | e.g. `5-speed Manual` |
| L | color | e.g. `Silver Metallic` |
| M | condition | e.g. `Concours` |
| N | location | e.g. `Lahore, PK` |
| O | description | Full description paragraph |
| P | seller | `Verified` or `Private` |
| Q | images_folder | Cloudinary folder name for multi-image gallery e.g. `1973-porsche-911` |
| R | featured | `TRUE` to show a "Featured" ribbon on the listing (Cars page card + car detail page). Blank/`FALSE` = not featured. Does not affect the homepage carousel. |
| S | pinned | `TRUE` to always keep this car near the top of its section on the Cars page, below featured cars. Blank/`FALSE` = normal position. |
| T | category | `Daily Driver` to list the car under the "Daily Drivers" section instead of "Collector Cars". Blank = Collector. |

On the Cars page, listings sort featured first, then pinned, then newest-added first (within each category). Two rows sharing the same slug get a `-2`, `-3`, etc. suffix appended automatically so both still get their own page.

### `Parts` tab — columns A to F

| Col | Field |
|---|---|
| A | slug |
| B | name |
| C | fits |
| D | condition (`New`, `Used`, or `Restored`) |
| E | price |
| F | image |

### `Content` tab — editable page text

Row 1 is headers (`field_key`, `home`, `cars`, `parts`, `sell`, `about`). Each row after is a text field the client can edit. Blank cell = site uses its built-in default. See `Content-Tab-Template.xlsx` in the repo root to import a ready-made version.

---

## Cloudinary — Multi-Image Galleries

1. Log in to [cloudinary.com](https://cloudinary.com)
2. Go to **Media Library**
3. Create a folder named exactly the same as the car's slug (e.g. `1973-porsche-911`)
4. Upload all photos for that car into that folder
5. In Google Sheets, put the folder name in column Q for that car row

The car detail page will automatically show all photos as a swipeable gallery with a thumbnail strip. Cars without a folder (blank col Q) fall back to the single image in col H.

---

## Deploying to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import this repo
3. Add all 6 environment variables in the Vercel project settings
4. Click **Deploy**

Every subsequent `git push` to `main` triggers an automatic redeploy.

---

## Making Changes

```bash
# Make your code changes, then:
git add .
git commit -m "describe what changed"
git push
# Vercel redeploys automatically
```
