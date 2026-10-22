import tokens from "@/design/tokens.json";

// WCAG 2.2 contrast ratios computed at build from the shipped token hex values (never typed).
const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const one = (theme) => {
  const c = tokens.color[theme];
  return {
    body: ratio(c["text.primary"], c["surface.page"]).toFixed(1),
    label: ratio(c["mark.ink"], c["mark.fill"]).toFixed(1),
  };
};
export const measured = { light: one("light"), dark: one("dark") };
export const contrastLine = (m) => `Contrast, measured at build: body on paper ${m.body}:1, label on highlight ${m.label}:1.`;
