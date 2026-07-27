import { useEffect, useMemo, useState } from "react";

import OrphansDialog from "@/layout/OrphansDialog";
import { useContexts, useWords } from "@/data/store";
import {
  createContextWithImage,
  deleteContext,
  previewContextDeleteOrphans,
  updateContextText,
  updateContextWords,
} from "@/data/mutations";
import { useImageUrl } from "@/data/images";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileUpload, FileUploadDropzone } from "@/components/ui/file-upload";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TrunicWord from "@/components/TrunicWord";
import TruneTyper from "@/components/TruneTyper";
import ContextImage from "@/components/ContextImage";

function ContextEditor({
  contextId,
  onCreated,
  onDeleted,
}: {
  contextId: string | null;
  onCreated?: (contextId: string) => void;
  onDeleted?: (contextId: string) => void;
}) {
  // Context/image functions
  const contexts = useContexts();
  const words = useWords();
  const curContext = contextId ? contexts.collection.get(contextId) : null;
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [orphans, setOrphans] = useState<{ wordIds: string[] } | null>(null);
  const [text, setText] = useState<string>(curContext?.text ?? "");
  const previewUrl = useImageUrl(file);

  useEffect(() => {
    setText(curContext?.text ?? "");
  }, [curContext]);

  const onSaveText = () => {
    if (!contextId) return;
    updateContextText(contextId, text.length > 0 ? text : null);
  };

  const onNewSave = async () => {
    if (!file || saving) return;
    setSaving(true);
    try {
      const { contextId: newId } = await createContextWithImage(file);
      setFile(null);
      onCreated?.(newId);
    } finally {
      setSaving(false);
    }
  };

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const onDelete = async () => {
    if (saving || !contextId) return;
    const orphanedWordIds = previewContextDeleteOrphans(contextId);
    if (orphanedWordIds.length > 0) {
      setPendingDeleteId(contextId);
      setOrphans({ wordIds: orphanedWordIds });
      return;
    }
    setSaving(true);
    try {
      await deleteContext(contextId);
      onDeleted?.(contextId);
    } finally {
      setSaving(false);
    }
  };
  const commitPendingDelete = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    await deleteContext(id);
    setPendingDeleteId(null);
    onDeleted?.(id);
  };

  const onSaveChanges = async () => {
    if (saving || !contextId) return;
    setSaving(true);
    try {
      const { orphanedWordIds } = await updateContextWords(
        contextId,
        trunicText
      );
      if (orphanedWordIds.length > 0) {
        setOrphans({ wordIds: orphanedWordIds });
      }
    } finally {
      setSaving(false);
    }
  };

  // Typing functions
  const [trunicText, setTrunicText] = useState<number[][]>([]);

  const savedTrunicText = useMemo<number[][]>(
    () =>
      curContext?.words.toArray.flatMap((w) => {
        const t = words.collection.get(w.wordId)?.truneIds;
        return t ? [t] : [];
      }) ?? [],
    [curContext, words]
  );

  useEffect(() => {
    setTrunicText(savedTrunicText);
  }, [savedTrunicText]);

  const trunicTextDirty =
    trunicText.length !== savedTrunicText.length ||
    trunicText.some(
      (w, i) =>
        w.length !== savedTrunicText[i].length ||
        w.some((t, j) => t !== savedTrunicText[i][j])
    );

  const [curTrunicWord, setCurTrunicWord] = useState<number[]>([]);

  const [isTyping, setIsTyping] = useState(false);
  const addGraphemeToWord = (val: number) => {
    setCurTrunicWord(curTrunicWord.concat([val]));
  };
  const addWordToText = () => {
    if (curTrunicWord.length > 0) {
      setTrunicText(trunicText.concat([curTrunicWord]));
      setCurTrunicWord([]);
    }
  };
  const popLastGrapheme = () => {
    let lastWord = curTrunicWord;
    if (curTrunicWord.length === 0) {
      if (trunicText.length === 0) {
        return 0;
      }
      lastWord = trunicText[trunicText.length - 1];
      setTrunicText(trunicText.slice(0, -1));
    }
    const lastLetter = lastWord[lastWord.length - 1];
    setCurTrunicWord(lastWord.slice(0, -1));
    return lastLetter;
  };

  return (
    <DialogContent
      className={
        curContext
          ? "h-[calc(100%-2rem)] grid-rows-[auto_minmax(0,1fr)_auto]"
          : undefined
      }
    >
      <DialogHeader>
        <DialogTitle>Edit Context / Trune Entry</DialogTitle>
      </DialogHeader>
      <div className="flex h-full min-h-0 flex-row gap-5">
        <div className="flex h-full min-h-0 flex-col items-start gap-3">
          {curContext ? (
            <ContextImage
              imageId={curContext.imageId}
              className="h-auto w-auto object-contain"
            />
          ) : (
            <FileUpload
              accept="image/*"
              maxSize={10 * 1024 * 1024}
              value={file}
              onValueChange={setFile}
              className="h-full w-full cursor-pointer"
            >
              {file && previewUrl ? (
                <img
                  src={previewUrl}
                  alt={file.name}
                  className="w-auto object-contain"
                />
              ) : (
                <FileUploadDropzone className="h-full">
                  Drop an image here or click to select
                </FileUploadDropzone>
              )}
            </FileUpload>
          )}
          {curContext ? (
            <>
              <div className="flex min-h-0 flex-1 flex-col self-stretch">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="h-full"
                />
              </div>
              <Button
                disabled={text === (curContext.text ?? "")}
                onClick={onSaveText}
              >
                Save Text
              </Button>
            </>
          ) : null}
        </div>
        {contextId ? (
          <div className="flex h-full flex-[0_0_60%] flex-col gap-2">
            <div
              tabIndex={0}
              className="flex w-full flex-row"
              onFocus={() => {
                setIsTyping(true);
              }}
              onBlur={() => {
                setIsTyping(false);
              }}
            >
              <TruneTyper
                emitTrune={addGraphemeToWord}
                emitWord={addWordToText}
                popLastGrapheme={popLastGrapheme}
                disabled={!isTyping}
                className="[--glyph-size:150px]"
              />
              <div className="mx-4 flex h-full flex-1 flex-col">
                <div className="current-trunic-word flex min-h-min w-full flex-row pb-1">
                  <div className="self-center">
                    Current
                    <br />
                    Word:
                  </div>
                  <div className="flex flex-1 justify-center">
                    <TrunicWord
                      inline
                      wordTrunes={curTrunicWord}
                      className="mx-auto"
                    />
                  </div>
                </div>

                <div className="current-trunic-text flex h-full flex-col border-t">
                  <div className="my-2 w-full text-center">
                    Current Trunic Text:
                  </div>
                  <ScrollArea className="h-full">
                    <div className="flex w-full flex-row flex-wrap gap-x-4 gap-y-2 overflow-hidden">
                      {trunicText.map((w, i) => (
                        <TrunicWord
                          key={`${w.join("_")}-${i}`}
                          wordTrunes={w}
                          inline
                          withMeaning
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
            {contextId ? (
              <Button
                disabled={saving || !trunicTextDirty}
                onClick={() => void onSaveChanges()}
                className="mt-auto self-end"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <DialogFooter className="flex-row items-center justify-between sm:justify-between">
        {contextId ? (
          <Button
            variant="destructive"
            disabled={saving}
            onClick={() => void onDelete()}
          >
            Delete Context
          </Button>
        ) : (
          <span />
        )}
        <div className="flex flex-row gap-2">
          {file && previewUrl ? (
            <Button variant="destructive" onClick={() => setFile(null)}>
              Remove
            </Button>
          ) : null}
          {contextId === null ? (
            <Button
              disabled={saving || !file || !previewUrl}
              onClick={() => void onNewSave()}
            >
              {saving ? "Saving..." : "Create New Context"}
            </Button>
          ) : null}
        </div>
      </DialogFooter>
      <OrphansDialog
        open={orphans != null}
        onOpenChange={(o) => {
          if (!o) {
            setOrphans(null);
            setPendingDeleteId(null);
          }
        }}
        orphanedWordIds={orphans?.wordIds ?? []}
        onConfirmed={pendingDeleteId ? commitPendingDelete : undefined}
      />
    </DialogContent>
  );
}

export default ContextEditor;
