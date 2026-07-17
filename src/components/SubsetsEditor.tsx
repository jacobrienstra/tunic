import { useCallback, useState } from "react";
import { Blend } from "lucide-react";

import { ScrollArea } from "./ui/scroll-area";
import GlyphSubsetViewer from "./GlyphSubsetViewer";

import { GlyphSubset, useGlyphSubsets } from "@/data/store";
import { updateGlyphSubset } from "@/data/mutations";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function SubsetsEditor() {
  const glyphSubsets = useGlyphSubsets();
  const [subsetBeingEdited, setSubsetBeingEdited] = useState<string | null>(
    null
  );

  const handleSubsetSave = useCallback(
    (subset: Partial<GlyphSubset>) => {
      if (subsetBeingEdited) {
        updateGlyphSubset(subsetBeingEdited, subset);
      }
      setSubsetBeingEdited(null);
    },
    [subsetBeingEdited]
  );

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline">
            <Blend /> Edit Subsets
          </Button>
        }
      ></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Glyph Subsets</DialogTitle>
        </DialogHeader>
        <ScrollArea>
          <div className="no-scrollbar flex max-h-[80vh] flex-row flex-wrap justify-center gap-12 overflow-y-auto">
            {glyphSubsets.data.map((gs) => {
              return (
                <GlyphSubsetViewer
                  key={gs.id}
                  subset={gs}
                  isEditing={subsetBeingEdited === gs.id}
                  isLocked={
                    subsetBeingEdited !== gs.id && subsetBeingEdited != null
                  }
                  setIsEditing={setSubsetBeingEdited}
                  handleSave={handleSubsetSave}
                />
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default SubsetsEditor;
