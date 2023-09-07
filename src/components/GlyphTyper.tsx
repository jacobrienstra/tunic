import { useState, useEffect, useRef } from "react";
import { css } from "@emotion/react";
import {
  glyphStrokes,
  W,
  ULV,
  LLV,
  LBC,
  LTLK,
  LTRK,
  LBLK,
  LBRK,
  LMVK,
  LBCK,
  LLVK,
  UTLK,
  UTRK,
  UBLK,
  UBRK,
  UMVK,
  UBVK,
  H,
  midH,
} from "../glyph";

const stroke = css`
  cursor: pointer;
`;
const ghost = css`
  stroke: whitesmoke;
`;
const solid = css`
  stroke: black;
`;

const blink = css`
  @keyframes blink {
    from,
    to {
      stroke: whitesmoke;
    }
    50% {
      stroke: black;
    }
  }

  animation: 1s blink step-end infinite;
`;
interface GlyphTyperProps {
  emitGrapheme: (val: number) => void;
  emitWord: () => void;
  popLastGrapheme: () => number;
  isActive: boolean;
  width?: number;
}

function GlyphTyper({
  emitGrapheme,
  emitWord,
  popLastGrapheme,
  isActive,
  width = 150,
}: GlyphTyperProps) {
  const [val, setVal] = useState(0);

  const svgStyle = css`
    &:focus,
    &:focus-visible(),
    &:focus-within {
      outline: -webkit-focus-ring-color auto 5px;
    }
    max-width: ${width}px;
  `;

  const unusedLines = [];
  const usedLines = [];

  const svgRef = useRef<SVGSVGElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "w":
        setVal(val ^ UTLK);
        break;
      case "r":
        setVal(val ^ UTRK);
        break;
      case "s":
        setVal(val ^ UBLK);
        break;
      case "f":
        setVal(val ^ UBRK);
        break;
      case "e":
        setVal(val ^ UMVK);
        break;
      case "d":
        setVal(val ^ UBVK);
        break;
      case "u":
        setVal(val ^ LTLK);
        break;
      case "o":
        setVal(val ^ LTRK);
        break;
      case "j":
        setVal(val ^ LBLK);
        break;
      case "l":
        setVal(val ^ LBRK);
        break;
      case "k":
        setVal(val ^ LMVK);
        break;
      case ",":
        setVal(val ^ LBCK);
        break;
      case "a":
        setVal(val ^ LLVK);
        break;
      case "Enter":
        emitGrapheme(val);
        setVal(0);
        break;
      case " ":
        if (val) {
          emitGrapheme(val);
        } else {
          emitWord();
        }
        setVal(0);
        break;
      case "Escape":
      case "Backspace":
        if (val) {
          setVal(0);
        } else {
          const newVal = popLastGrapheme();
          setVal(newVal);
        }
        break;
      default:
        return;
    }
  };

  useEffect(() => {
    if (isActive) {
      svgRef.current?.focus();
    }
  }, [isActive, svgRef]);

  // Omit 5 because that's the circle, special case
  for (const i of [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11]) {
    if (val & (1 << i)) {
      usedLines.push({ ...glyphStrokes[1 << i], k: 1 << i });
    } else {
      unusedLines.push({ ...glyphStrokes[1 << i], k: 1 << i });
    }
  }
  if (val & (1 << 12)) {
    usedLines.push({ ...ULV, k: 1 << 12 });
    usedLines.push({ ...LLV, k: 1 << 12 });
  } else {
    unusedLines.push({ ...ULV, k: 1 << 12 });
    unusedLines.push({ ...LLV, k: 1 << 12 });
  }

  return (
    <svg
      width={width ?? "100%"}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={`-5 -5 ${W + 10} ${H}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      ref={svgRef}
      css={svgStyle}
    >
      {unusedLines.map((l) => (
        <line
          key={l.k + l.x1 + l.y1}
          css={[ghost, stroke]}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...l}
          onClick={() => {
            if (isActive) {
              setVal(val ^ l.k);
            }
          }}
        />
      ))}
      <circle
        css={[val & 32 ? solid : ghost, stroke]}
        strokeWidth="10"
        {...LBC}
        fill="transparent"
        onClick={() => setVal(val ^ 32)}
      />
      ;{/* Midline */}
      <line
        css={isActive ? blink : ghost}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        x1="0"
        x2={W}
        y1={midH}
        y2={midH}
      />
      ;
      {usedLines.map((l) => (
        <line
          key={l.k + l.x1 + l.y1}
          css={[solid, stroke]}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...l}
          onClick={() => {
            if (isActive) {
              setVal(val ^ l.k);
            }
          }}
        />
      ))}
    </svg>
  );
}

export default GlyphTyper;
