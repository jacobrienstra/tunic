import { ArrowBigDown, Ban, ArrowBigUp } from "lucide-react";
import { isEqual } from "lodash";
import { useLiveQuery } from "@tanstack/react-db";

import { NGRAM_COLLECTIONS, truneIdsFromWordKey } from "@/data/store";
import { useSelectionStore } from "@/data/selectionStore";
import { useDerivedMeaning } from "@/data/ruleset";
import { useFilteredNGrams } from "@/data/filtered";
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
} from "@/components/ui/section";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import TrunicWord from "@/components/TrunicWord";

function NGrams() {
  const selectedNGram = useSelectionStore((s) => s.selectedNGram);
  const toggleSelectedNGram = useSelectionStore((s) => s.toggleSelectedNGram);
  const n = useSelectionStore((s) => s.n);
  const filteredNGrams = useFilteredNGrams();
  const allNGrams = useLiveQuery(NGRAM_COLLECTIONS[n]);
  const derivedMeaning = useDerivedMeaning();
  const truneFilterDirection = useSelectionStore((s) => s.truneFilterDirection);
  const setTruneFilterDirection = useSelectionStore(
    (s) => s.setTruneFilterDirection
  );
  const selectedTrune = useSelectionStore((s) => s.selectedTrune);
  const toggleSelectedTrune = useSelectionStore((s) => s.toggleSelectedTrune);

  return (
    <Section>
      <SectionControls>
        <SectionTitle>Words</SectionTitle>
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
        {allNGrams.data.map((ng) => (
          <Tile
            key={ng.ngKey}
            active={isEqual(selectedNGram, ng)}
            toggleFn={toggleSelectedNGram}
            val={ng.ngKey}
            hidden={!filteredNGrams.collection.has(ng.ngKey)}
          >
            <TrunicWord wordTrunes={truneIdsFromWordKey(ng.ngKey)} />
            <div className="text-cyan-600">
              {truneIdsFromWordKey(ng.ngKey)
                .map((val) => {
                  derivedMeaning(val);
                })
                .join("")}
            </div>
          </Tile>
        ))}
      </SectionContent>
    </Section>
  );
}

export default NGrams;
