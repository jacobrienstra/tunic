import { memo } from "react";

import { getGraphemeSoundGuess } from "../glyph";
import { useGraphemes } from "../data/queries";
import { updateWord } from "../data/mutations";
import { Word as WordData } from "../data/db";

import Word from "./Word";
import InlineEdit from "./InlineEdit";

function WordRow({ glyphs, meaning, id }: WordData) {
  const graphemes = useGraphemes();
  return (
    <div className="flex min-w-min flex-col items-stretch p-1">
      <div className="m-0 flex flex-[1_0_auto] flex-row justify-between">
        <Word word={glyphs} />
      </div>
      <div className="text-cyan-600">
        {glyphs
          .map((val) => {
            const ival = parseInt(val);
            let meaning = graphemes?.find((g) => g.id === ival)?.meaning;
            if (meaning === "" || meaning === undefined) {
              meaning = getGraphemeSoundGuess(ival, graphemes);
            }
            return meaning.replace("?", "");
          })
          .join("")}
      </div>
      <InlineEdit
        value={meaning ?? ""}
        setValue={(val: string) => {
          updateWord(id, {
            glyphs: glyphs,
            meaning: val,
          }).catch(console.error);
        }}
        className="w-full min-w-min border-b border-cyan-700 text-start text-cyan-900"
      />
    </div>
  );
}

export default memo(WordRow);
