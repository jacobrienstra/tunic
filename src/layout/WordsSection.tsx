import { ArrowBigDown, Ban, ArrowBigUp } from "lucide-react";

import { useWords } from "@/data/store";
import { useSelectionStore } from "@/data/selectionStore";
import { useFilteredWords } from "@/data/filtered";
import WordTile from "@/components/WordTile";
import {
  Section,
  SectionTitle,
  SectionControls,
  SectionContent,
  SectionMain,
} from "@/components/ui/section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";

function WordsSection() {
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
            orientation="horizontal"
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
                <WordTile
                  word={w}
                  key={w.id}
                  active={selectedWord === w.id}
                  toggleFn={toggleSelectedWord}
                  hidden={!filteredWords.collection.has(w.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </SectionContent>
      </SectionMain>
    </Section>
  );
}

export default WordsSection;
