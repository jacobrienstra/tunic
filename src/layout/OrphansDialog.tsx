import { useMemo, useState } from "react";

import {
  useTrunes,
  useWords,
  wordTrunesJunction,
  wordTrunesJunctionByTruneId,
  wordTrunesJunctionByWordId,
} from "@/data/store";
import { deleteTrune, deleteWord } from "@/data/mutations";
import WordTile from "@/components/WordTile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TruneTile from "@/components/TruneTile";

function OrphansDialog({
  open,
  onOpenChange,
  orphanedWordIds,
  onConfirmed,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orphanedWordIds: string[];
  onConfirmed?: () => void | Promise<void>;
}) {
  const words = useWords();
  const trunes = useTrunes();

  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [selectedTrunes, setSelectedTrunes] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const orphanedTruneIds = useMemo(() => {
    const candidates = new Set<number>();
    for (const wid of selectedWords) {
      for (const key of wordTrunesJunctionByWordId.equalityLookup(wid)) {
        const row = wordTrunesJunction.get(key);
        if (row) candidates.add(row.truneId);
      }
    }
    const orphans: number[] = [];
    for (const tid of candidates) {
      let allInSelected = true;
      for (const key of wordTrunesJunctionByTruneId.equalityLookup(tid)) {
        const row = wordTrunesJunction.get(key);
        if (!row) continue;
        if (!selectedWords.has(row.wordId)) {
          allInSelected = false;
          break;
        }
      }
      if (allInSelected) orphans.push(tid);
    }
    return orphans;
  }, [selectedWords]);

  const toggleWord = (id: string) => {
    setSelectedWords((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleTrune = (id: number) => {
    setSelectedTrunes((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canConfirm =
    !deleting &&
    (selectedWords.size + selectedTrunes.size > 0 || onConfirmed != null);

  const confirm = async () => {
    if (!canConfirm) return;
    setDeleting(true);
    try {
      const orphanTruneSet = new Set(orphanedTruneIds);
      await Promise.all([
        ...[...selectedWords].map((id) => deleteWord(id)),
        ...[...selectedTrunes]
          .filter((id) => orphanTruneSet.has(id))
          .map((id) => deleteTrune(id)),
      ]);
      await onConfirmed?.();
      setSelectedWords(new Set());
      setSelectedTrunes(new Set());
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Orphaned Words & Trunes</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <h3>Orphaned Words</h3>
            <div className="flex flex-row flex-wrap gap-2">
              {orphanedWordIds.map((wid) => {
                const w = words.collection.get(wid);
                return w ? (
                  <WordTile
                    key={wid}
                    word={w}
                    active={selectedWords.has(wid)}
                    toggleFn={toggleWord}
                  />
                ) : null;
              })}
            </div>
          </div>
          <div>
            <h3>Orphaned Trunes</h3>
            <div className="flex flex-row flex-wrap gap-2">
              {orphanedTruneIds.map((tid) => {
                const t = trunes.collection.get(tid);
                return t ? (
                  <TruneTile
                    key={tid}
                    trune={t}
                    active={selectedTrunes.has(tid)}
                    toggleFn={toggleTrune}
                  />
                ) : null;
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between sm:justify-between">
          <Button
            variant="destructive"
            disabled={!canConfirm}
            onClick={() => void confirm()}
          >
            {deleting ? "Deleting..." : "Delete Selected"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default OrphansDialog;
