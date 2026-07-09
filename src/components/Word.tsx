import { memo } from "react";

import { type WordWithTruneIds } from "../data/store";
import { useDerivedMeaning } from "../data/ruleset";
import { updateWordMeaning } from "../data/mutations";

import TrunicWord from "./TrunicWord";
import InlineEdit from "./InlineEdit";

function Word({ id, meaning, truneIds }: WordWithTruneIds) {
  const derivedMeaning = useDerivedMeaning();
  return (
    <div className="flex flex-col items-stretch p-1">
      <TrunicWord wordTrunes={truneIds} />
      <div className="text-cyan-600">
        {truneIds.map((t) => derivedMeaning(t)).join("")}
      </div>
      <InlineEdit
        value={meaning ?? ""}
        setValue={(val: string) => {
          updateWordMeaning(id, val);
        }}
        className="field-sizing-content min-w-min border-b border-cyan-700 text-start text-cyan-900"
      />
    </div>
  );
}

export default memo(Word);
