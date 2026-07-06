import { memo } from "react";
import clsx from "clsx";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";

import { useSelectionStore } from "../data/selectionStore";
import { useImageUrl } from "../data/images";
import { useFilteredContexts } from "../data/filters";
import Tile from "../components/Tile";

import Section from "./Section";

const ContextImage = memo(function ContextImage({
  imageId,
}: {
  imageId: string;
}) {
  const url = useImageUrl(imageId);
  if (!url) return null;
  // TODO: placeholder image box
  return <img className="h-full w-auto" src={url} />;
});

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
    <Section title="Contexts" className="min-h-0 flex-1">
      <div className="mt-2 flex min-h-0 flex-1 flex-row overflow-x-scroll p-2">
        {filteredContexts.map((ctx) => (
          <Tile
            align="start"
            key={ctx.id}
            active={selectedContext === ctx.id}
            toggleFn={toggleSelectedContext}
            val={ctx.id}
            className="h-full shrink-0"
          >
            <ContextImage imageId={ctx.imageId} />
          </Tile>
        ))}
      </div>
    </Section>
  );
}

export default ContextsSection;
