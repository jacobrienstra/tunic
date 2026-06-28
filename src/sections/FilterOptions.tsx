import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { css } from "@emotion/react";
import { cx } from "@emotion/css";

import { useSelectionStore } from "../data/state";

const filterToggles = css`
  display: flex;
  flex-direction: column;
  align-items: start;
  flex: 0 0 auto;
  font-size: 12px;
`;

const filterOption = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  flex-wrap: wrap;
  flex: 1 0 auto;

  button {
    margin: 0 0 2px 2px;
  }
`;

const toggleBox = css`
  cursor: pointer;
  padding: 4px;
`;

function FilterOptions() {
  const reverseSyllableFilter = useSelectionStore(
    (s) => s.reverseSyllableFilter
  );
  const partial = useSelectionStore((s) => s.partial);
  const exclusive = useSelectionStore((s) => s.exclusive);
  const setReverseSyllableFilter = useSelectionStore(
    (s) => s.setReverseSyllableFilter
  );
  const togglePartialFilter = useSelectionStore((s) => s.togglePartialFilter);
  const toggleExclusive = useSelectionStore((s) => s.toggleExclusive);

  return (
    <div css={filterToggles}>
      <h4>Filter By</h4>
      <div css={filterOption}>
        <span>Syllabled Reversed?</span>
        <button
          className={cx({ active: reverseSyllableFilter === "present" })}
          onClick={() => setReverseSyllableFilter("present")}
        >
          Yes
          {reverseSyllableFilter === "present" ? (
            <CheckBoxIcon fontSize="small" />
          ) : (
            <CheckBoxOutlineBlankIcon fontSize="small" />
          )}
        </button>
        <button
          className={cx({ active: reverseSyllableFilter === "absent" })}
          onClick={() => setReverseSyllableFilter("absent")}
        >
          No
          {reverseSyllableFilter === "absent" ? (
            <CheckBoxIcon fontSize="small" />
          ) : (
            <CheckBoxOutlineBlankIcon fontSize="small" />
          )}
        </button>
        <button
          className={cx({ active: reverseSyllableFilter === "either" })}
          onClick={() => setReverseSyllableFilter("either")}
        >
          Either
          {reverseSyllableFilter === "either" ? (
            <CheckBoxIcon fontSize="small" />
          ) : (
            <CheckBoxOutlineBlankIcon fontSize="small" />
          )}
        </button>
      </div>
      <div css={filterOption}>
        <span>Partial Match</span>
        {partial ? (
          <CheckBoxIcon
            fontSize="large"
            css={toggleBox}
            onClick={togglePartialFilter}
          />
        ) : (
          <CheckBoxOutlineBlankIcon
            fontSize="large"
            css={toggleBox}
            onClick={togglePartialFilter}
          />
        )}
      </div>
      <div css={filterOption}>
        <span>Logical Operator</span>
        <button onClick={toggleExclusive}>
          {exclusive ? <strong>AND</strong> : <strong>OR</strong>}
        </button>
      </div>
    </div>
  );
}

export default FilterOptions;
