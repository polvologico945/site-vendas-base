type HexColor = `#${string}`;
export type ThemeStyle = Record<`--${string}`, string>;

const BLACK: HexColor = "#000000";
const WHITE: HexColor = "#ffffff";

function color(value: string | null | undefined, fallback: HexColor): HexColor {
  return /^#[\da-f]{6}$/i.test(value || "")
    ? (value!.toLowerCase() as HexColor)
    : fallback;
}
function channels(hex: HexColor) {
  return [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
}
function luminance(hex: HexColor) {
  const [red, green, blue] = channels(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
export function contrastRatio(first: string, second: string) {
  const a = luminance(color(first, BLACK));
  const b = luminance(color(second, WHITE));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
function mix(first: HexColor, second: HexColor, amount: number): HexColor {
  const a = channels(first);
  const b = channels(second);
  return `#${a
    .map((value, index) =>
      Math.round(value * (1 - amount) + b[index] * amount)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}
function foreground(background: HexColor): HexColor {
  return contrastRatio(background, BLACK) >= contrastRatio(background, WHITE)
    ? BLACK
    : WHITE;
}

/** Problema: o personalizador salvava as cores, mas cabeçalho/capa/rodapé e
 * textos continuavam verdes/brancos fixos. As mesmas cores agora geram papéis
 * para toda a interface. Texto claro/escuro é escolhido por contraste, permitindo
 * inclusive principal branca sem botões de texto branco sobre branco.
 * Data: 2026-11-13. @author Carla Evelyn
 */
export function themeStyle(
  primaryValue?: string | null,
  accentValue?: string | null,
): ThemeStyle {
  const primary = color(primaryValue, "#17634b");
  const accent = color(accentValue, "#b44121");
  const onPrimary = foreground(primary);
  const onAccent = foreground(accent);
  const ink =
    [primary, accent, mix(primary, BLACK, 0.8)].find(
      (candidate) => contrastRatio(candidate, WHITE) >= 5,
    ) || BLACK;
  const action =
    contrastRatio(primary, WHITE) >= 3
      ? primary
      : contrastRatio(accent, WHITE) >= 3
        ? accent
        : ink;
  const highlight = contrastRatio(accent, primary) >= 4.5 ? accent : onPrimary;
  const surface = (amount: number) => {
    const candidate = mix(primary, onPrimary, amount);
    return contrastRatio(candidate, onPrimary) >= 4.5
      ? candidate
      : mix(primary, onPrimary === BLACK ? WHITE : BLACK, amount);
  };
  const raised = surface(0.07);
  const hover = surface(0.13);
  const muted = mix(primary, onPrimary, 0.8);
  return {
    "--primary": primary,
    "--accent": accent,
    "--on-primary": onPrimary,
    "--on-accent": onAccent,
    "--action": action,
    "--on-action": foreground(action),
    "--primary-ink": ink,
    "--primary-border": contrastRatio(primary, WHITE) >= 3 ? primary : ink,
    "--focus": ink,
    "--ink": "#171717",
    "--muted": "#5f6368",
    "--page": mix(WHITE, primary, 0.02),
    "--surface": mix(WHITE, primary, 0.04),
    "--line": "#dfe1e4",
    "--brand-bg": primary,
    "--brand-fg": onPrimary,
    "--brand-muted": [primary, raised, hover].every(
      (background) => contrastRatio(muted, background) >= 4.5,
    )
      ? muted
      : onPrimary,
    "--brand-border": mix(primary, onPrimary, 0.2),
    "--brand-raised": raised,
    "--brand-hover": hover,
    "--brand-highlight": highlight,
    "--hero-start": primary,
    "--hero-middle": `${primary}f5`,
    "--hero-end": `${primary}66`,
  };
}
