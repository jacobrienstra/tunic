import { useWords } from "../data/store";
import { useSelectionStore } from "../data/selectionStore";
import { useFilteredWords } from "../data/filtered";
import Word from "../components/Word";
import Tile from "../components/Tile";

import Section from "./Section";

function WordsSection() {
  const selectedWord = useSelectionStore((s) => s.selectedWord);
  const toggleSelectedWord = useSelectionStore((s) => s.toggleSelectedWord);
  const filteredWords = useFilteredWords();
  const allWords = useWords();
  console.log(allWords.data, filteredWords.collection);

  return (
    <Section title="Words" className="flex-none">
      <div className="mt-2 flex flex-[1_0_100%] flex-row overflow-x-scroll p-2">
        {allWords.data.map((w) => (
          <Tile
            align="start"
            key={w.id}
            active={selectedWord === w.id}
            toggleFn={toggleSelectedWord}
            val={w.id}
            hidden={!filteredWords.collection.has(w.id)}
          >
            <Word {...w} />
          </Tile>
        ))}
      </div>
    </Section>
  );
}

export default WordsSection;
