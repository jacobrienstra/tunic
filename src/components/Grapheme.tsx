import { css } from "@emotion/react";
import Glyph from "./Glyph";
import {
  GraphemeData,
  setSoundSave,
  toggleGraphemeSureSave,
} from "../redux/reducers/data";
import InlineEdit from "./InlineEdit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  getConsonant,
  getGraphemeSoundGuess,
  getVowel,
  reverseSyllableMask,
} from "../glyph";

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

const iconStyle = css`
  align-self: end;
  color: var(--green);
`;

const soundGuess = css`
  color: var(--cyan-600);
  text-align: center;
`;

function Grapheme({ glyph }: GraphemeProps) {
  const graphemes = useAppSelector((state) => state.data.graphemes.entities);
  const dispatch = useAppDispatch();
  return (
    <div css={graphemeWrapper}>
      {glyph.sure ? (
        <CheckCircleIcon
          css={iconStyle}
          onClick={(event: React.MouseEvent) => {
            event.stopPropagation();
            dispatch(toggleGraphemeSureSave({ id: glyph.id }));
          }}
        />
      ) : (
        <CircleOutlinedIcon
          css={iconStyle}
          onClick={(event: React.MouseEvent) => {
            event.stopPropagation();
            dispatch(toggleGraphemeSureSave({ id: glyph.id }));
          }}
        />
      )}
      <div css={glyphWrapper}>
        <Glyph val={glyph.id} />
      </div>
      <div css={soundGuess}>{getGraphemeSoundGuess(glyph.id, graphemes)}</div>
      <InlineEdit
        value={glyph.sound}
        setValue={(val: string) =>
          dispatch(setSoundSave({ id: glyph.id, sound: val }))
        }
      />
    </div>
  );
}

export default Grapheme;
