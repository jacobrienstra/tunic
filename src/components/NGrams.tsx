import { css } from "@emotion/react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import Glyph from "./Glyph";

const ngramsColumn = css`
  display: flex;
  flex-direction: column;
  align-items: start;
  flex: 0 1 50%;
  height: 100%;
  padding-left: 8px;
`;

const ngramsWrapper = css`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(30px, 1fr));
  grid-auto-rows: min-content;
  grid-gap: 4px;
  height: 100%;
`;

function NGrams() {
  const ngrams = useSelector((state: RootState) => {
    return state.data.graphemes.map((g) => g.id);
  });

  return (
    <section css={ngramsColumn}>
      <h4>NGrams</h4>
      <div css={ngramsWrapper}>
        {ngrams.map((n) => (
          <Glyph val={n} key={n} />
        ))}
      </div>
    </section>
  );
}

export default NGrams;
