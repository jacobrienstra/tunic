import { memo } from "react";

import { type Trune as TruneShape } from "../data/store";
import { updateTrune } from "../data/mutations";

import InlineEdit from "./InlineEdit";
import Glyph from "./Glyph";

function Trune({ id, meaning, derived }: TruneShape) {
  return (
    <div className="flex max-w-full flex-col items-stretch p-1">
      <div className="mx-[17%] flex-[1_0_auto]">
        <Glyph val={id} />
      </div>
      <div className="text-center text-cyan-600">{}</div>
      <InlineEdit
        value={meaning ?? ""}
        setValue={(val: string) => {
          updateTrune(id, { meaning: val });
        }}
        className="border-b border-cyan-700 text-cyan-900"
      />
    </div>
  );
}

export default memo(Trune);
