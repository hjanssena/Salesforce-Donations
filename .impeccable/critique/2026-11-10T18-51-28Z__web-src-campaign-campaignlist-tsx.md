---
target: campaign list items
total_score: 20
max_score: 28
na_heuristics: 5,9,10
p0_count: 1
p1_count: 2
target_identity: "file:/Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/web/src/campaign/CampaignList.tsx"
target_fingerprint: "sha256:e953385020cbd7df1439a60e0e950f70fa72136734987224081ecbdb995e9838"
target_path: /Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/web/src/campaign/CampaignList.tsx
timestamp: 2026-11-10T18-51-28Z
slug: web-src-campaign-campaignlist-tsx
---
# Critique: campaign list boards

Score 20/28 (71%, Good). n/a: 5, 9, 10. 1=3, 2=4, 3=3, 4=3, 6=3, 7=2, 8=2.
Detector: CLI clean (layout problem); browser 2 (straggler "sede." in Playeras description, real; cream-palette on body, false positive).

## Priority issues
- [P0] Two-column grid with stretch wastes ~1/3 of each board. 1466px: 316×193 empty cal beside the 340px photo; tally stretched to row height, empty añil under the sign 112–151px (32–37%), 212px (50%) at 1024; 171–204px empty cal between text and tally; no-photo board flips: 100–127px empty under description; list left-aligned at 72rem. Fix: photo as full-height full-bleed left column clamp(11rem,24%,17rem); body centred; tally minmax(16rem,19rem) with align-self:start; no-photo board two columns. Board ~230px instead of 362. → layout
- [P1] Tally 521px wide for ~300px of content; sign 470px desktop, ~700px stacked. Fix: cap tally; cap sign 22rem on phones. → layout
- [P1] Phone boards 703–730px tall; sign ~600px into each board. Fix: full-bleed 21:9 photo strip at top, 2-line description clamp, tighter tally padding; target ~520px. → adapt
- [P2] Purpose and description at equal weight, near-duplicate. Fix: purpose leads bold; description smaller, weather-2, 2-line clamp, text-wrap pretty. → typeset
- [P2] Closed cal-deep tally overhang on cal has no edge. Fix: 2px enamel line or no overhang. → polish

## Persona red flags
- WhatsApp relative: one board per screen; deadline in muted 15px line; photo not tappable.
- Mobile: sign below fold; two small targets.
- Screen reader: two links per board to the same href.

## Minor
- Portrait crop centred; object-position 50% 30%.
- Tiny 240×135 upscaled to 340px.
- Closed meter at 112% hard to read.
- Uneven tally spacing (.board__go margin-top 1rem).
