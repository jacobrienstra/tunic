import clsx from "clsx";

import { useGlyphSubsets } from "../data/store";
// import { useSelectionStore } from "../data/selectionStore";
import { useDerivedGraphemeIds } from "../data/filters";
import Tile from "../components/Tile";
import Glyph from "../components/Glyph";

import Section from "./Section";

const tileSize = 35;

const glyphsGrid =
  "grid flex-[1_1_auto] auto-rows-min gap-0 overflow-y-scroll p-2";
const gridTemplate = {
  gridTemplateColumns: `repeat(auto-fit, minmax(${tileSize}px, 1fr))`,
};

function GraphemesSection() {
  // const graphemesFilterDirection = useSelectionStore(
  //   (s) => s.graphemesFilterDirection
  // );
  const derivedGraphemeIds = useDerivedGraphemeIds();
  const { data: glyphSubsets } = useGlyphSubsets();

  return (
    <Section
      title="Graphemes"
      className="flex flex-none flex-col border-b-4 border-slate-500 px-2"
    >
      <div className="flex w-full flex-[1_0_100%] flex-row items-stretch">
        {[...derivedGraphemeIds].map(([id, graphemes]) => (
          <div className="flex flex-grow flex-col items-stretch" key={id}>
            <h4 className="w-full flex-[0_0_auto] text-center">
              {glyphSubsets?.find((s) => s.id === id)?.name}
            </h4>
            <div
              className={clsx(glyphsGrid, "border-r-2 border-slate-500")}
              style={gridTemplate}
            >
              {graphemes.map((g) => (
                <Tile
                  size={tileSize}
                  key={g}
                  active={false}
                  toggleFn={() => {
                    return;
                  }}
                  val={g}
                >
                  <Glyph val={g} />
                  <div className="text-center text-cyan-600">
                    {/* {derivedMeaning(g)} */}
                  </div>
                </Tile>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default GraphemesSection;
