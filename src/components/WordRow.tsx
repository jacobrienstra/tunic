import { memo } from "react";

import { type WordWithTruneIds } from "../data/store";
import { updateWordMeaning } from "../data/mutations";

import TrunicWord from "./TrunicWord";
import InlineEdit from "./InlineEdit";

function WordRow({ id, meaning, truneIds }: WordWithTruneIds) {
  console.log(truneIds);
  return (
    <div className="flex flex-col items-stretch p-1">
      <TrunicWord wordTrunes={truneIds} />
      <div className="text-cyan-600">
        {/* {word.truneIds.map((t) => derivedMeaning(t.id)).join("")} */}
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

export default memo(WordRow);
