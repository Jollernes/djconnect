# Test Report — V23 Soft Wedding · Clean avatar refinement

**PR**: https://github.com/Jollernes/djconnect/pull/2 (commit `9dd0bdd`)
**Session**: https://app.devin.ai/sessions/62a7451e6abe4f1eb0f7b87aac66b5c9
**Method**: programmatic measurement via headless Chromium against local dev (`npm run dev`), comparing `043e643` (BEFORE) vs `9dd0bdd` (AFTER).

## Result: all 10 assertions passed.

### 3-col density (Soft Wedding · Clean)

| # | Assertion | BEFORE | AFTER | Verdict |
|---|---|---|---|---|
| 1 | Avatar +50% in 3-col | 72×72 px | **108×108 px** | passed |
| 2 | `<img>` HTML `width`/`height` attrs | `null` / `null` | `"108"` / `"108"` | passed |
| 3 | Filter is plain `grayscale` (no extra contrast softening) | `grayscale(1) contrast(1.05)` | **`grayscale(1)`** | passed |
| 4 | Wrapper not promoted to a GPU layer | `matrix(1,0,0,1,-36,0)` (translateX) | **`none`** | passed |
| 5 | Notch padding tightened | gap = 8 px around avatar | **gap = 2 px** | passed |
| 6 | Avatar source ≥ display size | `natural 400×300` / `800×533` | same | passed (no upscaling) |
| 7 | Avatar visibly sharper & bigger in 3-col | — | full-page screenshots side-by-side | passed |

### 4-col density (Soft Wedding · Clean)

| # | Assertion | BEFORE | AFTER | Verdict |
|---|---|---|---|---|
| 8 | Avatar +50% in 4-col | 60×60 px | **90×90 px** | passed |
| 9 | `<img>` HTML `width`/`height` attrs | `null` / `null` | `"90"` / `"90"` | passed |

### Regression — Soft Wedding · Light

| # | Assertion | Result |
|---|---|---|
| 10 | Light variant inherits the same avatar geometry (108 px, transform `none`, plain `grayscale`, html width/height attrs) | passed — identical to Clean |

## Before / after — cropped first card

| 🔴 BEFORE (commit `043e643`) | 🟢 AFTER (commit `9dd0bdd`) |
|---|---|
| ![BEFORE clean-3](https://app.devin.ai/attachments/df170967-9ef7-47ca-ae1b-c07452dd1a94/before-clean-3-card.png) | ![AFTER clean-3](https://app.devin.ai/attachments/b873510e-fb2b-40d5-b2cb-1cee01ebf7bf/after-clean-3-card.png) |
| 72 px avatar, 8 px cream halo, soft face | 108 px avatar, 2 px hairline gap, sharp face |
| ![BEFORE clean-4](https://app.devin.ai/attachments/0f798747-fcc1-4689-ad08-ec7ada5ed96e/before-clean-4-card.png) | ![AFTER clean-4](https://app.devin.ai/attachments/78aea934-e0d5-480f-ae9b-2795e6bb86d9/after-clean-4-card.png) |
| 60 px avatar (4-col) | 90 px avatar (4-col) |

## Raw measurements

`/home/ubuntu/v23_shots/results-before.json`:

```json
{
  "clean-3": {
    "avatarWidth": 72, "avatarHeight": 72,
    "wrapperTransform": "matrix(1, 0, 0, 1, -36, 0)",
    "imgFilter": "grayscale(1) contrast(1.05)",
    "imgHtmlWidth": null, "imgHtmlHeight": null,
    "notchExposureBelowHero": 36
  },
  "clean-4": {
    "avatarWidth": 60, "avatarHeight": 60,
    "wrapperTransform": "matrix(1, 0, 0, 1, -30, 0)",
    "imgFilter": "grayscale(1) contrast(1.05)",
    "imgHtmlWidth": null, "imgHtmlHeight": null,
    "notchExposureBelowHero": 30
  }
}
```

`/home/ubuntu/v23_shots/results-before.json` (AFTER, ran on restored HEAD):

```json
{
  "clean-3": {
    "avatarWidth": 108, "avatarHeight": 108,
    "wrapperTransform": "none",
    "imgFilter": "grayscale(1)",
    "imgHtmlWidth": "108", "imgHtmlHeight": "108",
    "notchExposureBelowHero": 54
  },
  "clean-4": {
    "avatarWidth": 90, "avatarHeight": 90,
    "wrapperTransform": "none",
    "imgFilter": "grayscale(1)",
    "imgHtmlWidth": "90", "imgHtmlHeight": "90",
    "notchExposureBelowHero": 45
  }
}
```

(`notchExposureBelowHero` = how far the avatar extends below the hero photo bottom edge. Equals `avatarSize / 2` by design; doubled because avatar doubled... +50% actually, so 36→54 and 30→45 — both correct.)

## What I did NOT test
- Other variants (Arch, Diagonal, Wave, Corner, Triptych, Diagonal · Right) — unchanged in this commit.
- The `tint="soft"` original Soft Wedding mode — no longer wired into the toggle.
- Avatar fallback for DJs without `avatar_url` — not present in the mock data shown.
