export const W = 173.2050807569;
export const halfW = 86.60254037845;

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

export const LTL = {x1: 0, y1: 200, x2: halfW, y2: 150};
export const LTR = {x1: halfW, y1: 150, x2: W, y2: 200}
export const LBL = {x1: 0, y1: 200, x2: halfW, y2: 250};
export const LBR = {x1: halfW, y1: 250, x2: W, y2: 200}
export const LMV = {x1: halfW, y1: 150, x2: halfW, y2: 250}
export const LBC = {cx: halfW, cy: 260, r: 10};

export const UTL = {x1: 0, y1: 50, x2: halfW, y2: 0};
export const UTR = {x1: halfW, y1: 0, x2: W, y2: 50};
export const UBL = {x1: 0, y1: 50, x2: halfW, y2: 100};
export const UBR = {x1: halfW, y1: 100, x2: W, y2: 50};
export const UMV = {x1: halfW, y1: 0, x2: halfW, y2: 100};
export const UBV = {x1: halfW, y1: 100, x2: halfW, y2: 125};

export const ULV = {x1:0, y1: 50, x2: 0, y2: 125};
export const LLV = {x1:0, y1: 200, x2: 0, y2: 150};

export const glyphStrokes = {[LTLK]: LTL, [LTRK]: LTR, [LBLK]: LBL, [LBRK]: LBR, [LMVK]: LMV, [LBCK]: LBC, [UTLK]: UTL, [UTRK]: UTR, [UBLK]: UBL, [UBRK]: UBR, [UMVK]: UMV, [UBVK]: UBV}

export function getCombo(upper: number, lower: number, leftLine: boolean = false) {
  return (((upper & 63) << 6) | (lower & 63)) | (leftLine ? 1 << 12 : 0);
}

export function getUpper(val: number) {
  return val & (63 << 6);
}

export function getLower(val: number) {
  return val & 63;
}