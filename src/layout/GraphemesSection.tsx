import { ArrowBigDown, Ban } from "lucide-react";

import { cn } from "@/lib/utils";
import { SUBSET_COLOR_CLASSES, useGlyphSubsets } from "@/data/store";
import { useSelectionStore } from "@/data/selectionStore";
import { updateTrune } from "@/data/mutations";
import { useDerivedGraphemes } from "@/data/filtered";
import { Tile, TileTrunic, TileInput } from "@/components/ui/tile";
import {
  Section,
  SectionTitle,
  SectionControls,
  SectionContent,
} from "@/components/ui/section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import InlineEdit from "@/components/InlineEdit";
import { Glyph } from "@/components/Glyph";

function GraphemesSection() {
  const graphemesFilterDirection = useSelectionStore(
    (s) => s.graphemesFilterDirection
  );
  const setGraphemesFilterDirection = useSelectionStore(
    (s) => s.setGraphemesFilterDirection
  );
  const derivedGraphemes = useDerivedGraphemes();
  const glyphSubsets = useGlyphSubsets();

  return (
    <Section>
      <SectionControls>
        <SectionTitle>Graphemes</SectionTitle>
        <ButtonGroup
          orientation="vertical"
          aria-label="Filter direction"
          className="h-fit"
        >
          <Button
            variant="outline"
            size="icon"
            active={graphemesFilterDirection === "off"}
            onClick={() => setGraphemesFilterDirection("off")}
          >
            <Ban />
          </Button>
          <Button
            variant="outline"
            size="icon"
            active={graphemesFilterDirection === "forward"}
            onClick={() => setGraphemesFilterDirection("forward")}
          >
            <ArrowBigDown />
          </Button>
        </ButtonGroup>
      </SectionControls>
      <SectionContent>
        {[...derivedGraphemes].map(([id, graphemes]) => {
          const glyphSubset = glyphSubsets.collection.get(id);
          if (!glyphSubset) return;
          const colorClass = SUBSET_COLOR_CLASSES[glyphSubset.color];
          return (
            <div
              key={id}
              className={cn(
                colorClass,
                "border-accent-foreground flex flex-1 flex-col px-2 text-[var(--subset-color)] not-last:border-r-2"
              )}
            >
              <h3 className="self-center text-xl">{glyphSubset.name}</h3>
              <ScrollArea>
                <div className="flex flex-row flex-wrap">
                  {graphemes.map((g) => (
                    <Tile
                      key={g.id}
                      active={false}
                      toggleFn={() => {
                        return;
                      }}
                      val={g.id}
                    >
                      <TileTrunic>
                        <Glyph val={g.id} />
                      </TileTrunic>
                      <TileInput>
                        <InlineEdit
                          value={g.meaning ?? ""}
                          setValueFn={(val: string) => {
                            updateTrune(g.id, { meaning: val });
                          }}
                        />
                      </TileInput>
                    </Tile>
                  ))}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </SectionContent>
    </Section>
  );
}

export default GraphemesSection;
