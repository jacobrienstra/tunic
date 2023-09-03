import { css } from "@emotion/react";
import Section from "./Section";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import Tile from "./Tile";
import WordRow from "./WordRow";

const wordsGrid = css`
  padding: 8px;
  margin-top: 8px;
  display: grid;
  grid-template-columns: min-content;
  grid-auto-rows: min-content;
  flex: 0 1 auto;
  width: min-content;
`;

function WordsSection() {
  const dispatch = useDispatch();
  const words = useSelector((state: RootState) => state.data.words);

  return (
    <Section title="Words" style={{ flex: "0 1 auto" }}>
      <div css={wordsGrid}>
        {words.map((w) => (
          <Tile align="start" key={w.word.toString()}>
            <WordRow wordData={w} />
          </Tile>
        ))}
      </div>
    </Section>
  );
}

export default WordsSection;
