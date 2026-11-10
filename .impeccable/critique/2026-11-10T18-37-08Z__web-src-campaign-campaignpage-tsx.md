---
target: header and photo placement of the main campaign view
total_score: 21
max_score: 28
na_heuristics: 7,9,10
p0_count: 0
p1_count: 1
target_identity: "file:/Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/web/src/campaign/CampaignPage.tsx"
target_fingerprint: "sha256:e064af2bd8ad251b324129ee49a6b3c7f08fc0537c754bf0df93556bad86f522"
target_path: /Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/web/src/campaign/CampaignPage.tsx
timestamp: 2026-11-10T18-37-08Z
slug: web-src-campaign-campaignpage-tsx
---
# Critique: campaign page header and photo placement

Score 21/28 (75%, Good). n/a: 7, 9, 10.
Heuristics: 1=3, 2=4, 3=3, 4=2 (top-right link changes role; completed page wall stays yellow while completed list is añil), 5=3, 6=3, 8=3 (empty right half of desktop wall; duplicate Donar).

Specificity: authored lettering and colour (Rótulo de Mérida); composition below the h1 is a generic stacked column. Detector: CLI clean; browser 2 (straggler on .wall__line, real; cream-palette on body, intentional palette).

## Priority issues
- [P1] Photo (.bill) sits bottom-left under the wall line. Desktop 1470: header 306→532px (38%→65% of viewport), band 310→535, 639px empty yellow beside the photo. 320px: header 76% of viewport, band bottom below fold. Fix: desktop two-column wall, bill right aligned to h1 top, bottom dropping ~2rem over the añil band (Overlap/Coats rules); phone wider 21:9 crop and band climbs onto the photo. Full-bleed rejected (needs scrim). Optional ≤1.5° tilt on desktop only. → layout
- [P2] "Donar" skip link duplicates the visible donate board at desktop; same slot becomes "Todas las campañas" (wraps at 360px); two "Donar" names for screen readers. Fix: hide ≥960, rename "Ir a donar", larger tap target, shorten back link to "← Campañas". → clarify
- [P2] Focus box can appear around the h1 .sign after navigation; .sign-small has outline:none for tabindex=-1, .sign does not. Fix: .sign[tabindex='-1']:focus { outline: none }. → polish
- [P3] Completed campaign page keeps wall--yellow; use wall--anil or weathered headline. → colorize
- [P3] .wall__line orphan "llegar." and weak ask; text-wrap: pretty, split with bold "Ayúdanos a llegar." → typeset

## Persona red flags
- First-timer: "SF Vibe Lab" opaque; Mexico Dreamin not explained as a conference.
- Mobile: with photo, gap line below fold; skip link 50×43px; h1 4 lines at 360px.
- Accessibility: two "Donar" names; possible h1 focus box; no alt text field for meaningful photos in the contract.

## Minor
- Root font-size 17px makes rem tokens ~6% larger than DESIGN.md.
- Duplicate desktop .wall padding (index.css:144 overridden at 1150).
- 42px yellow notch where band stops before the donate column; check 960–1100px.

## Questions
- Build the header around the photo, or drop photos?
- Should a completed campaign repaint its wall?
- Should the signature say "Estudiantes UADY · Mérida"?
