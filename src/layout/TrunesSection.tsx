import { ArrowBigDown, Ban, ArrowBigUp } from "lucide-react";

import { useTrunes } from "@/data/store";
import { useSelectionStore } from "@/data/selectionStore";
import { useFilteredTrunes } from "@/data/filtered";
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
import TruneTile from "@/components/TruneTile";

function TrunesSection() {
  const truneFilterDirection = useSelectionStore((s) => s.truneFilterDirection);
  const setTruneFilterDirection = useSelectionStore(
    (s) => s.setTruneFilterDirection
  );
  const selectedTrune = useSelectionStore((s) => s.selectedTrune);
  const toggleSelectedTrune = useSelectionStore((s) => s.toggleSelectedTrune);
  const filteredTrunes = useFilteredTrunes();
  const allTrunes = useTrunes();

  return (
    <Section>
      <SectionMain>
        <SectionControls>
          <SectionTitle>Trunes</SectionTitle>
          <ButtonGroup
            orientation="horizontal"
            aria-label="Filter direction"
            className="h-fit"
          >
            <Button
              variant="outline"
              size="icon"
              active={truneFilterDirection === "backward"}
              onClick={() => setTruneFilterDirection("backward")}
            >
              <ArrowBigUp />
            </Button>
            <Button
              variant="outline"
              size="icon"
              active={truneFilterDirection === "off"}
              onClick={() => setTruneFilterDirection("off")}
            >
              <Ban />
            </Button>
            <Button
              variant="outline"
              size="icon"
              active={truneFilterDirection === "forward"}
              onClick={() => setTruneFilterDirection("forward")}
            >
              <ArrowBigDown />
            </Button>
          </ButtonGroup>
        </SectionControls>
        <SectionContent>
          <ScrollArea orientation="horizontal" className="h-full py-1">
            <div className={"flex w-max flex-row"}>
              {allTrunes.data.map((t) => (
                <TruneTile
                  trune={t}
                  key={t.id}
                  active={selectedTrune === t.id}
                  toggleFn={toggleSelectedTrune}
                  hidden={!filteredTrunes.has(t.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </SectionContent>
      </SectionMain>
    </Section>
  );
}

export default TrunesSection;
