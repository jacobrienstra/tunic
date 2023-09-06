import { css } from "@emotion/react";
import Glyph from "./Glyph";
import {
  GraphemeData,
  setSoundSave,
  toggleGraphemeSureSave,
} from "../redux/reducers/data";
import InlineEdit from "./InlineEdit";
import store from "../redux/store";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";

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

function Grapheme({ glyph }: GraphemeProps) {
  return (
    <div css={graphemeWrapper}>
      {glyph.sure ? (
        <CheckCircleIcon
          css={iconStyle}
          onClick={(event: React.MouseEvent) => {
            event.stopPropagation();
            store.dispatch(toggleGraphemeSureSave({ id: glyph.id }));
          }}
        />
      ) : (
        <CircleOutlinedIcon
          css={iconStyle}
          onClick={(event: React.MouseEvent) => {
            event.stopPropagation();
            store.dispatch(toggleGraphemeSureSave({ id: glyph.id }));
          }}
        />
      )}
      <div css={glyphWrapper}>
        <Glyph val={glyph.id} />
      </div>
      <InlineEdit
        value={glyph.sound}
        setValue={(val: string) =>
          store.dispatch(setSoundSave({ id: glyph.id, sound: val }))
        }
      />
    </div>
  );
}

export default Grapheme;
