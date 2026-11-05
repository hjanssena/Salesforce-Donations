# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Family and friends** of the students. They get the link from a student on WhatsApp or social media and mostly open it on a phone. They want to see what the money is for, pick an amount, and pay fast.
- **The Salesforce community** (Trailblazers, partners, user groups). They know Mexico Dreamin and the ecosystem, and they often want to be credited by name.
- **Local companies** in Mérida. They donate as a company and request an invoice with their RFC and SAT details.
- **The professor and evaluators.** In practice they are the first audience: the site is graded in a class demo on Nov 10 and Nov 17, 2026.

Visitors donate without an account. The staff side (campaigns, donations, moderation) lives in Salesforce, not on this site.

## Product Purpose

A donation portal where visitors fund the students of the SF Vibe Lab (UADY × Salesforce, Mérida), so they can cover the ticket, travel and lodging to attend Mexico Dreamin 2026 in Mexico City. Success: a visitor arriving from a shared link understands the campaign, trusts it, and completes a donation on a phone in a couple of minutes.

This is an academic simulation. Stripe runs in test mode, all money and data are fictitious, and no real CFDI is issued.

## Positioning

A small local group of students raising money for one concrete trip, not a general crowdfunding platform. Progress is visible, supporters can be thanked by name, and companies get the invoice data Mexican donors need.

## Operating Context

- Visitors arrive from a link shared by a student. There is no search or discovery feed.
- There are few campaigns at a time. With one open campaign the site opens it directly. With none it shows a message, and completed campaigns have their own view.
- Card payment goes through Stripe's own card field. The thank-you page must not claim the donation is confirmed before Salesforce records it.
- Salesforce emails the receipt and the invoice.

## Capabilities and Constraints

- Spanish only; amounts in MXN. Suggested amounts are 100, 250, 500, 1,000, 2,000, 5,000, 10,000 and 20,000, or any custom amount. The minimum is 50 MXN and there is no maximum.
- Two independent choices: recognition (anonymous, or credited with a display name) and invoice (optional, with full name, RFC, taxpayer type, postal code, tax regime and CFDI use).
- Campaigns show name, description, image, purpose, end date, goal and progress. Progress can pass 100%; a campaign closes only on its end date.
- The supporters list shows credited display names and amounts only, never emails or RFCs.
- React + TypeScript (Vite), served by Nginx in Docker on the team server. Data comes only from the Salesforce API in `docs/contract.md`.
- Source of truth for behavior: `docs/scope.md`, `docs/contract.md`, `docs/requirements/`.

## Brand Commitments

- The site speaks as **the SF Vibe Lab students**. Mexico Dreamin is the destination and can be named, but its logo, brand marks and look are not ours to use. The site must not pass itself off as Mexico Dreamin, Salesforce, UADY or GoFundMe.
- User-facing text is Spanish (Mexico). Code and docs are English.

## Evidence on Hand

- No photos and no logo files yet. Campaign images come from Salesforce (`imageUrl`).
- No testimonials, totals, press or partner logos. Do not invent them. Real progress and supporters come from the API.

## Product Principles

1. Trust first: be clear about who is asking, what the money pays for, and what happens after paying.
2. A phone and a shared link are the main way in. The donate path has to work one-handed.
3. Thank people visibly. Credited supporters and progress past the goal are part of the story.
4. Be honest about the state of things: never claim a payment is confirmed early, and never show data a donor chose to keep private.

## Accessibility & Inclusion

Target WCAG 2.2 AA. Many visitors are older relatives on phones, so text has to be readable and touch targets large, and amounts and errors must be clear in plain Spanish.
