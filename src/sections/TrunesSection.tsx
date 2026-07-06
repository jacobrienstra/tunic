import clsx from "clsx";

import { useSelectionStore } from "../data/selectionStore";

import Trunes from "./Trunes";
import Section from "./Section";
import NGrams from "./NGrams";

function TrunesSection() {
  const selectedN = useSelectionStore((s) => s.n);
  const mode = useSelectionStore((s) => s.mode);
  // const truneFilterDirection = useSelectionStore((s) => s.truneFilterDirection);
  // const setTruneFilterDirection = useSelectionStore(
  //   (s) => s.setTruneFilterDirection
  // );
  const setMode = useSelectionStore((s) => s.setMode);
  const setN = useSelectionStore((s) => s.setN);

  const tileSize = mode === "trunes" ? 60 : (selectedN + 1) * 20;

  return (
    <Section
      title="Trunes"
      className="flex flex-none flex-col items-stretch border-b-4 px-2 [&_span]:select-none"
    >
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
