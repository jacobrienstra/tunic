import type { Trune } from "@/data/store";
import { updateTrune } from "@/data/mutations";
import { Tile, TileTrunic, TileInput } from "@/components/ui/tile";
import type { TileProps } from "@/components/ui/tile";
import { InputInline } from "@/components/ui/input-inline";
import { Glyph } from "@/components/Glyph";

function TruneTile({
  trune,
  active,
  toggleFn,
  hidden,
}: {
  trune: Trune;
} & Omit<TileProps<number>, "val"> &
  React.ComponentProps<"div">) {
  return (
    <Tile
      key={trune.id}
      active={active}
      toggleFn={toggleFn}
      val={trune.id}
      hidden={hidden}
    >
      <TileTrunic>
        <Glyph val={trune.id} withMeaning />
      </TileTrunic>
      <TileInput>
        <InputInline
          defaultValue={trune.meaning ?? ""}
          key={trune.meaning ?? ""}
          onBlur={(e) => {
            updateTrune(trune.id, { meaning: e.target.value });
          }}
        />
      </TileInput>
    </Tile>
  );
}

export default TruneTile;
