# LandMake AI

LandMake AI is a prompt-driven landing-page generator built with React, Express, tRPC, Drizzle, and MySQL-compatible persistence. Despite the product name, the first version does **not** call an external AI model. It uses a deterministic parser and a fixed template engine to turn supported prompt words into safe, inspectable HTML and CSS.

> **Truthful positioning:** LandMake is a rule-based prompt-to-template generator, not an AI model or an AI API wrapper.

## What it demonstrates

A signed-in user can describe a landing page, choose a project name, generate a deterministic draft, preview it in a sandboxed iframe, save immutable versions, reopen history, rename the project, and download a self-contained `index.html` file. User-owned records are protected by authenticated tRPC procedures and owner-scoped database queries.

The supported first-version vocabulary includes page types such as SaaS, portfolio, agency, product, and startup; visual themes such as light, dark, warm, and minimal; a fixed accent palette; and sections such as features, pricing, FAQ, testimonials, and contact. Unknown instructions fall back to safe defaults rather than becoming arbitrary code.

## Security boundaries

Generated markup is escaped before interpolation, generated CSS values come from a fixed palette, and the preview uses a sandboxed iframe. The server never executes generated HTML or user-provided JavaScript. The application does not fabricate testimonials, ratings, or customer reviews. Any future customer-content fields must be backed by real user-provided content and clear consent.

## Local development

```bash
pnpm install
pnpm check
pnpm test
pnpm dev
```

The development server requires the template's authenticated environment configuration for sign-in and database-backed project history. Do not commit `.env` files or tokens. Before using a separate deployment, create and apply a LandMake-specific database migration rather than reusing an OpenAPI Forge database.

## Project structure

```text
client/src/pages/PublicHome.tsx       Public product page
client/src/pages/Home.tsx             Authenticated project dashboard
client/src/pages/ProjectWorkspace.tsx Prompt editor, preview, history, export
server/landmake.ts                    Deterministic parser and HTML generator
server/routers.ts                     Authenticated generation and project API
drizzle/schema.ts                     Users, projects, versions, activity
LANDMAKE_AI_SPEC.md                   Product and technical specification
```

## Project status

The deterministic generation engine, focused unit tests, authenticated router surface, and initial workspace UI are implemented. Database migration and managed deployment must be completed against a separate LandMake environment before public production use.
