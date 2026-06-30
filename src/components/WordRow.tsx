import { memo } from "react";

import { useDerivedMeaning } from "../data/ruleset";
import { updateWord } from "../data/mutations";
import { Word as WordData } from "../data/db";

import TrunicWord from "./TrunicWord";
import InlineEdit from "./InlineEdit";

function WordRow({ truneIds, meaning, id }: WordData) {
  const derivedMeaning = useDerivedMeaning();
  return (
    <div className="flex flex-col items-stretch p-1">
      <TrunicWord wordTrunes={truneIds} />
      <div className="text-cyan-600">
        {truneIds.map((val) => derivedMeaning(val)).join("")}
      </div>
      <InlineEdit
        value={meaning ?? ""}
        setValue={(val: string) => {
          updateWord(id, { meaning: val }).catch(console.error);
        }}
        className="field-sizing-content min-w-min border-b border-cyan-700 text-start text-cyan-900"
      />
    </div>
  );
}

export default memo(WordRow);
