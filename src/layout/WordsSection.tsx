import { ArrowBigDown, Ban, ArrowBigUp } from "lucide-react";

import { useWords } from "@/data/store";
import { useSelectionStore } from "@/data/selectionStore";
import { useDerivedMeaning } from "@/data/ruleset";
import { updateWordMeaning } from "@/data/mutations";
import { useFilteredWords } from "@/data/filtered";
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
import TrunicWord from "@/components/TrunicWord";

function WordsSection() {
  const derivedMeaning = useDerivedMeaning();
  const selectedWord = useSelectionStore((s) => s.selectedWord);
  const wordFilterDirection = useSelectionStore((s) => s.wordFilterDirection);
  const setWordFilterDirection = useSelectionStore(
    (s) => s.setWordFilterDirection
  );
  const toggleSelectedWord = useSelectionStore((s) => s.toggleSelectedWord);
  const filteredWords = useFilteredWords();
  const allWords = useWords();

  return (
    <Section>
      <SectionMain>
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
              active={wordFilterDirection === "backward"}
              onClick={() => setWordFilterDirection("backward")}
            >
              <ArrowBigUp />
            </Button>
            <Button
              variant="outline"
              size="icon"
              active={wordFilterDirection === "off"}
              onClick={() => setWordFilterDirection("off")}
            >
              <Ban />
            </Button>
            <Button
              variant="outline"
              size="icon"
              active={wordFilterDirection === "forward"}
              onClick={() => setWordFilterDirection("forward")}
            >
              <ArrowBigDown />
            </Button>
          </ButtonGroup>
        </SectionControls>
        <SectionContent>
          <ScrollArea orientation="horizontal" className="h-full py-1">
            <div className={"flex w-max flex-row"}>
              {allWords.data.map((w) => (
                <Tile
                  key={w.id}
                  active={selectedWord === w.id}
                  toggleFn={toggleSelectedWord}
                  val={w.id}
                  hidden={!filteredWords.collection.has(w.id)}
                >
                  <TileTrunic>
                    <TrunicWord wordTrunes={w.truneIds} />
                  </TileTrunic>
                  <TileAnnotation>
                    {w.truneIds.map((t) => derivedMeaning(t)).join("")}
                  </TileAnnotation>
                  <TileInput>
                    <InputInline
                      defaultValue={w.meaning ?? ""}
                      key={w.meaning ?? ""}
                      onBlur={(e) => {
                        updateWordMeaning(w.id, e.target.value);
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

export default WordsSection;
