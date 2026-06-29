import clsx from "clsx";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";

import { useSelectionStore } from "../data/state";

import Trunes from "./Trunes";
import NGrams from "./NGrams";

function TrunesSection() {
  const selectedN = useSelectionStore((s) => s.n);
  const mode = useSelectionStore((s) => s.mode);
  const graphemeFilterDirection = useSelectionStore(
    (s) => s.graphemeFilterDirection
  );
  const setGraphemeFilterDirection = useSelectionStore(
    (s) => s.setGraphemeFilterDirection
  );
  const setMode = useSelectionStore((s) => s.setMode);
  const setN = useSelectionStore((s) => s.setN);

  const tileSize = mode === "graphemes" ? 60 : (selectedN + 1) * 20;

  return (
    <section className="flex w-min flex-[1_1_50%] flex-col items-stretch px-2 [&_span]:select-none">
      <div className="my-1 flex flex-[0_0_auto] flex-row flex-wrap content-center items-center justify-center [&_button]:mb-0.5 [&_button]:ml-0.5 [&_button]:text-base">
        <button
          className={clsx(graphemeFilterDirection === "left" && "active")}
          onClick={() => setGraphemeFilterDirection("left")}
        >
          <KeyboardDoubleArrowLeftIcon />
        </button>
        <button
          className={clsx(graphemeFilterDirection === "off" && "active")}
          onClick={() => setGraphemeFilterDirection("off")}
        >
          Off
        </button>
        <button
          className={clsx(graphemeFilterDirection === "right" && "active")}
          onClick={() => setGraphemeFilterDirection("right")}
        >
          <KeyboardDoubleArrowRightIcon />
        </button>
      </div>
      <div className="flex flex-[0_0_auto] flex-row p-2 text-xs [&_button:not(:last-child)]:mr-2">
        <button
          className={clsx(mode === "graphemes" && "active")}
          onClick={() => {
            setMode("graphemes");
          }}
        >
          Trunes
        </button>
        <button
          className={clsx(mode === "ngrams" && "active")}
          onClick={() => {
            setMode("ngrams");
          }}
        >
          NGrams
        </button>
      </div>
      {mode === "ngrams" ? (
        <div className="flex flex-[0_0_auto] flex-row flex-wrap content-start items-center [&_button]:m-0.5">
          <span>Size (n)</span>
          {[2, 3, 4].map((num) => {
            return (
              <button
                className={clsx(selectedN === num && "active")}
                key={num}
                onClick={() => setN(num)}
              >
                {num}
              </button>
            );
          })}
        </div>
      ) : null}
      <div
        className="mt-2 grid flex-[0_1_auto] auto-rows-min overflow-y-scroll p-1"
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(${tileSize}px, 1fr))`,
        }}
      >
        {mode === "graphemes" ? (
          <Trunes tileSize={tileSize} />
        ) : (
          <NGrams tileSize={tileSize} />
        )}
      </div>
    </section>
  );
}

export default TrunesSection;
