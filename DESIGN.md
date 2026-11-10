---
name: SF Vibe Lab Donation Site
description: A campaign lettered on a Mérida wall like a sign-painter's announcement, big, flat and proud.
colors:
  izamal: "#e6a71c"
  anil: "#1f2f6b"
  almagre: "#b23a1e"
  cal: "#f6f1e7"
  cal-deep: "#ece4d4"
  enamel: "#15120e"
  on-izamal-muted: "#4a3a14"
  on-anil-muted: "#d9d2c3"
  weather-1: "#3b342c"
  weather-2: "#5a5045"
  weather-3: "#6e6356"
typography:
  display:
    fontFamily: "Bungee, Lexend, sans-serif"
    fontSize: "clamp(2.5rem, 7.2vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.01em"
  headline-numeral:
    fontFamily: "Bungee, Lexend, sans-serif"
    fontSize: "clamp(2.4rem, 5.5vw, 3.75rem)"
    fontWeight: 400
    lineHeight: 1
    fontFeature: "\"tnum\""
  headline-gap:
    fontFamily: "Bungee, Lexend, sans-serif"
    fontSize: "clamp(2rem, 4.6vw, 3.25rem)"
    fontWeight: 400
    lineHeight: 1
  title:
    fontFamily: "Bungee, Lexend, sans-serif"
    fontSize: "clamp(1.25rem, 2.4vw, 1.6rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0"
  label-sign:
    fontFamily: "Bungee, Lexend, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.2
  lead:
    fontFamily: "Lexend, system-ui, sans-serif"
    fontSize: "clamp(1.2rem, 2vw, 1.4rem)"
    fontWeight: 700
    lineHeight: 1.45
  body:
    fontFamily: "Lexend, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Lexend, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  none: "0px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2.5rem"
  gutter: "clamp(1.25rem, 4vw, 3rem)"
components:
  button-sign:
    backgroundColor: "{colors.enamel}"
    textColor: "{colors.izamal}"
    rounded: "{rounded.none}"
    padding: "0.9rem 1rem"
    height: "3.75rem"
    width: "100%"
  button-sign-hover:
    backgroundColor: "{colors.anil}"
    textColor: "{colors.izamal}"
  button-sign-active:
    backgroundColor: "{colors.almagre}"
    textColor: "{colors.cal}"
  tile:
    backgroundColor: "{colors.cal}"
    textColor: "{colors.enamel}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0"
    height: "3.25rem"
  tile-hover:
    backgroundColor: "{colors.cal-deep}"
  tile-selected:
    backgroundColor: "{colors.almagre}"
    textColor: "{colors.cal}"
  band:
    backgroundColor: "{colors.anil}"
    textColor: "{colors.cal}"
    rounded: "{rounded.none}"
    padding: "1.25rem {spacing.gutter} 1.5rem"
  wall:
    backgroundColor: "{colors.izamal}"
    textColor: "{colors.enamel}"
    rounded: "{rounded.none}"
  donate-board:
    backgroundColor: "{colors.cal}"
    textColor: "{colors.enamel}"
    rounded: "{rounded.none}"
    padding: "1.5rem 1.5rem 1.25rem"
  strip-enamel:
    backgroundColor: "{colors.enamel}"
    textColor: "{colors.cal}"
    padding: "0.45rem {spacing.gutter}"
---

# Design System: SF Vibe Lab Donation Site

## Overview

**Creative North Star: "Rótulo de Mérida"**

The site is a hand-painted shop sign on a lime-washed Mérida wall. Whole sections are painted as flat walls of colour (Izamal yellow, añil blue, black enamel) on a cal ground, and the campaign is lettered across them in big sign-painter capitals. It is proud and plain-spoken: one campaign, what has been raised, what is still missing, an amount, a donate sign, and the names of the people who gave.

Everything is flat. There are no gradients, no blur, no rounded cards and no box shadows. Depth comes only from coats of paint overlapping: the añil band climbs onto the foot of the yellow wall, the cal donate board hangs on the yellow wall, the campaign photo is pasted on like a bill with an enamel frame. One colour, almagre red, is held back for the single thing in motion: the amount the donor has just chosen.

Density is low and the type is large, because most visitors are relatives on phones. Display lettering is loud; everything meant to be read sits in a calm, highly legible sans.

**Key Characteristics:**
- Flat coats of colour as sections; depth only by overlap.
- Sign-painter capitals (Bungee) for display, with a flat painted shadow on the headline only.
- Lexend for all reading text, with a plain zero so amounts read as money.
- Square corners and 2px enamel outlines everywhere.
- Almagre red only on the selected or pressed element.
- What is missing is lettered as boldly as what was raised.

## Colors

A wall-paint palette: two saturated walls, one red oxide for motion, black enamel, and a lime-wash ground with its weathered greys.

### Primary
- **Izamal Yellow** (izamal): the main wall. The page header is painted in it, and on desktop it runs down the right side behind the donate board. It is also the paint of the raised numeral and the meter fill on the añil band, and the lettering of the donate sign.

### Secondary
- **Añil Indigo** (anil): the second wall. The progress band is painted in it; it letters the campaign headline on the yellow wall; it is the default focus ring and the donate sign's hover coat.

### Tertiary
- **Almagre Red Oxide** (almagre): the paint of motion. The chosen amount tile, the donate sign while pressed, the brush stroke being painted while a page waits, text selection, caret and native accent colour. Nothing at rest is almagre.

### Neutral
- **Cal Lime Wash** (cal): the ground. Page background, the donate board, tile faces, light lettering on añil and almagre, and the first coat of the headline's painted shadow.
- **Second Coat** (cal-deep): a slightly darker cal for overlaps: tile hover, hairline dividers between supporter rows, scrollbar track.
- **Black Enamel** (enamel): body text, 2px outlines, the donate sign, the preview strip and the footer.
- **Ochre Shade** (on-izamal-muted): secondary text on the yellow wall (the one-line purpose under the headline).
- **Faded Cal** (on-anil-muted): secondary text on añil (the goal and end date) and footer text on enamel.
- **Weathering 1–3** (weather-1, weather-2, weather-3): progressively faded enamel for older supporter rows; weather-2 also carries helper text such as the minimum-amount line and the empty-supporters message.

### Named Rules
**The One Moving Colour Rule.** Almagre appears only on the element in motion: the selected amount, a pressed sign, the waiting brush stroke, a selection, or a form error the donor has to fix. If nothing is chosen or wrong, nothing is red.

**The Flat Coat Rule.** Colour is applied as solid coats. No gradients, no transparency washes, no blur.

**The Readable Wall Rule.** Every text colour sits on a wall it was tested on: enamel or añil on yellow, cal or yellow on añil, yellow or cal on enamel, enamel through weather-3 on cal. Izamal never letters on cal.

## Typography

**Display Font:** Bungee (with Lexend, sans-serif fallback), self-hosted, weight 400 only.
**Body Font:** Lexend (with system-ui, sans-serif), self-hosted, weights 400 and 700.

**Character:** Bungee is the painted shop sign: chunky, upright capitals with a vertical rhythm made for walls. Lexend is the calm voice beside it, chosen for reading ease and a plain zero, so "$50,000" reads as an amount, not as code.

### Hierarchy
- **Display** (Bungee 400, clamp 2.5rem–6rem, line-height 0.98, uppercase, balanced wrap): the campaign headline in añil on the yellow wall, and the "Volvemos pronto" sign on the unavailable screen (smaller, clamp 2rem–3.5rem). Carries the painted shadow.
- **Headline, numeral** (Bungee 400, clamp 2.4rem–3.75rem, line-height 1, tabular figures): the raised amount, in yellow on añil.
- **Headline, gap** (Bungee 400, clamp 2rem–3.25rem, uppercase): "FALTAN $X" (or the goal-exceeded line) in cal on añil, deliberately close in size to the numeral.
- **Title** (Bungee 400, clamp 1.25rem–1.6rem, line-height 1.1, uppercase): section signs ("Elige tu donativo", "Para qué es", "Gracias").
- **Label, sign** (Bungee 400, 0.9375rem): the "SF Vibe Lab · Mérida" signature in the wall's top corner. Tiles (clamp 0.875rem–1rem) and the donate sign (clamp 1.35rem–1.6rem, uppercase) use the same face.
- **Lead** (Lexend 700, clamp 1.2rem–1.4rem, line-height 1.45): the campaign purpose that opens the story. The wall's one-line purpose uses the same weight at clamp 1rem–1.3rem, capped at 34ch.
- **Body** (Lexend 400, 1.0625rem, line-height 1.6): all running text, story column capped near 68ch; supporter rows at the same size.
- **Small** (Lexend 400, 0.875rem–0.9375rem): helper lines, the notice under the donate sign (700), the preview strip (0.8125rem) and the footer.

### Desktop scale
From 960px the scale steps down, because the phone sizes shout on a desktop screen: display clamp 2.5rem–3.75rem, raised numeral 2.5rem, gap line 1.75rem, titles 1.25rem, the donate sign 1.25rem at 3.25rem tall, tiles and the amount field 2.75rem tall. The wall's purpose line drops to Lexend 400 at 1.0625rem in enamel (on-anil-muted on the añil wall). Walls and sections pack tighter. Phones keep the full scale.

### Named Rules
**The Two Voices Rule.** Bungee is for signs, never for sentences. Anything a donor has to read in full is Lexend.

**The Painted Shadow Rule.** The flat two-coat shadow (a cal coat, then an enamel coat) belongs to display lettering only. Titles, numerals and buttons are lettered without it.

**The Tabular Money Rule.** Every amount (numeral, tiles, supporter amounts, goal line) uses tabular figures.

## Layout

The page is a single CSS grid of named areas painted as stacked walls. On phones it is one column in reading order: preview strip, yellow wall, añil band, donate panel, story, thanks, footer. The donate panel sits directly under the band so the amount tiles and the donate sign are within thumb reach just past the first viewport.

From 960px the grid becomes two columns: content on the left (fluid) and a 360–420px donate column on the right. The yellow wall continues down the right column, and the cal donate board hangs on it, sticky 2rem from the top and capped at 400px, so it stays in view while the story scrolls.

Horizontal spacing comes from one fluid gutter (clamp 1.25rem–3rem) shared by every wall. Vertical rhythm is coarse: section padding of 2.5rem, inner steps of 0.75rem and 1rem, tile gaps of 0.5rem. The amount tiles are a 4-column grid, falling to 2 columns only below 340px. Reading measures are capped: wall line 34ch, story about 68ch, supporters list 40rem.

**The Overlap Rule.** The añil band climbs 2rem onto the yellow wall and stops short of the right edge (0.75rem–2.5rem), so the cal ground shows beside it. Sections meet by overlapping coats, never by a gap with a divider.

## Elevation & Depth

The system has no box shadows and no blur. Depth is built from flat coats overlapping: the band over the wall, the board on the wall, the bill on the wall. The only shadow in the system is the painted lettering shadow on display type, a sign-painter's "sombra" made of two hard flat coats (cal at 0.05em, enamel at 0.1em). It is a lettering device, not an elevation device.

**The Coats, Not Shadows Rule.** To raise something, paint it as a new coat over another wall; never lift it with a drop shadow.

## Shapes

Every corner is square (0px). Edges are drawn with a 2px enamel line: tiles, the donate board, the meter, the photo frame and the top of the supporters list. Inside the band the meter's outline switches to cal so it reads against añil. Supporter rows are separated by 1px second-coat hairlines. The photo is cropped to a 16:9 bill.

**The Square Sign Rule.** No rounded corners and no pills, on anything.

## Components

### Buttons
The donate sign: a full-width slab of black enamel lettered in yellow, the loudest object after the headline.
- **Shape:** square (0px), no border, at least 3.75rem tall, full width of the panel.
- **Primary:** enamel ground, izamal Bungee lettering, uppercase, clamp 1.35rem–1.6rem. The label repaints with the chosen amount ("DONAR $1,000").
- **Hover:** repainted añil (160ms ease-out), on hover-capable devices only.
- **Active:** almagre ground, cal lettering.
- **Focus:** 3px outline offset 3px. The ring is drawn on the ground around the button, so its colour follows that ground: añil on cal or yellow, izamal on añil or enamel.

### Amount Tiles (signature component)
Square painted tiles in a radio group: choosing one paints it almagre with a brush wipe.
- **Rest:** cal face, 2px enamel outline, enamel Bungee numerals, at least 3.25rem tall.
- **Hover:** second-coat cal face (hover-capable devices only).
- **Suggested (at rest):** 250 is chosen when the page opens, so the sign can read "Donar $250", but nothing at rest is almagre: the suggested tile is lettered cal on enamel, like a sign.
- **Selected:** once the donor picks an amount (250 included), an almagre coat is wiped left to right with a clip-path reveal (280ms, cubic-bezier(0.16, 1, 0.3, 1)); the outline turns almagre and the numerals turn cal.
- **Reduced motion:** the wipe completes instantly.
- **Otro monto:** under the tiles, a white field framed in the 2px enamel line, with "$" and "MXN" lettered in weather-2 Bungee on either side of a bold tabular amount. Typing an amount unpicks the tiles; picking a tile empties the field. While it holds the chosen amount its outline turns almagre, like a chosen tile. A wrong amount (empty, not a number, under $50, more than 2 decimals) is caught when the donor presses the sign: the message sits under the field in almagre and focus returns to it. Until the amount is valid the sign reads just "DONAR".

### Containers
- **Yellow wall:** the header; izamal ground, the signature and one corner link in its top row ("Ir a donar" on phones, hidden from 960px where the board is already in view; "← Campañas" when the page was reached from a list), then the display headline, the purpose line ending on a bold "Ayúdanos a llegar." and the pasted bill. The headline takes focus after navigation without drawing a ring.
- **Añil band:** the progress section; raised numeral, goal and end-date line, the meter, and the gap line.
- **Donate board:** on desktop, a cal board with a 2px enamel outline and 1.5rem padding hung on the yellow wall. On phones it is unframed and sits on the cal ground.
- **Bill:** the campaign photo, framed in a 2px enamel line and cropped to its frame whatever was uploaded. On the campaign wall it is pasted over both coats: it runs past the wall's foot and laps onto the band's top padding, never onto the band's lettering. Phones: a 21:9 strip under the purpose line. 960–1199px: 16:9 under the line, max 300px. From 1200px: 16:9 in a right column beside the headline (34% of the wall, 220–400px), sitting on the band, so the wall keeps its height and its empty half becomes the photo. On a campaign board: 16:9, max 320px. A missing or broken photo takes the bill off the wall; never an empty frame.
- **Enamel strips:** the preview strip at the top and the footer, both enamel grounds with small light text.

### Meter
A flat bar 1.25rem tall in a 2px cal outline on añil. The yellow fill scales from the left and is capped at full width; amounts past the goal are told by the gap line ("Meta superada por $X"), not by the bar.

### Thanks Wall
The supporters list: a 2px enamel rule on top, rows with the name on the left and the amount on the right, divided by hairlines. The newest row is enamel and bold; the next three fade through weather-1, weather-2 and weather-3, so older names weather like old paint. Empty state is one line in weather-2.

### Donation Form
Opens over the page after "Donar $X", as a sheet: a cal board with the 2px enamel line, centred, up to 44rem wide, on a flat enamel coat (no shadow, no blur). On phones the sheet is the whole screen. A yellow head with "Tus datos" and a "Cerrar" text button stays put while only the sheet scrolls. Closing it (Cerrar, Escape or "Cambiar monto") keeps what the donor typed; it cannot close while a payment is in flight. With more room, the RFC and the postal code share a row.
- **Chosen amount:** "Tu donativo: $X" in tabular Lexend, with a "Cambiar monto" text button, ruled off by the 2px enamel line.
- **Choices** (recognition, taxpayer type): white tiles with a 2px enamel outline and a native radio; the chosen one is outlined in añil and its radio is almagre.
- **Fields:** bold Lexend label, a weather-2 hint, then a white input with a 2px enamel outline, square, at least 3rem tall and 16px text so phones do not zoom. Codes (RFC, postal code) are letter-spaced with tabular figures.
- **Errors:** the input's outline and a bold message under it turn almagre, and focus moves to the first one. A form-level message sits above the pay sign.
- **Card field:** Stripe's Payment Element themed flat: square corners, the 2px enamel outline, Lexend.
- **Pay sign:** the donate sign reads "PAGAR $X"; while it works it is weather-2 with cal lettering and reads "Procesando…".

### Campaign Boards (lists)
The open and completed lists (`/campanas`, `/campanas/finalizadas`) stack one board per campaign, full width, never a grid of cards. A board is a cal ground in the 2px enamel line that climbs onto the foot of the wall above it; the list is at most 64rem wide. Every part is as big as what it holds, so no board carries empty paint:
- **From 820px, three columns.** The photo is the board's own left coat (clamp(11rem, 24%, 16rem), full height, edge to edge, a 2px enamel line on its right), the words sit in the middle, centred, and the tally coat (15–18rem) hangs 0.75rem off the top right corner, only as tall as its content: a hanging sign, never a pillar to the floor. The photo fills the height the words and the tally give it; its own shape never sets it. Without a photo the board has two columns.
- **Phones.** One column: the photo is a 21:9 strip across the top, edge to edge, then the words, then the tally; the sign is capped at 22rem.
- **Words.** The name (Bungee, añil), the purpose in bold as the lead, and the description smaller in weather-2, at most 2 lines (the full description is on the campaign page).
- **One target.** The name's link covers the whole board, so the photo and the tally open the campaign too; the sign and the completed board's text link stay pressable above it.
- **Open:** the wall is izamal and the heading reads "Elige una campaña". The tally is añil, with the raised numeral in yellow, the goal and closing date, the meter, the gap line and an enamel "VER Y DONAR" sign whose hover coat is izamal.
- **Completed:** the wall is añil and the heading reads "Campañas terminadas", lettered izamal. The board is weathered: an enamel name and a cal-deep tally, edged in the 2px enamel line where it overhangs the lime wash, with "Juntamos" and "Meta" side by side, an enamel meter filled weather-1, the result ("112% de la meta" or "Llegó al 65%"), the closing date with its year, and a plain text link to the campaign. There is no sign, because nothing can be donated.

### Completed Campaign Page
The same page as an open campaign, read only. The band says "cerró el …" with the year and "Faltaron $X" when the goal was missed. Where the donate board hangs, a "Campaña cerrada" board says when it ended and offers an enamel sign back to the open campaigns. The wall is weathered: a cal-deep coat with the headline in enamel and its sombra faded to weather-3, the purpose line in weather-1, and the desktop right column in the same cal-deep. The state reads before a word does, and the añil band still stands out against it (an añil wall would swallow the band). The wall's top corner links back to the completed list.

### Footer
An enamel strip on every campaign page, with the links to the open and completed campaigns above the test-mode notice.

### Waiting (pages being fetched)
The page before its words: the same wall the page will have (izamal for the root and the open list, añil for the completed list, a cal-deep primer for a single campaign, whose state is not known yet), the sample strip when the data is a preview, the signature, and one Lexend 700 line where the headline will land, with the top row kept as tall as the page's so nothing jumps. The wall is painted at once; the line ("Un momento…", "Preparando las campañas…", "Preparando la campaña…") appears after 300ms, so a fast answer never flashes words, and after 5s it admits "Sigue cargando… la conexión está lenta." Under the line a 6rem × 0.5rem almagre brush stroke is painted on from the left, again and again (clip-path, 1.4s, the tile wipe's easing); with reduced motion it stays painted and still. A load that takes more than 15s gives up and shows the retry notice. The status line is mounted empty and filled later so screen readers announce it, and a lasting hidden status region says when a page is ready on a first load. The html ground is painted cal inline in index.html, so the first frame is never browser white.

### Thank-You Page
The unavailable screen's yellow wall with the signature, a display sign ("¡Gracias!" or the status), one sentence and an enamel sign back to the campaign. While the payment is checked it is the same page: the sign reads "Un momento", the line "Revisando tu pago. No cierres esta página." with the waiting brush stroke, and no button. After 5s the line says the connection is slow; after 15s it stops waiting and shows the honest "not confirmed yet" wording. The answer changes only the sign and the sentence, in the same status region.

### Unavailable Screen
A full-height yellow wall with a smaller display sign and one plain sentence, shown when the site cannot load its configuration.

## Do's and Don'ts

### Do:
- **Do** paint sections as whole flat walls (izamal, anil, enamel) on the cal ground.
- **Do** keep almagre for the one chosen or pressed element (The One Moving Colour Rule).
- **Do** letter the missing amount as boldly as the raised one.
- **Do** outline tiles, boards and frames with the 2px enamel line and keep every corner square.
- **Do** use Lexend with tabular figures for every amount a donor reads.
- **Do** keep touch targets large: tiles at least 3.25rem, the donate sign at least 3.75rem.

### Don't:
- **Don't** use rounded cards, pill buttons, gradients, blur or box shadows.
- **Don't** put the painted shadow on anything other than display lettering.
- **Don't** use almagre for decoration, headings or static emphasis.
- **Don't** set sentences in Bungee.
- **Don't** letter izamal on the cal ground; it fails contrast.
