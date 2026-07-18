import { useState, useEffect, useRef } from "react";

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
  persistent?: boolean;
  emitTrune?: (val: number) => void;
  emitWord?: () => void;
  popLastGrapheme?: () => number;
  onChange?: (val: number) => void;
  disabled: boolean;
  className?: string;
}

function TruneTyper({
  value = 0,
  persistent = true,
  emitTrune,
  emitWord,
  popLastGrapheme,
  onChange,
  disabled,
  className = "",
}: TruneTyperProps) {
  const [editingVal, setEditingVal] = useState<number>(value);
  const svgRef = useRef<SVGSVGElement>(null);

  // Apply an edit to the working value and notify onChange. Every mutation goes
  // through here so consumers that read the value on demand (e.g. a Save button)
  // stay in sync — emitTrune only fires on Enter/Space.
  const applyVal = (next: number) => {
    setEditingVal(next);
    onChange?.(next);
  };

  const toggleVal = (lineVal: number) => {
    if (!disabled) applyVal(editingVal ^ lineVal);
  };
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
        applyVal(editingVal ^ UTLK);
        break;
      case "r":
        applyVal(editingVal ^ UTRK);
        break;
      case "s":
        applyVal(editingVal ^ UBLK);
        break;
      case "d":
        applyVal(editingVal ^ UMVK);
        break;
      case "f":
        applyVal(editingVal ^ UBRK);
        break;
      case "u":
        applyVal(editingVal ^ LTLK);
        break;
      case "o":
        applyVal(editingVal ^ LTRK);
        break;
      case "k":
        applyVal(editingVal ^ LMVK);
        break;
      case "j":
        applyVal(editingVal ^ LBLK);
        break;
      case "l":
        applyVal(editingVal ^ LBRK);
        break;
      case "a":
        applyVal(editingVal ^ LVK);
        break;
      case ",":
        applyVal(editingVal ^ BCK);
        break;
      case "Enter":
        if (emitTrune) {
          emitTrune(editingVal);
          applyVal(0);
        }
        break;
      case " ":
        if (emitTrune) {
          if (editingVal) {
            emitTrune(editingVal);
          }
          if (emitWord) {
            emitWord();
          }
          applyVal(0);
        }
        break;
      case "Escape":
      case "Backspace":
        if (emitTrune) {
          if (editingVal) {
            applyVal(0);
          }
          if (popLastGrapheme) {
            applyVal(popLastGrapheme());
          }
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
              className={cn("stroke-border", isActive ? "cursor-pointer" : "")}
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
        className={cn("stroke-border", isActive ? "cursor-pointer" : "")}
      />
      <line
        {...LLV}
        key={`${LVK}_1`}
        onClick={() => toggleVal(LVK)}
        className={cn("stroke-border", isActive ? "cursor-pointer" : "")}
      />
      <circle
        className={cn(
          "stroke-border fill-transparent",
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
        .map((k) => {
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
