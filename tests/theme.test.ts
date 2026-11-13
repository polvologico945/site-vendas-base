import { describe, expect, it } from "vitest";
import { contrastRatio, themeStyle } from "../lib/theme";

describe("paleta da loja e contraste", () => {
  it.each([
    ["#ffffff", "#d01b1b"],
    ["#17634b", "#b44121"],
    ["#000000", "#ffffff"],
    ["#ffffff", "#ffffff"],
    ["#777777", "#888888"],
    ["#ffff00", "#00ffff"],
    ["#f6ecff", "#ee99bb"],
  ])("mantém textos e controles legíveis com %s e %s", (primary, accent) => {
    const theme = themeStyle(primary, accent);
    expect(theme["--primary"]).toBe(primary);
    expect(theme["--accent"]).toBe(accent);
    for (const [background, foreground] of [
      ["--primary", "--on-primary"],
      ["--accent", "--on-accent"],
      ["--action", "--on-action"],
      ["--brand-bg", "--brand-fg"],
      ["--brand-raised", "--brand-fg"],
      ["--brand-hover", "--brand-fg"],
      ["--brand-bg", "--brand-muted"],
      ["--brand-raised", "--brand-muted"],
      ["--brand-bg", "--brand-highlight"],
      ["--surface", "--primary-ink"],
    ] as const) {
      expect(
        contrastRatio(theme[background], theme[foreground]),
      ).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrastRatio(theme["--action"], "#ffffff")).toBeGreaterThanOrEqual(
      3,
    );
    expect(contrastRatio(theme["--focus"], "#ffffff")).toBeGreaterThanOrEqual(
      3,
    );
  });

  it("principal branca usa texto preto e destaque vermelho nas ações", () => {
    expect(themeStyle("#FFFFFF", "#D01B1B")).toMatchObject({
      "--brand-bg": "#ffffff",
      "--brand-fg": "#000000",
      "--action": "#d01b1b",
      "--on-action": "#ffffff",
      "--brand-highlight": "#d01b1b",
    });
  });

  it("ignora cores inválidas antes de inseri-las no CSS", () => {
    expect(themeStyle("white; color:red", null)).toEqual(themeStyle());
  });
});
