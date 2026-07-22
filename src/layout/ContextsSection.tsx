import { useState } from "react";
import { Ban, ArrowBigUp, Edit, Plus } from "lucide-react";

import ContextEditor from "./ContextEditor";

import { useContexts } from "@/data/store";
import { useSelectionStore } from "@/data/selectionStore";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import ContextImage from "@/components/ContextImage";

type EditState = null | { mode: "create" } | { mode: "edit"; id: string };

function ContextsSection() {
  const [editingContext, setEditingContext] = useState<EditState>(null);

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

          <Button
            className="my-2"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setEditingContext({ mode: "create" });
            }}
          >
            <Plus />
            New Context
          </Button>
        </SectionControls>
        <SectionContent className="h-full min-h-0">
          <ScrollArea orientation="horizontal" className="h-full min-h-0 py-1">
            <div className={"flex h-full min-h-0 w-max flex-row"}>
              {allContexts.data.map((ctx) => (
                <Tile
                  key={ctx.id}
                  active={selectedContext === ctx.id}
                  activeClass="scale-95"
                  toggleFn={toggleSelectedContext}
                  val={ctx.id}
                  hidden={!filteredContexts.collection?.has(ctx.id)}
                  className="overflow-visible"
                >
                  <TileImage className="h-full min-h-0">
                    <ContextImage imageId={ctx.imageId} className="" />
                  </TileImage>
                  <Button
                    variant="outline"
                    className="absolute top-1 right-1 hidden items-center rounded-md group-hover/tile:flex"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingContext({ mode: "edit", id: ctx.id });
                    }}
                  >
                    <Edit />
                    Edit Context
                  </Button>
                </Tile>
              ))}
            </div>
          </ScrollArea>
        </SectionContent>
      </SectionMain>
      <Dialog
        open={editingContext !== null}
        onOpenChange={(open) => !open && setEditingContext(null)}
      >
        {editingContext && (
          <ContextEditor
            contextId={
              editingContext.mode === "edit" ? editingContext.id : null
            }
            onCreated={(id) => setEditingContext({ mode: "edit", id })}
          />
        )}
      </Dialog>
    </Section>
  );
}

export default ContextsSection;
