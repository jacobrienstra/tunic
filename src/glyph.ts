import { GraphemeData } from "./redux/services/data";

export const W = 173.2050807569;
export const halfW = 86.60254037845;
export const H = 310;
export const midH = 135;

export const vowelMask = 0b1000011001100;
export const consonantMask = 0b0111100010011;
export const reverseSyllableMask = 32;

export const LTLK = 1 << 0; // 1
export const LTRK = 1 << 1; // 2
export const LBLK = 1 << 2; // 4
export const LBRK = 1 << 3; // 8
export const LMVK = 1 << 4; // 16
export const LBCK = 1 << 5; // 32

export const UTLK = 1 << 6; // 64
export const UTRK = 1 << 7; // 128
export const UBLK = 1 << 8; // 256
export const UBRK = 1 << 9; // 512
export const UMVK = 1 << 10; // 1024
export const UBVK = 1 << 11; // 2048

export const ULVK = 1 << 12; // 4096
export const LLVK = 1 << 12; // 4096

export const LTL = { x1: 0, y1: 220, x2: halfW, y2: 170 };
export const LTR = { x1: halfW, y1: 170, x2: W, y2: 220 };
export const LBL = { x1: 0, y1: 220, x2: halfW, y2: 270 };
export const LBR = { x1: halfW, y1: 270, x2: W, y2: 220 };
export const LMV = { x1: halfW, y1: 170, x2: halfW, y2: 270 };
export const LBC = { cx: halfW, cy: 284, r: 14 };

export const UTL = { x1: 0, y1: 50, x2: halfW, y2: 0 };
export const UTR = { x1: halfW, y1: 0, x2: W, y2: 50 };
export const UBL = { x1: 0, y1: 50, x2: halfW, y2: 100 };
export const UBR = { x1: halfW, y1: 100, x2: W, y2: 50 };
export const UMV = { x1: halfW, y1: 0, x2: halfW, y2: 100 };
export const UBV = { x1: halfW, y1: 100, x2: halfW, y2: 135 };

export const ULV = { x1: 0, y1: 50, x2: 0, y2: 135 };
export const LLV = { x1: 0, y1: 220, x2: 0, y2: 170 };

export const glyphStrokes = {
  [LTLK]: LTL,
  [LTRK]: LTR,
  [LBLK]: LBL,
  [LBRK]: LBR,
  [LMVK]: LMV,
  [UTLK]: UTL,
  [UTRK]: UTR,
  [UBLK]: UBL,
  [UBRK]: UBR,
  [UMVK]: UMV,
  [UBVK]: UBV,
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
    (val | reverseSyllableMask) === val
      ? `${vowelGuess}${consonantGuess}`
      : `${consonantGuess}${vowelGuess}`;

  return guess;
};
