import { Glyph } from "./Glyph";

import { cn } from "@/lib/utils";
import { SUBSET_COLOR_CLASSES, useGlyphSubsets } from "@/data/store";
import { useSelectionStore } from "@/data/selectionStore";
import { LogicNode } from "@/data/logic";

function LogicStringView({
  filterLogic,
  mode,
  root = true,
}: {
  filterLogic: LogicNode | null;
  mode: "text" | "dot" | "glyph";
  root?: boolean;
}) {
  const glyphSubsets = useGlyphSubsets();
  const selectedGraphemes = useSelectionStore((s) => s.selectedGraphemes);

  if (!filterLogic) return root ? <span /> : null;
  switch (filterLogic.type) {
    case "subset":
      {
        const subset = glyphSubsets.collection?.get(filterLogic.subsetId);
        if (!subset) return null;
        switch (mode) {
          case "dot":
            return (
              <span
                className={cn(
                  SUBSET_COLOR_CLASSES[subset.color],
                  "inline-block size-2 w-(--text-base) rounded-full bg-(--subset-color)"
                )}
              />
            );
          case "text":
            return (
              <span
                className={cn(
                  SUBSET_COLOR_CLASSES[subset.color],
                  "text-(--subset-color)"
                )}
              >
                {subset.name}
              </span>
            );
          case "glyph": {
            const subsetSelectedGrapheme = subset.modifier
              ? subset.mask
              : selectedGraphemes[subset.id];
            return subsetSelectedGrapheme ? (
              <Glyph
                val={subsetSelectedGrapheme}
                inline={subset.modifier}
                className={cn(
                  SUBSET_COLOR_CLASSES[subset.color],
                  "[--glyph-size:var(--text-base)]"
                )}
              />
            ) : (
              <span
                className={cn(
                  SUBSET_COLOR_CLASSES[subset.color],
                  "inline-block size-2 w-(--text-base) rounded-full bg-(--subset-color)"
                )}
              />
            );
          }
        }
      }
      break;
    case "not":
      return (
        <span className="inline-flex items-center gap-1">
          not
          <LogicStringView
            filterLogic={filterLogic.child}
            mode={mode}
            root={false}
          />
        </span>
      );
    case "and":
    case "or":
      return (
        <span className="inline-flex items-center gap-1">
          {!root && "("}
          {filterLogic.children.map((node, i) => (
            <span key={node.id} className="inline-flex items-center gap-1">
              <LogicStringView filterLogic={node} mode={mode} root={false} />
              {i < filterLogic.children.length - 1 ? (
                <span>{filterLogic.type}</span>
              ) : null}
            </span>
          ))}
          {!root && ")"}
        </span>
      );
    default:
      return null;
  }
}

export default LogicStringView;
