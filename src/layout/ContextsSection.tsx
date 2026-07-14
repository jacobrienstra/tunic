import { memo } from "react";
import { Ban, ArrowBigUp } from "lucide-react";

import { useContexts } from "@/data/store";
import { useSelectionStore } from "@/data/selectionStore";
import { useImageUrl } from "@/data/images";
import { useFilteredContexts } from "@/data/filtered";
import { Tile, TileImage } from "@/components/ui/tile";
import {
  Section,
  SectionTitle,
  SectionControls,
  SectionContent,
} from "@/components/ui/section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";

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
  const allContexts = useContexts();

  return (
    <Section>
      <SectionControls>
        <SectionTitle>Contexts</SectionTitle>
        <ButtonGroup
          orientation="vertical"
          aria-label="Filter direction"
          className="h-fit"
        >
          <Button
            variant="outline"
            size="icon"
            active={contextFilterDirection === "backward"}
            onClick={() => setContextFilterDirection("backward")}
          >
            <ArrowBigUp />
          </Button>
          <Button
            variant="outline"
            size="icon"
            active={contextFilterDirection === "off"}
            onClick={() => setContextFilterDirection("off")}
          >
            <Ban />
          </Button>
        </ButtonGroup>
      </SectionControls>
      <SectionContent>
        <ScrollArea orientation="horizontal">
          <div className={"flex w-max flex-row"}>
            {allContexts.data.map((ctx) => (
              <Tile
                key={ctx.id}
                active={selectedContext === ctx.id}
                toggleFn={toggleSelectedContext}
                val={ctx.id}
                hidden={!filteredContexts.collection?.has(ctx.id)}
              >
                <TileImage>
                  <ContextImage imageId={ctx.imageId} />
                </TileImage>
              </Tile>
            ))}
          </div>
        </ScrollArea>
      </SectionContent>
    </Section>
  );
}

export default ContextsSection;
