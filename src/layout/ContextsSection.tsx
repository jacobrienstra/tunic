import { memo } from "react";
import { Ban, ArrowBigUp } from "lucide-react";

import { cn } from "@/lib/utils";
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
  SectionMain,
} from "@/components/ui/section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";

const ContextImage = memo(function ContextImage({
  imageId,
  className,
  ...props
}: React.ComponentProps<"img"> & {
  imageId: string;
}) {
  const url = useImageUrl(imageId);
  if (!url) return null;
  // TODO: placeholder image box
  return (
    <img className={cn("h-full w-auto", className)} src={url} {...props} />
  );
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
    <Section className="min-h-0 flex-1 overflow-y-hidden">
      <SectionMain className="h-full min-h-0">
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
        <SectionContent className="h-full min-h-0">
          <ScrollArea orientation="horizontal" className="h-full min-h-0 py-1">
            <div className={"flex h-full min-h-0 w-max flex-row"}>
              {allContexts.data.map((ctx) => (
                <Tile
                  key={ctx.id}
                  active={selectedContext === ctx.id}
                  toggleFn={toggleSelectedContext}
                  val={ctx.id}
                  hidden={!filteredContexts.collection?.has(ctx.id)}
                  className=""
                >
                  <TileImage className="h-full min-h-0">
                    <ContextImage imageId={ctx.imageId} className="" />
                  </TileImage>
                </Tile>
              ))}
            </div>
          </ScrollArea>
        </SectionContent>
      </SectionMain>
    </Section>
  );
}

export default ContextsSection;
