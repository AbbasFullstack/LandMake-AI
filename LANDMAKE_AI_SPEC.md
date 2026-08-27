# LandMake AI — Product and Technical Specification

## Product Positioning

LandMake AI is a prompt-driven landing-page generator that uses a deterministic rules and template engine rather than an external AI model. The product must never claim that it uses artificial intelligence to generate copy or code. The name is retained as a product brand, while the public description uses the accurate phrase **rule-based prompt-to-template generator**.

## Core User Flow

1. A visitor arrives at the public landing page and sees a truthful explanation of the generator.
2. The user signs in through the existing authenticated application flow.
3. The protected workspace presents a chat-style prompt composer with guided examples.
4. The user describes a landing page in natural language, such as a dark SaaS page with a hero, three features, pricing, and a call to action.
5. The deterministic parser extracts supported intent tokens, including page type, theme, accent color, requested sections, audience, CTA text, and headline hints.
6. The generator creates a structured landing-page document from validated templates and sanitized values.
7. The workspace renders the generated page in a sandboxed preview and shows a structured section outline.
8. The user can regenerate from the same prompt, edit the project name, save the version, reopen history, or download a self-contained `index.html` file.

## Explicit Non-Goals

The first version will not call an external AI provider, scrape websites, execute arbitrary user code, accept uploaded scripts, claim human-like understanding, fabricate testimonials or ratings, or promise unlimited AI generation. Unsupported prompt instructions will fall back to safe defaults and be shown as ignored or unsupported options.

## MVP Data Model

| Entity | Purpose |
|---|---|
| `landingProjects` | User-owned project name, original prompt, current generated document, and timestamps |
| `landingVersions` | Immutable generated HTML/CSS snapshots with parser configuration and timestamps |
| `projectActivities` | User-scoped history events such as created, generated, exported, renamed, and deleted |

Every read, update, and delete operation must scope by the authenticated owner ID. Generated HTML is a product artifact, not executable server code.

## Deterministic Parser Contract

The parser returns a validated object with `theme`, `accent`, `sections`, `pageType`, `audience`, `ctaLabel`, and `headline`. Supported values are finite enums. Unknown words do not become executable markup or arbitrary CSS. User-provided text is escaped before HTML interpolation, and CSS values come only from a fixed palette map.

## Preview and Export Boundaries

The preview must render generated content in a sandboxed iframe with no same-origin access and no scripts in generated markup. The export contains semantic HTML and scoped CSS only. The download route must return the saved artifact for the authenticated owner and must not execute it on the server.

## Success Criteria

The first milestone is complete when a signed-in user can create a project from a prompt, see a deterministic preview, save and reopen a generated version, download `index.html`, and receive clear empty, loading, validation, and error states. Vitest coverage must include parser defaults, supported token extraction, unknown-token handling, HTML escaping, owner isolation, and download content shape.
