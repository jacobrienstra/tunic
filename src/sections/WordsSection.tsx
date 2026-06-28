import { useMemo } from "react";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import { css } from "@emotion/react";
import { cx } from "@emotion/css";

import { useSelectionStore } from "../data/state";
import { useContexts, useWords } from "../data/queries";
import { calcFilteredWords } from "../data/filters";
import WordRow from "../components/WordRow";
import Tile from "../components/Tile";

import Section from "./Section";

const wordsGrid = css`
  padding: 8px;
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  grid-auto-rows: min-content;
  flex: 0 1 auto;
  width: 100%;
  overflow-y: scroll;
`;

const filterDirectionSection = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  align-content: center;
  flex-wrap: wrap;
  flex: 0 0 auto;
  margin: 4px 0;

  button {
    font-size: 16px;
    margin: 0 0 2px 2px;
  }
`;

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
      <div css={filterDirectionSection}>
        <button
          className={cx({ active: wordFilterDirection === "left" })}
          onClick={() => setWordFilterDirection("left")}
        >
          <KeyboardDoubleArrowLeftIcon />
        </button>
        <button
          className={cx({ active: wordFilterDirection === "off" })}
          onClick={() => setWordFilterDirection("off")}
        >
          Off
        </button>
        <button
          className={cx({ active: wordFilterDirection === "right" })}
          onClick={() => setWordFilterDirection("right")}
        >
          <KeyboardDoubleArrowRightIcon />
        </button>
      </div>
      <div css={wordsGrid}>
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
