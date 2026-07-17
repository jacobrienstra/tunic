import { ArrowBigDown, Ban, Settings } from "lucide-react";

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
  SectionFooter,
  SectionMain,
} from "@/components/ui/section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InputInline } from "@/components/ui/input-inline";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import SubsetsEditor from "@/components/SubsetsEditor";
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
      <SectionMain>
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
        <SectionContent className="py-1">
          {[...derivedGraphemes].map(([id, graphemes]) => {
            const glyphSubset = glyphSubsets.collection.get(id);
            if (!glyphSubset) return;
            const colorClass = SUBSET_COLOR_CLASSES[glyphSubset.color];
            return (
              <div
                key={id}
                className={cn(
                  colorClass,
                  "border-accent-foreground flex flex-1 flex-col px-2 text-(--subset-color) not-last:border-r-2"
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
                          <InputInline
                            defaultValue={g.meaning ?? ""}
                            key={g.meaning ?? ""}
                            onBlur={(e) => {
                              updateTrune(g.id, { meaning: e.target.value });
                            }}
                            onKeyDown={(e) => {
                              if (
                                (e.key === "Enter" && !e.shiftKey) ||
                                e.key === "Escape"
                              )
                                e.currentTarget.blur();
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
      </SectionMain>
      <SectionFooter>
        <SubsetsEditor />
      </SectionFooter>
    </Section>
  );
}

export default GraphemesSection;
