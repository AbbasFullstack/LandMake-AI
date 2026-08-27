import { describe, expect, it } from "vitest";
import { generateLanding, parseLandingPrompt } from "./landmake";

describe("LandMake deterministic prompt engine", () => {
  it("uses safe defaults for an empty prompt", () => {
    const config = parseLandingPrompt("");
    expect(config.pageType).toBe("saas");
    expect(config.theme).toBe("light");
    expect(config.accent).toBe("violet");
    expect(config.sections).toEqual(["features", "pricing", "contact"]);
  });

  it("extracts supported page, theme, accent, sections, audience, and CTA tokens", () => {
    const config = parseLandingPrompt(
      'Build a dark blue SaaS landing page for remote teams with features, pricing, and FAQ. CTA: Book a demo',
    );
    expect(config.pageType).toBe("saas");
    expect(config.theme).toBe("dark");
    expect(config.accent).toBe("blue");
    expect(config.sections).toEqual(["features", "pricing", "faq"]);
    expect(config.audience).toBe("remote teams with features");
    expect(config.ctaLabel).toBe("Book a demo");
  });

  it("escapes user-controlled values before placing them in HTML", () => {
    const generated = generateLanding('<script>alert(1)</script> for designers');
    expect(generated.html).not.toContain("<script>alert(1)</script>");
    expect(generated.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(generated.html).not.toMatch(/<script[^>]*>/i);
  });

  it("generates a self-contained HTML document without executable scripts", () => {
    const generated = generateLanding("Create a warm portfolio page with contact and a rose accent");
    expect(generated.html).toMatch(/^<!doctype html>/i);
    expect(generated.html).toContain('id="contact"');
    expect(generated.html).toContain("Generated with LandMake");
    expect(generated.html).not.toMatch(/<script\b/i);
  });
});
