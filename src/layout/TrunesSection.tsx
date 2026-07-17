import { ArrowBigDown, Ban, ArrowBigUp } from "lucide-react";

import { useTrunes } from "@/data/store";
import { useSelectionStore } from "@/data/selectionStore";
import { useDerivedMeaning } from "@/data/ruleset";
import { updateTrune } from "@/data/mutations";
import { useFilteredTrunes } from "@/data/filtered";
import {
  Tile,
  TileTrunic,
  TileAnnotation,
  TileInput,
} from "@/components/ui/tile";
import {
  Section,
  SectionTitle,
  SectionControls,
  SectionContent,
  SectionMain,
} from "@/components/ui/section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InputInline } from "@/components/ui/input-inline";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { Glyph } from "@/components/Glyph";

function TrunesSection() {
  const truneFilterDirection = useSelectionStore((s) => s.truneFilterDirection);
  const setTruneFilterDirection = useSelectionStore(
    (s) => s.setTruneFilterDirection
  );
  const selectedTrune = useSelectionStore((s) => s.selectedTrune);
  const toggleSelectedTrune = useSelectionStore((s) => s.toggleSelectedTrune);
  const filteredTrunes = useFilteredTrunes();
  const allTrunes = useTrunes();
  const derivedMeaning = useDerivedMeaning();

  return (
    <Section>
      <SectionMain>
        <SectionControls>
          <SectionTitle>Trunes</SectionTitle>
          <ButtonGroup
            orientation="vertical"
            aria-label="Filter direction"
            className="h-fit"
          >
            <Button
              variant="outline"
              size="icon"
              active={truneFilterDirection === "backward"}
              onClick={() => setTruneFilterDirection("backward")}
            >
              <ArrowBigUp />
            </Button>
            <Button
              variant="outline"
              size="icon"
              active={truneFilterDirection === "off"}
              onClick={() => setTruneFilterDirection("off")}
            >
              <Ban />
            </Button>
            <Button
              variant="outline"
              size="icon"
              active={truneFilterDirection === "forward"}
              onClick={() => setTruneFilterDirection("forward")}
            >
              <ArrowBigDown />
            </Button>
          </ButtonGroup>
        </SectionControls>
        <SectionContent>
          <ScrollArea orientation="horizontal" className="h-full py-1">
            <div className={"flex w-max flex-row"}>
              {allTrunes.data.map((t) => (
                <Tile
                  key={t.id}
                  active={selectedTrune === t.id}
                  toggleFn={toggleSelectedTrune}
                  val={t.id}
                  hidden={!filteredTrunes.collection?.has(t.id)}
                >
                  <TileTrunic>
                    <Glyph val={t.id} />
                  </TileTrunic>
                  <TileAnnotation>{derivedMeaning(t.id)}</TileAnnotation>
                  <TileInput>
                    <InputInline
                      defaultValue={t.meaning ?? ""}
                      key={t.meaning ?? ""}
                      onBlur={(e) => {
                        updateTrune(t.id, { meaning: e.target.value });
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
        </SectionContent>
      </SectionMain>
    </Section>
  );
}

export default TrunesSection;
