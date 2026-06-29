import { useMemo } from "react";
import clsx from "clsx";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";

import { useSelectionStore } from "../data/state";
import { useContexts, useWords } from "../data/queries";
import { calcFilteredWords } from "../data/filters";
import WordRow from "../components/WordRow";
import Tile from "../components/Tile";

import Section from "./Section";

function WordsSection() {
  const words = useWords();
  const contexts = useContexts();

  const selectedGrapheme = useSelectionStore((s) => s.selectedGrapheme);
  const selectedNGram = useSelectionStore((s) => s.selectedNGram);
  const selectedContext = useSelectionStore((s) => s.selectedContext);
  const mode = useSelectionStore((s) => s.mode);
  const graphemeFilterDirection = useSelectionStore(
    (s) => s.graphemeFilterDirection
  );
  const contextFilterDirection = useSelectionStore(
    (s) => s.contextFilterDirection
  );
  const selectedWord = useSelectionStore((s) => s.selectedWord);
  const wordFilterDirection = useSelectionStore((s) => s.wordFilterDirection);
  const toggleSelectedWord = useSelectionStore((s) => s.toggleSelectedWord);
  const setWordFilterDirection = useSelectionStore(
    (s) => s.setWordFilterDirection
  );

  const filteredWords = useMemo(
    () =>
      calcFilteredWords(
        {
          selectedGrapheme,
          selectedNGram,
          selectedContext,
          mode,
          graphemeFilterDirection,
          contextFilterDirection,
        },
        words,
        contexts
      ),
    [
      selectedGrapheme,
      selectedNGram,
      selectedContext,
      mode,
      graphemeFilterDirection,
      contextFilterDirection,
      words,
      contexts,
    ]
  );

  return (
    <Section title="Words">
      <div className="my-1 flex flex-[0_0_auto] flex-row flex-wrap content-center items-center justify-center [&_button]:mb-0.5 [&_button]:ml-0.5 [&_button]:text-base">
        <button
          className={clsx(wordFilterDirection === "left" && "active")}
          onClick={() => setWordFilterDirection("left")}
        >
          <KeyboardDoubleArrowLeftIcon />
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
          <KeyboardDoubleArrowRightIcon />
        </button>
      </div>
      <div className="mt-2 grid w-full flex-[0_1_auto] auto-rows-min grid-cols-[repeat(auto-fit,minmax(100px,1fr))] overflow-y-scroll p-2">
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
