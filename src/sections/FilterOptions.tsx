import { css } from "@emotion/react";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { cx } from "@emotion/css";
import {
  setLeftLineFilter,
  toggleExclusive,
  togglePartialFilter,
} from "../redux/reducers/selection";
import { RootState } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";

const filterToggles = css`
  display: flex;
  flex-direction: column;
  align-items: start;
  flex: 0 0 auto;
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
  const dispatch = useDispatch();
  const leftLineFilter = useSelector(
    (state: RootState) => state.selection.filterLeftLine
  );
  const partial = useSelector((state: RootState) => state.selection.partial);
  const exclusive = useSelector(
    (state: RootState) => state.selection.exclusive
  );

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
            <CheckBoxIcon />
          ) : (
            <CheckBoxOutlineBlankIcon />
          )}
        </button>
        <button
          className={cx({ active: leftLineFilter === "absent" })}
          onClick={() => dispatch(setLeftLineFilter("absent"))}
        >
          No
          {leftLineFilter === "absent" ? (
            <CheckBoxIcon />
          ) : (
            <CheckBoxOutlineBlankIcon />
          )}
        </button>
        <button
          className={cx({ active: leftLineFilter === "either" })}
          onClick={() => dispatch(setLeftLineFilter("either"))}
        >
          Either
          {leftLineFilter === "either" ? (
            <CheckBoxIcon />
          ) : (
            <CheckBoxOutlineBlankIcon />
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
        {exclusive ? (
          <>
            <CheckBoxIcon
              fontSize="large"
              css={toggleBox}
              onClick={() => dispatch(toggleExclusive())}
            />{" "}
            <strong>AND</strong>
          </>
        ) : (
          <>
            <CheckBoxOutlineBlankIcon
              fontSize="large"
              css={toggleBox}
              onClick={() => dispatch(toggleExclusive())}
            />
            <strong>OR</strong>
          </>
        )}
      </div>
    </div>
  );
}

export default FilterOptions;
