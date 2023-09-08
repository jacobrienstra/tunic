import { css } from "@emotion/react";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { cx } from "@emotion/css";
import {
  selectExclusive,
  selectLeftLineFilter,
  selectPartial,
  setLeftLineFilter,
  toggleExclusive,
  togglePartialFilter,
} from "../redux/reducers/selection";
import { RootState } from "../redux/store";
import { useAppDispatch, useAppSelector } from "../redux/hooks";

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
  const dispatch = useAppDispatch();
  const leftLineFilter = useAppSelector(selectLeftLineFilter);
  const partial = useAppSelector(selectPartial);
  const exclusive = useAppSelector(selectExclusive);

  return (
    <div css={filterToggles}>
      <h4>Filter By</h4>
      <div css={filterOption}>
        <span>Left Line Present?</span>
        <button
          className={cx({ active: leftLineFilter === "present" })}
          onClick={() => dispatch(setLeftLineFilter("present"))}
        >
          Yes
          {leftLineFilter === "present" ? (
            <CheckBoxIcon fontSize="small" />
          ) : (
            <CheckBoxOutlineBlankIcon fontSize="small" />
          )}
        </button>
        <button
          className={cx({ active: leftLineFilter === "absent" })}
          onClick={() => dispatch(setLeftLineFilter("absent"))}
        >
          No
          {leftLineFilter === "absent" ? (
            <CheckBoxIcon fontSize="small" />
          ) : (
            <CheckBoxOutlineBlankIcon fontSize="small" />
          )}
        </button>
        <button
          className={cx({ active: leftLineFilter === "either" })}
          onClick={() => dispatch(setLeftLineFilter("either"))}
        >
          Either
          {leftLineFilter === "either" ? (
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
            onClick={() => dispatch(togglePartialFilter())}
          />
        ) : (
          <CheckBoxOutlineBlankIcon
            fontSize="large"
            css={toggleBox}
            onClick={() => dispatch(togglePartialFilter())}
          />
        )}
      </div>
      <div css={filterOption}>
        <span>Logical Operator</span>
        <button onClick={() => dispatch(toggleExclusive())}>
          {exclusive ? <strong>AND</strong> : <strong>OR</strong>}
        </button>
      </div>
    </div>
  );
}

export default FilterOptions;
