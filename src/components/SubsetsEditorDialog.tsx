import { useCallback, useState } from "react";
import { Blend } from "lucide-react";

import { GlyphSubset, useGlyphSubsets } from "@/data/store";
import { updateGlyphSubset } from "@/data/mutations";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import GlyphSubsetViewer from "@/components/GlyphSubsetViewer";

function SubsetsEditorDialog({ className }: { className: string }) {
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
        className={className}
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
                  handleCancel={() => setSubsetBeingEdited(null)}
                />
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default SubsetsEditorDialog;
