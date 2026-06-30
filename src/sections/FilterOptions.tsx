import clsx from "clsx";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

import { useSelectionStore } from "../data/state";

const filterOption =
  "flex flex-[1_0_auto] flex-row flex-wrap content-center items-center [&_button]:mb-0.5 [&_button]:ml-0.5";

const toggleBox = "cursor-pointer p-1";

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
    <div className="flex flex-row items-center gap-4 text-xs">
      <h2>Filter By: </h2>
      <div className={filterOption}>
        <span>Syllabled Reversed?</span>
        <button
          className={clsx(reverseSyllableFilter === "present" && "active")}
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
          className={clsx(reverseSyllableFilter === "absent" && "active")}
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
          className={clsx(reverseSyllableFilter === "either" && "active")}
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
      <div className={filterOption}>
        <span>Partial Match</span>
        {partial ? (
          <CheckBoxIcon
            fontSize="large"
            className={toggleBox}
            onClick={togglePartialFilter}
          />
        ) : (
          <CheckBoxOutlineBlankIcon
            fontSize="large"
            className={toggleBox}
            onClick={togglePartialFilter}
          />
        )}
      </div>
      <div className={filterOption}>
        <span>Logical Operator</span>
        <button onClick={toggleExclusive}>
          {exclusive ? <strong>AND</strong> : <strong>OR</strong>}
        </button>
      </div>
    </div>
  );
}

export default FilterOptions;
