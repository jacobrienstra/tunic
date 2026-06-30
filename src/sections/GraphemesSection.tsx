import clsx from "clsx";

// import { useSelectionStore } from "../data/selection";
import { useDerivedMeaning } from "../data/ruleset";
import { useGlyphSubsets } from "../data/queries";
import { useDerivedGraphemes } from "../data/filters";
import Tile from "../components/Tile";
import Glyph from "../components/Glyph";

import Section from "./Section";

const tileSize = 35;

const glyphsGrid =
  "grid flex-[1_1_auto] auto-rows-min gap-0 overflow-y-scroll p-2";
const gridTemplate = {
  gridTemplateColumns: `repeat(auto-fit, minmax(${tileSize}px, 1fr))`,
};

function Filters() {
  // const graphemesFilterDirection = useSelectionStore(
  //   (s) => s.graphemesFilterDirection
  // );
  const derivedGraphemes = useDerivedGraphemes();
  const glyphSubsets = useGlyphSubsets();
  const derivedMeaning = useDerivedMeaning();

  return (
    <Section
      title="Graphemes"
      className="flex flex-[1_0_50%] flex-col items-stretch border-b-4 border-slate-500 px-2 [&_span]:select-none [&_strong]:select-none"
    >
      {/* <div className="my-1 flex flex-row flex-wrap content-center items-center justify-start [&_button]:mx-1 [&_button]:mb-0.5 [&_button]:text-base">
        <button
          className={clsx(glyphFilterDirection === "off" && "active")}
          onClick={() => setGlyphFilterDirection("off")}
        >
          Off
        </button>
        <button
          className={clsx(glyphFilterDirection === "right" && "active")}
          onClick={() => setGlyphFilterDirection("right")}
        >
          <KeyboardDoubleArrowDownIcon />
        </button>
        <FilterOptions />
      </div> */}
      <div className="flex flex-[1_1_auto] flex-row items-stretch">
        {[...derivedGraphemes].map(([id, graphemes]) => (
          <div className="flex flex-col items-stretch" key={id}>
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
                  key={g.id}
                  active={false}
                  toggleFn={() => {
                    return;
                  }}
                  val={g.id}
                >
                  <Glyph val={g.id} />
                  <div className="text-center text-cyan-600">
                    {derivedMeaning(g.id)}
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

export default Filters;
