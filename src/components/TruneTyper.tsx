import { useState, useEffect, useRef, useCallback } from "react";

import { cn } from "@/lib/utils";
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
} from "@/glyph";

interface TruneTyperProps {
  value?: number;
  emitTrune: (val: number) => void;
  emitWord?: () => void;
  popLastGrapheme?: () => number;
  disabled: boolean;
  className?: string;
}

function TruneTyper({
  value = 0,
  emitTrune,
  emitWord,
  popLastGrapheme,
  disabled,
  className = "",
}: TruneTyperProps) {
  const [editingVal, setEditingVal] = useState<number>(value);
  const svgRef = useRef<SVGSVGElement>(null);

  const toggleVal = useCallback(
    (lineVal: number) => {
      if (!disabled) setEditingVal((v) => v ^ lineVal);
    },
    [disabled]
  );
  // I want to have some focus logic here so if you click away it turns off, that kind of thing. Like InlineEdit
  const isActive = !disabled;

  useEffect(() => {
    if (isActive) {
      svgRef.current?.focus();
    }
  }, [isActive, svgRef]);

  const glyphKeyboardMapper = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "w":
        setEditingVal((v) => v ^ UTLK);
        break;
      case "r":
        setEditingVal((v) => v ^ UTRK);
        break;
      case "s":
        setEditingVal((v) => v ^ UBLK);
        break;
      case "d":
        setEditingVal((v) => v ^ UMVK);
        break;
      case "f":
        setEditingVal((v) => v ^ UBRK);
        break;
      case "u":
        setEditingVal((v) => v ^ LTLK);
        break;
      case "o":
        setEditingVal((v) => v ^ LTRK);
        break;
      case "k":
        setEditingVal((v) => v ^ LMVK);
        break;
      case "j":
        setEditingVal((v) => v ^ LBLK);
        break;
      case "l":
        setEditingVal((v) => v ^ LBRK);
        break;
      case "a":
        setEditingVal((v) => v ^ LVK);
        break;
      case ",":
        setEditingVal((v) => v ^ BCK);
        break;
      case "Enter":
        emitTrune(editingVal);
        setEditingVal(0);
        break;
      case " ":
        if (editingVal) {
          emitTrune(editingVal);
        } else if (emitWord !== undefined) {
          emitWord();
        }
        setEditingVal(0);
        break;
      case "Escape":
      case "Backspace":
        if (editingVal) {
          setEditingVal(0);
        } else if (popLastGrapheme !== undefined) {
          const newVal = popLastGrapheme();
          setEditingVal(newVal);
        }
        break;
      default:
        return;
    }
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={paddedViewBox}
      tabIndex={0}
      onKeyDown={glyphKeyboardMapper}
      ref={svgRef}
      className={cn("w-(--glyph-size) outline-none", className)}
      {...{ strokeWidth, strokeLinecap, strokeLinejoin }}
    >
      {Object.keys(glyphStrokes)
        .map(Number)
        .map((k) => {
          return (
            <line
              className={cn(
                "stroke-(--border)",
                isActive ? "cursor-pointer" : ""
              )}
              {...glyphStrokes[k]}
              key={k}
              onClick={() => toggleVal(k)}
            />
          );
        })}
      <line
        {...ULV}
        key={`${LVK}_0`}
        onClick={() => toggleVal(LVK)}
        className={cn("stroke-(--border)", isActive ? "cursor-pointer" : "")}
      />
      <line
        {...LLV}
        key={`${LVK}_1`}
        onClick={() => toggleVal(LVK)}
        className={cn("stroke-(--border)", isActive ? "cursor-pointer" : "")}
      />
      <circle
        className={cn(
          "fill-transparent stroke-(--border)",
          isActive ? "cursor-pointer" : ""
        )}
        {...BC}
        onClick={() => toggleVal(BCK)}
      />
      <line
        {...Midline}
        className={cn(isActive ? "animate-(--animate-blink)" : "")}
      />
      {/* Overlay of active strokes. SVG uses paint order, not z-index, so I have to do this to avoid shuffling the strokes every edit */}
      {Object.keys(glyphStrokes)
        .map(Number)
        .filter((k) => (editingVal & k) === k)
        .map((k, i) => {
          // console.log(k, i);
          return (
            <line
              className={cn(
                "pointer-none pointer-events-none stroke-(--subset-color)"
              )}
              {...glyphStrokes[k]}
              key={k}
            />
          );
        })}
      {(editingVal & LVK) === LVK ? (
        <>
          <line
            {...ULV}
            key={`${LVK}_10`}
            className={cn(
              "pointer-none pointer-events-none stroke-(--subset-color)"
            )}
          />
          <line
            {...LLV}
            key={`${LVK}_11`}
            className={cn(
              "pointer-none pointer-events-none stroke-(--subset-color)"
            )}
          />
        </>
      ) : null}
      {(editingVal & BCK) === BCK ? (
        <circle
          className={cn(
            "pointer-none pointer-events-none fill-transparent stroke-(--subset-color)"
          )}
          {...BC}
        />
      ) : null}
    </svg>
  );
}

export default TruneTyper;
