import { useSelectionStore } from "../data/selection";
import { useFilteredWords } from "../data/filters";
import WordRow from "../components/WordRow";
import Tile from "../components/Tile";

import Section from "./Section";

function WordsSection() {
  const selectedWord = useSelectionStore((s) => s.selectedWord);
  const toggleSelectedWord = useSelectionStore((s) => s.toggleSelectedWord);
  const filteredWords = useFilteredWords();
  return (
    <Section title="Words">
      {/* <div className="my-1 flex flex-[0_0_auto] flex-row flex-wrap content-center items-center justify-start [&_button]:mb-0.5 [&_button]:ml-0.5 [&_button]:text-base">
        <button
          className={clsx(wordFilterDirection === "left" && "active")}
          onClick={() => setWordFilterDirection("left")}
        >
          <KeyboardDoubleArrowUpIcon />
        </button>
        <button
          className={clsx(wordFilterDirection === "off" && "active")}
          onClick={() => setWordFilterDirection("off")}
        >
          Off
        </button>
        <button
          className={clsx(wordFilterDirection === "right" && "active")}
          onClick={() => setWordFilterDirection("right")}
        >
          <KeyboardDoubleArrowDownIcon />
        </button>
      </div> */}
      <div className="mt-2 flex flex-[1_0_100%] flex-row overflow-x-scroll p-2">
        {filteredWords.map((w, i) => (
          <Tile
            align="start"
            key={[w.id, i].join("_")}
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
