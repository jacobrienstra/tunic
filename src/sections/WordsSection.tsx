import { useSelectionStore } from "../data/selectionStore";
import { useFilteredWords } from "../data/filters";
import WordRow from "../components/WordRow";
import Tile from "../components/Tile";

import Section from "./Section";

function WordsSection() {
  const selectedWord = useSelectionStore((s) => s.selectedWord);
  const toggleSelectedWord = useSelectionStore((s) => s.toggleSelectedWord);
  const filteredWords = useFilteredWords();
  return (
    <Section title="Words" className="flex-none">
      <div className="mt-2 flex flex-[1_0_100%] flex-row overflow-x-scroll p-2">
        {filteredWords.map((w) => (
          <Tile
            align="start"
            key={w.id}
            active={selectedWord === w.id}
            toggleFn={toggleSelectedWord}
            val={w.id}
          >
            <WordRow {...w} />
          </Tile>
        ))}
      </div>
    </Section>
  );
}

export default WordsSection;
