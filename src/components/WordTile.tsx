import TrunicWord from "./TrunicWord";

import type { WordWithTruneIds } from "@/data/store";
import { updateWordMeaning } from "@/data/mutations";
import { Tile, TileTrunic, TileInput } from "@/components/ui/tile";
import type { TileProps } from "@/components/ui/tile";
import { InputInline } from "@/components/ui/input-inline";

function WordTile({
  word,
  active,
  toggleFn,
  hidden,
}: {
  word: WordWithTruneIds;
} & Omit<TileProps<string>, "val"> &
  React.ComponentProps<"div">) {
  return (
    <Tile
      key={word.id}
      active={active}
      toggleFn={toggleFn}
      val={word.id}
      hidden={hidden}
    >
      <TileTrunic>
        <TrunicWord wordTrunes={word.truneIds} withMeaning />
      </TileTrunic>
      <TileInput>
        <InputInline
          defaultValue={word.meaning ?? ""}
          key={word.meaning ?? ""}
          onBlur={(e) => {
            updateWordMeaning(word.id, e.target.value);
          }}
          onKeyDown={(e) => {
            if ((e.key === "Enter" && !e.shiftKey) || e.key === "Escape")
              e.currentTarget.blur();
          }}
        />
      </TileInput>
    </Tile>
  );
}

export default WordTile;
