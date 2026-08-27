export const LANDMAKE_THEMES = ["light", "dark", "warm", "minimal"] as const;
export const LANDMAKE_ACCENTS = ["violet", "blue", "emerald", "amber", "rose"] as const;
export const LANDMAKE_SECTIONS = ["features", "pricing", "testimonials", "faq", "contact"] as const;
export const LANDMAKE_PAGE_TYPES = ["saas", "portfolio", "agency", "product", "startup"] as const;

export type LandmakeTheme = (typeof LANDMAKE_THEMES)[number];
export type LandmakeAccent = (typeof LANDMAKE_ACCENTS)[number];
export type LandmakeSection = (typeof LANDMAKE_SECTIONS)[number];
export type LandmakePageType = (typeof LANDMAKE_PAGE_TYPES)[number];

export type LandingConfig = {
  theme: LandmakeTheme;
  accent: LandmakeAccent;
  pageType: LandmakePageType;
  sections: LandmakeSection[];
  audience: string;
  ctaLabel: string;
  headline: string;
};

export type GeneratedLanding = LandingConfig & {
  html: string;
};

const THEME_WORDS: Record<LandmakeTheme, string[]> = {
  light: ["light", "bright", "white"],
  dark: ["dark", "black", "midnight"],
  warm: ["warm", "cream", "soft"],
  minimal: ["minimal", "clean", "simple"],
};

const ACCENT_WORDS: Record<LandmakeAccent, string[]> = {
  violet: ["violet", "purple", "indigo"],
  blue: ["blue", "cyan", "ocean"],
  emerald: ["emerald", "green", "mint"],
  amber: ["amber", "yellow", "gold"],
  rose: ["rose", "pink", "coral"],
};

const PAGE_WORDS: Record<LandmakePageType, string[]> = {
  saas: ["saas", "software", "platform", "dashboard"],
  portfolio: ["portfolio", "developer", "designer", "freelancer"],
  agency: ["agency", "studio", "services", "consulting"],
  product: ["product", "app", "tool", "launch"],
  startup: ["startup", "founder", "innovation", "venture"],
};

const SECTION_WORDS: Record<LandmakeSection, string[]> = {
  features: ["feature", "features", "benefit", "benefits"],
  pricing: ["pricing", "price", "plans", "plan"],
  testimonials: ["testimonial", "testimonials", "reviews", "review"],
  faq: ["faq", "questions", "question"],
  contact: ["contact", "reach", "email", "form"],
};

const DEFAULT_SECTIONS: LandmakeSection[] = ["features", "pricing", "contact"];
const ACCENT_VALUES: Record<LandmakeAccent, { primary: string; soft: string }> = {
  violet: { primary: "#7c3aed", soft: "#ede9fe" },
  blue: { primary: "#2563eb", soft: "#dbeafe" },
  emerald: { primary: "#059669", soft: "#d1fae5" },
  amber: { primary: "#d97706", soft: "#fef3c7" },
  rose: { primary: "#e11d48", soft: "#ffe4e6" },
};

function words(prompt: string) {
  return prompt.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean);
}

function findMatch<T extends string>(tokens: string[], choices: readonly T[], dictionary: Record<T, string[]>, fallback: T): T {
  return choices.find(choice => dictionary[choice].some(word => tokens.includes(word))) ?? fallback;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

function titleFromPrompt(prompt: string, pageType: LandmakePageType) {
  const cleaned = prompt.replace(/\s+/g, " ").trim();
  if (!cleaned) return `${pageType[0].toUpperCase()}${pageType.slice(1)} made clearer.`;
  const firstClause = cleaned.split(/[.!?]/)[0].slice(0, 72).trim();
  return firstClause ? `${firstClause[0].toUpperCase()}${firstClause.slice(1)}` : "A clearer way to move forward.";
}

function sectionMarkup(section: LandmakeSection, accent: { primary: string; soft: string }) {
  const copy: Record<LandmakeSection, string> = {
    features: "Show the strongest outcomes in a focused, easy-to-scan layout.",
    pricing: "Make the next step clear with a simple plan comparison.",
    testimonials: "Share real customer experiences here when you have permission to publish them.",
    faq: "Answer the questions that help visitors make a confident decision.",
    contact: "Give interested visitors a clear, low-friction way to reach you.",
  };
  const title = section[0].toUpperCase() + section.slice(1);
  return `<section class="section section-${section}" id="${section}"><div class="section-inner"><p class="eyebrow" style="color:${accent.primary}">${title}</p><h2>${title} that keep the story moving.</h2><p class="muted">${copy[section]}</p><div class="section-card" style="border-color:${accent.soft}"></div></div></section>`;
}

export function parseLandingPrompt(prompt: string): LandingConfig {
  const tokens = words(prompt);
  const pageType = findMatch(tokens, LANDMAKE_PAGE_TYPES, PAGE_WORDS, "saas");
  const theme = findMatch(tokens, LANDMAKE_THEMES, THEME_WORDS, "light");
  const accent = findMatch(tokens, LANDMAKE_ACCENTS, ACCENT_WORDS, "violet");
  const sections = LANDMAKE_SECTIONS.filter(section => SECTION_WORDS[section].some(word => tokens.includes(word)));
  const audienceMatch = prompt.match(/(?:for|built for|made for)\s+([^,.!?]+)/i)?.[1]?.trim();
  const ctaMatch = prompt.match(/(?:cta|button|call to action)\s*(?:is|:)?\s*["“]?([^"”.,!?]+)["”]?/i)?.[1]?.trim();
  return {
    theme,
    accent,
    pageType,
    sections: sections.length ? sections : DEFAULT_SECTIONS,
    audience: audienceMatch ? audienceMatch.slice(0, 80) : "people ready for a clearer next step",
    ctaLabel: ctaMatch ? ctaMatch.slice(0, 32) : "Get started",
    headline: titleFromPrompt(prompt, pageType),
  };
}

export function generateLanding(prompt: string): GeneratedLanding {
  const config = parseLandingPrompt(prompt);
  const colors = ACCENT_VALUES[config.accent];
  const background = config.theme === "dark" ? "#0f172a" : config.theme === "warm" ? "#fffaf0" : "#f8fafc";
  const foreground = config.theme === "dark" ? "#f8fafc" : "#0f172a";
  const muted = config.theme === "dark" ? "#94a3b8" : "#64748b";
  const sections = config.sections.map(section => sectionMarkup(section, colors)).join("\n");
  const title = escapeHtml(config.headline);
  const audience = escapeHtml(config.audience);
  const cta = escapeHtml(config.ctaLabel);
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    :root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:${foreground};background:${background};}
    *{box-sizing:border-box}body{margin:0;background:${background};color:${foreground}}a{text-decoration:none;color:inherit}
    .shell{max-width:1120px;margin:0 auto;padding:24px}.nav{display:flex;justify-content:space-between;align-items:center;padding:10px 0}.brand{font-weight:800;letter-spacing:-.04em}.nav-link{color:${muted};font-size:14px}
    .hero{padding:96px 0 72px;max-width:760px}.eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.18em;font-weight:800}.hero h1{font-size:clamp(42px,7vw,84px);line-height:.98;letter-spacing:-.07em;margin:18px 0}.hero p{font-size:19px;line-height:1.6;color:${muted};max-width:620px}.cta{display:inline-flex;background:${colors.primary};color:#fff;padding:14px 20px;border-radius:999px;font-weight:750;margin-top:18px;box-shadow:0 16px 32px ${colors.primary}33}.section{padding:64px 0;border-top:1px solid ${colors.soft}}.section-inner{max-width:760px}.section h2{font-size:clamp(28px,4vw,48px);letter-spacing:-.05em;margin:8px 0 14px}.muted{color:${muted};line-height:1.65}.section-card{height:92px;border:1px dashed;border-radius:20px;margin-top:24px;background:${colors.soft}55}.footer{padding:56px 0;color:${muted};font-size:13px}
  </style>
</head>
<body><main class="shell"><nav class="nav"><a class="brand" href="#top">LandMake</a><a class="nav-link" href="#contact">Built for ${audience}</a></nav><header class="hero" id="top"><p class="eyebrow" style="color:${colors.primary}">${config.pageType} landing page</p><h1>${title}</h1><p>A focused landing page for ${audience}. Built from a deterministic template engine with safe, editable HTML.</p><a class="cta" href="#contact">${cta}</a></header>${sections}<footer class="footer">Generated with LandMake — a rule-based prompt-to-template generator.</footer></main></body></html>`;
  return { ...config, html };
}
