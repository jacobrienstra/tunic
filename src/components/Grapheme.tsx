import { css } from "@emotion/react";
import Glyph from "./Glyph";
import {
  GraphemeData,
  useGetGraphemesQuery,
  useUpdateGraphemeMutation,
} from "../redux/services/data";
import InlineEdit from "./InlineEdit";
import { getGraphemeSoundGuess } from "../glyph";

interface GraphemeProps {
  glyph: GraphemeData;
}

const graphemeWrapper = css`
  max-width: 100%;
  padding: 4px;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  input {
    border-bottom: 1px solid var(--cyan-700);
    color: var(--cyan-900);
  }
`;

const glyphWrapper = css`
  margin: 0px 17%;
  flex: 1 0 auto;
`;

const soundGuess = css`
  color: var(--cyan-600);
  text-align: center;
`;

function Grapheme({ glyph }: GraphemeProps) {
  const [updateGrapheme] = useUpdateGraphemeMutation();
  const { data: graphemes } = useGetGraphemesQuery();
  return (
    <div css={graphemeWrapper}>
      <div css={glyphWrapper}>
        <Glyph val={glyph.id} />
      </div>
      <div css={soundGuess}>{getGraphemeSoundGuess(glyph.id, graphemes)}</div>
      <InlineEdit
        value={glyph.sound ?? ""}
        setValue={(val: string) => updateGrapheme({ id: glyph.id, sound: val })}
      />
    </div>
  );
}

export default Grapheme;
