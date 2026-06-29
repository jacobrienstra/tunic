import { useState, useEffect, useRef } from "react";

import {
  glyphStrokes,
  UTLK,
  UTRK,
  UMVK,
  UBLK,
  UBRK,
  LTLK,
  LTRK,
  LMVK,
  LBLK,
  LBRK,
  ULV,
  LLV,
  LVK,
  BCK,
  BC,
  Midline,
  paddedViewBox,
  strokeWidth,
  strokeLinecap,
  strokeLinejoin,
} from "../glyph";

interface TruneTyperProps {
  emitGrapheme: (val: number) => void;
  emitWord: () => void;
  popLastGrapheme: () => number;
  isActive: boolean;
  width?: number;
}

function TruneTyper({
  emitGrapheme,
  emitWord,
  popLastGrapheme,
  isActive,
  width = 150,
}: TruneTyperProps) {
  const [val, setVal] = useState(0);

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
      case "d":
        setVal(val ^ UMVK);
        break;
      case "f":
        setVal(val ^ UBRK);
        break;
      case "u":
        setVal(val ^ LTLK);
        break;
      case "o":
        setVal(val ^ LTRK);
        break;
      case "k":
        setVal(val ^ LMVK);
        break;
      case "j":
        setVal(val ^ LBLK);
        break;
      case "l":
        setVal(val ^ LBRK);
        break;
      case "a":
        setVal(val ^ LVK);
        break;
      case ",":
        setVal(val ^ BCK);
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

  // For strokes 0 through 9, push lines (10 is actually 2 segments, 11 is circle)
  for (const i of [...Array(10).keys()]) {
    if (val & (1 << i)) {
      usedLines.push({ ...glyphStrokes[1 << i], k: 1 << i });
    } else {
      unusedLines.push({ ...glyphStrokes[1 << i], k: 1 << i });
    }
  }
  if (val & LVK) {
    usedLines.push({ ...ULV, k: LVK });
    usedLines.push({ ...LLV, k: LVK });
  } else {
    unusedLines.push({ ...ULV, k: LVK });
    unusedLines.push({ ...LLV, k: LVK });
  }

  return (
    <svg
      width={width ?? "100%"}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={paddedViewBox}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      ref={svgRef}
      className={"outline-none"} // TODO: Make sure not overridden on focus
      style={{ maxWidth: `${width}px` }} // Better way of doing this?
    >
      {unusedLines.map((l, i) => (
        <line
          className="stroke-slate-200"
          {...l}
          key={i} // TODO: use a better key
          onClick={() => {
            if (isActive) {
              setVal(val ^ l.k);
            }
          }}
        />
      ))}
      <circle
        className={`[fill:transparent] ${val & BCK ? "stroke-black" : "stroke-slate-200"}`}
        {...BC}
        onClick={() => setVal(val ^ BCK)}
      />
      ;{/* Midline */}
      <line
        className={isActive ? "animate-blink stroke-black" : "stroke-slate-200"}
        {...Midline}
      />
      ;
      {usedLines.map((l) => (
        <line
          key={l.k + l.x1 + l.y1}
          className="stroke-black"
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

export default TruneTyper;
