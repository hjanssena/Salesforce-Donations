---
version: 1
slug: "web-src-app-tsx"
primary_target: "web/src/App.tsx"
related_targets: ["web/src"]
---

# Surface brief: public donation site (campaign page)

Scope: the donor-facing web app in `web/`, starting with the campaign page (one open campaign opens directly). Mode: Persuade, with an Operate donate form inside it.

Audience and job: relatives and friends arriving from a student's WhatsApp link on a phone; the Salesforce community; Mérida companies needing an invoice; evaluators. They must feel pride in the students, see how close the goal is, and donate in a couple of minutes.

Constraints: speak as the SF Vibe Lab students, never as Mexico Dreamin, Salesforce or UADY. Not playful, not a generic charity template, not a folk postcard. Campaign content, progress and supporters come from the API; no invented totals or testimonials.

## Direction contract

THESIS: The campaign is lettered on a Mérida wall like a sign-painter's announcement: big, flat, proud. It refuses the crowdfunding template of photo, rounded card, green pill button.

OWN-WORLD: Lime-wash cal ground; whole sections painted as flat walls in Izamal yellow and añil blue; almagre red reserved for the one element in motion (selected amount, active step); near-black enamel for the donate sign. Sign-painter caps (Bungee) with a flat painted shadow on display only; Lexend for everything read (replaced Atkinson Hyperlegible during the build: its slashed zero made amounts like $50,000 read as code to the relatives audience, and the self-hosted subset has no plain-zero alternate; Lexend was also designed for reading ease and has a plain zero). Square painted tiles, 2px enamel outlines, no rounded cards, no gradients, no blur; depth only by overlapping flat coats.

STORY: Visitors learn that students from Mérida are going to Mexico Dreamin, see what has been raised and what is still missing, choose an amount, and donate; credited supporters are thanked on the wall, newest painted darkest.

FIRST VIEWPORT: On a phone, the yellow wall fills the top: a small "SF Vibe Lab · Mérida" line, then the campaign headline in blue sign caps with shadow at about 44px, one line of purpose. An añil band carries the raised amount in yellow sign numerals, the goal and end date, a flat bar, and "FALTAN $X" lettered as boldly. Below, the amount tiles in a 4-column grid and the black donate sign sit within thumb reach. On desktop the wall and the donate panel sit side by side, and the donate panel stays in view.

FORM: Rótulo de Mérida (hand-painted shop signs on lime-washed walls), sixth on my ordered list. seed:e159dd44f4561ec0. Raises: missing amount painted as boldly as raised (seven-segment); newest supporter darkest (fluid ink); story in one calm column (secession); depth by flat overlapping coats (papercut); almagre only for the element in motion (automata). Signature interaction: choosing an amount paints its tile almagre and the donate sign repaints its number, with a short brush-wipe reveal (clip-path) on the tile.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
