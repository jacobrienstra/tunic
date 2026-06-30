import { InnerImageZoom } from "react-inner-image-zoom";
import clsx from "clsx";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";

import { useSelectionStore } from "../data/selection";
import { useDbImageUrl } from "../data/queries";
import { useFilteredContexts } from "../data/filters";
import Tile from "../components/Tile";

import Section from "./Section";

function ContextImage(props: { imageId: number }) {
  const url = useDbImageUrl(props.imageId);
  if (!url) return null;
  // TODO: placeholder image box
  return (
    <InnerImageZoom
      hideHint
      className="max-h-full rounded-md"
      zoomScale={2}
      src={url}
    />
  );
}

function ContextsSection() {
  const selectedContext = useSelectionStore((s) => s.selectedContext);
  const contextFilterDirection = useSelectionStore(
    (s) => s.contextFilterDirection
  );
  const toggleSelectedContext = useSelectionStore(
    (s) => s.toggleSelectedContext
  );
  const setContextFilterDirection = useSelectionStore(
    (s) => s.setContextFilterDirection
  );

  const filteredContexts = useFilteredContexts();

  return (
    <Section title="Contexts">
      <div className="my-2 flex flex-[0_0_auto] flex-row flex-wrap content-center items-center justify-center [&_button]:mb-0.5 [&_button]:ml-0.5 [&_button]:text-base">
        <button
          className={clsx(contextFilterDirection === "backward" && "active")}
          onClick={() => setContextFilterDirection("backward")}
        >
          <KeyboardDoubleArrowLeftIcon />
        </button>
        <button
          className={clsx(contextFilterDirection === "off" && "active")}
          onClick={() => setContextFilterDirection("off")}
        >
          Off
        </button>
      </div>
      <div className="overflow-y-scroll px-3">
        {filteredContexts.map((ctx) => (
          <Tile
            align="start"
            key={ctx.id}
            active={selectedContext === ctx.id}
            toggleFn={toggleSelectedContext}
            val={ctx.id}
          >
            <div
              className="my-2 max-w-full"
              onClick={(event: React.MouseEvent) => event.stopPropagation()}
            >
              <div className="h-full max-w-full overflow-x-scroll">
                {ctx.imageId != null ? (
                  <ContextImage imageId={ctx.imageId} />
                ) : null}
              </div>
            </div>
          </Tile>
        ))}
      </div>
    </Section>
  );
}

export default ContextsSection;
