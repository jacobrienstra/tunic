import { css } from "@emotion/react";
import Glyph from "./Glyph";
import { GraphemeData, setSound } from "../redux/reducers/data";
import InlineEdit from "./InlineEdit";
import { useDispatch } from "react-redux";

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

function Grapheme({ glyph }: GraphemeProps) {
  const dispatch = useDispatch();
  return (
    <div css={graphemeWrapper}>
      <div css={glyphWrapper}>
        <Glyph val={glyph.id} />
      </div>
      <InlineEdit
        value={glyph.sound}
        setValue={(val: string) =>
          dispatch(setSound({ id: glyph.id, sound: val }))
        }
      />
    </div>
  );
}

export default Grapheme;
