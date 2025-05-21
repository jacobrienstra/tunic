import { GraphemeData } from "./redux/services/data";

/* Tinkered with these values to get them just right.
 * They're based on a regular hexagon with sides of 100,
 * plus some white space padding and tweaks
 */
export const W = 173.2050807569;
export const halfW = 86.60254037845;
export const H = 310;
export const midH = 135;

export const vowelMask = 0b11100000011;
export const consonantMask = 0b00011111100;

/* Key:
 * (Lower/Upper)
 * Top/Bottom/Middle/Left
 * Left/Right/Vertical/Circle
 * Key
 *
 * e.g. LTLK = Lower Top Left Key
 */

export const UTLK = 1 << 0; // 1 or 0b1
export const UTRK = 1 << 1; // 2 or 0b10
export const UMVK = 1 << 2; // 4 or 0b100
export const UBLK = 1 << 3; // 8 or 0b1000
export const UBRK = 1 << 4; // 16 or 0b10000

export const LTLK = 1 << 5; // 32 or 0b100000
export const LTRK = 1 << 6; // 64 or 0b1000000
export const LMVK = 1 << 7; // 128 or 0b10000000
export const LBLK = 1 << 8; // 256 or 0b100000000
export const LBRK = 1 << 9; // 512 or 0b1000000000

// Left Vertical Key
export const LVK = 1 << 10; // 1024 or 0b10000000000
export const BCK = 1 << 11; // 2048 or 0b1000000000000

export type GlyphLine = { x1: number; y1: number; x2: number; y2: number };
export type GlyphCircle = { cx: number; cy: number; r: number };

export const UTL: GlyphLine = { x1: 0, y1: 50, x2: halfW, y2: 0 };
export const UTR: GlyphLine = { x1: halfW, y1: 0, x2: W, y2: 50 };
export const UMV: GlyphLine = { x1: halfW, y1: 0, x2: halfW, y2: 100 };
export const UBL: GlyphLine = { x1: 0, y1: 50, x2: halfW, y2: 100 };
export const UBR: GlyphLine = { x1: halfW, y1: 100, x2: W, y2: 50 };
export const UBV: GlyphLine = { x1: halfW, y1: 100, x2: halfW, y2: 135 };

export const LTL: GlyphLine = { x1: 0, y1: 220, x2: halfW, y2: 170 };
export const LTR: GlyphLine = { x1: halfW, y1: 170, x2: W, y2: 220 };
export const LMV: GlyphLine = { x1: halfW, y1: 170, x2: halfW, y2: 270 };
export const LBL: GlyphLine = { x1: 0, y1: 220, x2: halfW, y2: 270 };
export const LBR: GlyphLine = { x1: halfW, y1: 270, x2: W, y2: 220 };

export const ULV: GlyphLine = { x1: 0, y1: 50, x2: 0, y2: 135 };
export const LLV: GlyphLine = { x1: 0, y1: 220, x2: 0, y2: 170 };

export const BC: GlyphCircle = { cx: halfW, cy: 284, r: 14 };

export const Midline: GlyphLine = { x1: 0, x2: W, y1: midH, y2: midH };

export const glyphStrokes: {
  [key: number]: GlyphLine;
} = {
  [UTLK]: UTL,
  [UTRK]: UTR,
  [UMVK]: UMV,
  [UBLK]: UBL,
  [UBRK]: UBR,

  [LTLK]: LTL,
  [LTRK]: LTR,
  [LMVK]: LMV,
  [LBLK]: LBL,
  [LBRK]: LBR,
};

export function getCombo(
  vowel: number,
  consonant: number,
  reverseSyllable: boolean = false
) {
  return (
    (vowel & vowelMask) |
    (consonant & consonantMask) |
    (reverseSyllable ? 32 : 0)
  );
}

export function getVowel(val: number | string) {
  const v = typeof val === "string" ? parseInt(val) : val;
  return v & vowelMask;
}

export function getConsonant(val: number | string) {
  const v = typeof val === "string" ? parseInt(val) : val;
  return v & consonantMask;
}

export const getGraphemeSoundGuess = (
  val: number,
  graphemes?: GraphemeData[]
): string => {
  let vowelGuess = graphemes?.find((g) => g.id === getVowel(val))?.sound ?? "?";
  if (!getVowel(val) && vowelGuess === "?") {
    vowelGuess = "";
  }
  let consonantGuess =
    graphemes?.find((g) => g.id === getConsonant(val))?.sound ?? "?";
  if (!getConsonant(val) && consonantGuess === "?") {
    consonantGuess = "";
  }
  const guess =
    (val | BCK) === val
      ? `${vowelGuess}${consonantGuess}`
      : `${consonantGuess}${vowelGuess}`;

  return guess;
};
