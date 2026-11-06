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
- **Almagre Red Oxide** (almagre): the paint of motion. The chosen amount tile, the donate sign while pressed, text selection, caret and native accent colour. Nothing at rest is almagre.

### Neutral
- **Cal Lime Wash** (cal): the ground. Page background, the donate board, tile faces, light lettering on añil and almagre, and the first coat of the headline's painted shadow.
- **Second Coat** (cal-deep): a slightly darker cal for overlaps: tile hover, hairline dividers between supporter rows, scrollbar track.
- **Black Enamel** (enamel): body text, 2px outlines, the donate sign, the preview strip and the footer.
- **Ochre Shade** (on-izamal-muted): secondary text on the yellow wall (the one-line purpose under the headline).
- **Faded Cal** (on-anil-muted): secondary text on añil (the goal and end date) and footer text on enamel.
- **Weathering 1–3** (weather-1, weather-2, weather-3): progressively faded enamel for older supporter rows; weather-2 also carries helper text such as the minimum-amount line and the empty-supporters message.

### Named Rules
**The One Moving Colour Rule.** Almagre appears only on the element in motion: the selected amount, a pressed sign, a selection, or a form error the donor has to fix. If nothing is chosen or wrong, nothing is red.

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
- **Selected:** an almagre coat is wiped left to right with a clip-path reveal (280ms, cubic-bezier(0.16, 1, 0.3, 1)); the outline turns almagre and the numerals turn cal.
- **Reduced motion:** the wipe completes instantly.

### Containers
- **Yellow wall:** the header; izamal ground, the signature and a skip-to-donate link in its top row, then the display headline, the purpose line and the pasted bill.
- **Añil band:** the progress section; raised numeral, goal and end-date line, the meter, and the gap line.
- **Donate board:** on desktop, a cal board with a 2px enamel outline and 1.5rem padding hung on the yellow wall. On phones it is unframed and sits on the cal ground.
- **Bill:** the campaign photo, 16:9, framed in a 2px enamel line, max 640px.
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

### Thank-You Page
The unavailable screen's yellow wall with the signature, a display sign ("¡Gracias!" or the status), one sentence and an enamel sign back to the campaign.

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
