import { memo } from "react";

import { getGraphemeSoundGuess } from "../glyph";
import { useGraphemes } from "../data/queries";
import { updateGrapheme } from "../data/mutations";
import { Grapheme as GraphemeShape } from "../data/db";

import InlineEdit from "./InlineEdit";
import Glyph from "./Glyph";

function Grapheme({ id, meaning }: GraphemeShape) {
  const graphemes = useGraphemes();
  return (
    <div className="flex max-w-full flex-col items-stretch p-1">
      <div className="mx-[17%] flex-[1_0_auto]">
        <Glyph val={id} />
      </div>
      <div className="text-center text-cyan-600">
        {getGraphemeSoundGuess(id, graphemes)}
      </div>
      <InlineEdit
        value={meaning ?? ""}
        setValue={(val: string) => {
          updateGrapheme(id, { meaning: val }).catch(console.error);
        }}
        className="border-b border-cyan-700 text-cyan-900"
      />
    </div>
  );
}

export default memo(Grapheme);
