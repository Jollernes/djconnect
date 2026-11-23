# Test Plan — V23 Soft Wedding · Clean avatar refinement

PR: https://github.com/Jollernes/djconnect/pull/2 (commit `9dd0bdd`)

## What changed
Three refinements to the avatar on the Soft Wedding variant of `/wedding-djs-curved-sweep`:
1. Avatar diameter +50%: 72 → **108 px** in 3-col, 60 → **90 px** in 4-col
2. Cream notch padding around avatar tightened from **8 px → 2 px** (hairline gap)
3. Avatar rendering sharpened by removing the `transform: translateX(-50%)` GPU layer (replaced with `marginLeft: -avatarSize/2`), removing `contrast(1.05)` from the grayscale filter stack, adding explicit `width`/`height` HTML attrs on the `<img>`, and trimming the white ring from 3 px → 2 px.

Evidence in code: <ref_snippet file="/home/ubuntu/repos/djconnect/src/components/event-djs/grid/V23SoftWedding.tsx" lines="42-52" /> and <ref_snippet file="/home/ubuntu/repos/djconnect/src/components/event-djs/grid/V23SoftWedding.tsx" lines="152-188" />

## Environment
Local dev server on `http://localhost:5173` (Vercel preview is behind SSO and headless visits hit a login wall — established earlier in this branch's testing).

## Primary test — Soft Wedding · Clean, 3-col

**Setup**: open `http://localhost:5173/wedding-djs-curved-sweep?variant=soft-wedding-clean`.

| # | Assertion | Pass criterion | How to verify |
|---|---|---|---|
| 1 | Avatar is 108×108 px in 3-col | `boundingBox()` of the avatar `<span>` element on the first card returns width=108, height=108 (±1 px) | Playwright `element.boundingBox()` on the absolute-positioned ring around the `<img>` |
| 2 | Avatar `<img>` carries explicit `width="108" height="108"` HTML attrs | Getting `getAttribute("width")` returns `"108"`, `getAttribute("height")` returns `"108"` | Playwright `getAttribute` |
| 3 | Avatar `<img>` filter style is `grayscale(100%)` (no `contrast(1.05)`) | `getComputedStyle(img).filter === "grayscale(1)"` | Playwright `evaluate` |
| 4 | Avatar wrapper has no `transform: translate` on it (sharpness fix) | `getComputedStyle(wrapper).transform === "none"` | Playwright `evaluate` |
| 5 | Notch gap is hairline (≤ ~3 px) | Distance from the visible photo-cut edge to the white avatar ring along the bottom-center of the hero is < 5 px. Verified by rendering and measuring the distance from `heroBox.bottom` to the avatar top minus the avatar's radius. Expected math: `notchRadius = 56` (since avatarSize=108, notchRadius=108/2+2=56), so half-circle reaches 56 px above hero bottom; avatar half-height is 54 px, so gap = 56 − 54 = 2 px | Programmatic measurement |
| 6 | Avatar image source loads at native intrinsic ≥ display size (no upscaling) | `naturalWidth ≥ 108` and `naturalHeight ≥ 108` for every card's avatar img | Playwright `evaluate` on `naturalWidth/naturalHeight` |
| 7 | Visual sharpness vs prior commit | Side-by-side full-page screenshot of *current* HEAD vs the prior commit (`043e643`) shows the avatar is visibly larger AND sharper. Saved as `before.png` and `after.png` for the user to eyeball. | Capture two screenshots, one per commit. |

**Would the test look identical if broken?**
- If size was untouched (still 72 px), assertion #1 fails (returns 72, not 108).
- If `transform: translateX(-50%)` were left in, assertion #4 fails (computed transform = `matrix(...)`, not `none`).
- If `contrast(1.05)` were left in, assertion #3 fails (computed filter = `grayscale(1) contrast(1.05)`).
- If notch radius weren't tightened, assertion #5 fails (8 px gap visible).

## Spot-check — 4-col density

**Setup**: same page with `&cols=4`.

| # | Assertion | Pass criterion |
|---|---|---|
| 8 | Avatar is 90×90 px in 4-col | `boundingBox()` returns width=90, height=90 (±1 px) |
| 9 | `<img>` HTML attrs are `width="90" height="90"` | getAttribute matches |

## Regression — Soft Wedding · Light

| # | Assertion | Pass criterion |
|---|---|---|
| 10 | Light variant inherits all the same avatar geometry | Visit `?variant=soft-wedding-light`, screenshot. Avatar is also 108 px, ring is 2 px white, notch is hairline. Difference vs Clean is *only* in the hero image's saturation/overlay. |

## Out of scope
- Other variants (Arch, Diagonal, Wave, Corner, Triptych, Diagonal · Right) — unchanged in this commit.
- The `tint="soft"` original Soft Wedding mode (no longer wired into the toggle, but still exists in code).
- Avatar fallback (no `avatar_url`) branch — not present in current mock data.
