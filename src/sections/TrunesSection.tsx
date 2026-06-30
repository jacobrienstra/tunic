import clsx from "clsx";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";

import { useSelectionStore } from "../data/state";

import Trunes from "./Trunes";
import Section from "./Section";
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

  const tileSize = mode === "trunes" ? 60 : (selectedN + 1) * 20;

  return (
    <Section
      title="Trunes"
      className="flex flex-col items-stretch border-b-4 px-2 [&_span]:select-none"
    >
      {/* <div className="my-1 flex flex-row flex-wrap content-center items-center justify-start [&_button]:mx-0.5 [&_button]:mb-0.5 [&_button]:text-base">
        <button
          className={clsx(graphemeFilterDirection === "left" && "active")}
          onClick={() => setGraphemeFilterDirection("left")}
        >
          <KeyboardDoubleArrowUpIcon />
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
          <KeyboardDoubleArrowDownIcon />
        </button>
      </div> */}
      <div className="flex flex-row p-2">
        <button
          className={clsx(mode === "trunes" && "active")}
          onClick={() => {
            setMode("trunes");
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
        <div className="flex flex-row flex-wrap content-start items-center [&_button]:m-0.5">
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
      <div className="mt-2 flex flex-row overflow-x-scroll p-1">
        {mode === "trunes" ? (
          <Trunes tileSize={tileSize} />
        ) : (
          <NGrams tileSize={tileSize} />
        )}
      </div>
    </Section>
  );
}

export default TrunesSection;
