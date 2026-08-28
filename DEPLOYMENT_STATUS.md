# Deployment Status

The LandMake AI repository was imported into the user's Vercel Hobby team as the separate project `landmake-ai`.

Deployment status: successful.

Live URL: https://landmake-ai.vercel.app

Source: https://github.com/AbbasFullstack/LandMake-AI

The initial deployment contains the public Vite frontend build. Database-backed authentication and project history still require a separate LandMake database and the required environment variables. No OpenAPI Forge credentials or database were reused, and no placeholder secret was added during import.

## QA finding

The first Vercel deployment completed, but the live URL rendered bundled source text instead of the intended landing page. Vercel detected the Vite preset with the Output Directory override disabled; the output input was disabled and defaulted to `dist`. The repository build produces the client artifact under `dist/public`, so the Vercel project settings need an explicit `dist/public` output directory override before redeploying. No secret variables are required for the public build correction.

## Configuration correction

Vercel project settings now have Output Directory override enabled with value `dist/public`. The settings save succeeded. A fresh deployment is required to apply the corrected production artifact.

## Redeploy

The deployment action menu is available on the latest production deployment. The first menu-item click did not persist through the browser automation layer; the redeploy action remains pending. No production secrets or billing settings were changed.

The corrected project setting remains saved. The deployment action menu is accessible, but the visual menu-item click closed the menu without starting a redeploy; a targeted DOM menu action will be used next. No other Vercel settings were changed.

## Corrected deployment in progress

Vercel automatically started a new production deployment after commit `ce3ab7a` was pushed to the connected `main` branch. The deployment is `2dwztSGhgiDGar384Un7hL4UgNDt`, currently shown as Building, with preview URL `https://landmake-d5i24etnz-abbasfullstacks-projects.vercel.app`. The previous `master` deployment remains Ready but is the misconfigured deployment.

## Final public landing verification

The corrected `main` deployment is Ready and production. Stable URL `https://landmake-ai.vercel.app` now renders the LandMake landing page and browser title `LandMake — Rule-Based Template Studio`. The page visibly communicates the deterministic, no-external-AI positioning. Authenticated database-backed flows remain staged for a separate environment configuration milestone.

## Full-stack runtime diagnosis (2026-08-28)

The current `Other` preset deployment still returns Vercel `404: NOT_FOUND` for `/api/oauth/callback`, even after disabling the Output Directory override and pushing a redeploy commit. The static landing page is available, but the root `server.ts` is not being routed as a live API by the current Vercel project configuration. The full-stack deployment path therefore needs a dedicated Vercel function entrypoint or managed full-stack hosting before auth can be claimed functional. Reference: https://vercel.com/docs/functions/runtimes/node-js
