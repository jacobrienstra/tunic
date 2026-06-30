import { useMemo } from "react";
import clsx from "clsx";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";

import { getGraphemeSoundGuess } from "../glyph";
import { useSelectionStore } from "../data/state";
import { useTrunes } from "../data/queries";
import { calcConsonantGraphemes, calcVowelGraphemes } from "../data/filters";
import Tile from "../components/Tile";
import Glyph from "../components/Glyph";

import Section from "./Section";
import FilterOptions from "./FilterOptions";

const tileSize = 35;

const glyphsGrid =
  "grid flex-[1_1_auto] auto-rows-min gap-0 overflow-y-scroll p-2";
const gridTemplate = {
  gridTemplateColumns: `repeat(auto-fit, minmax(${tileSize}px, 1fr))`,
};

function Filters() {
  const trunes = useTrunes();

  const vowelFilter = useSelectionStore((s) => s.vowelFilter);
  const consonantFilter = useSelectionStore((s) => s.consonantFilter);
  const glyphFilterDirection = useSelectionStore((s) => s.glyphFilterDirection);
  const truneFilterDirection = useSelectionStore((s) => s.truneFilterDirection);
  const selectedTrune = useSelectionStore((s) => s.selectedTrune);
  const selectedNGram = useSelectionStore((s) => s.selectedNGram);
  const partial = useSelectionStore((s) => s.partial);
  const mode = useSelectionStore((s) => s.mode);
  const setGlyphFilterDirection = useSelectionStore(
    (s) => s.setGlyphFilterDirection
  );
  const toggleVowelFilter = useSelectionStore((s) => s.toggleVowelFilter);
  const toggleConsonantFilter = useSelectionStore(
    (s) => s.toggleConsonantFilter
  );

  const vowelGlyphs = useMemo(
    () =>
      calcVowelGraphemes(
        {
          truneFilterDirection,
          selectedTrune,
          selectedNGram,
          partial,
          mode,
        },
        trunes
      ),
    [truneFilterDirection, selectedTrune, selectedNGram, partial, mode, trunes]
  );
  const consonantGlyphs = useMemo(
    () =>
      calcConsonantGraphemes(
        {
          truneFilterDirection,
          selectedTrune,
          selectedNGram,
          partial,
          mode,
        },
        trunes
      ),
    [truneFilterDirection, selectedTrune, selectedNGram, partial, mode, trunes]
  );

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
        <div className="flex flex-[1_0_50%] flex-col items-stretch">
          <h4 className="w-full flex-[0_0_auto] text-center">Vowels</h4>
          <div
            className={clsx(glyphsGrid, "border-r-2 border-slate-500")}
            style={gridTemplate}
          >
            {vowelGlyphs.map((val) => (
              <Tile
                size={tileSize}
                key={val}
                active={vowelFilter === val}
                toggleFn={toggleVowelFilter}
                val={val}
              >
                <Glyph val={val} />
                <div className="text-center text-cyan-600">
                  {getGraphemeSoundGuess(val, trunes)}
                </div>
              </Tile>
            ))}
          </div>
        </div>
        <div className="flex flex-[1_0_50%] flex-col items-stretch">
          <h4 className="w-full flex-[0_0_auto] text-center">Consonants</h4>
          <div className={glyphsGrid} style={gridTemplate}>
            {consonantGlyphs.map((val) => (
              <Tile
                size={tileSize}
                key={val}
                active={consonantFilter === val}
                toggleFn={toggleConsonantFilter}
                val={val}
              >
                <Glyph val={val} />
                <div className="text-center text-cyan-600">
                  {getGraphemeSoundGuess(val, trunes)}
                </div>
              </Tile>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

export default Filters;
