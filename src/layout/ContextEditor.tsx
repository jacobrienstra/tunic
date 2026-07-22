import { useEffect, useState } from "react";

import { useContexts, useWords } from "@/data/store";
import { createContextWithImage, updateContextWords } from "@/data/mutations";
import { useImageUrl } from "@/data/images";
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
}: {
  contextId: string | null;
  onCreated?: (contextId: string) => void;
}) {
  // Context/image functions
  const contexts = useContexts();
  const words = useWords();
  const curContext = contextId ? contexts.collection.get(contextId) : null;
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const previewUrl = useImageUrl(file);
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

  const onSaveChanges = async () => {
    if (saving || !contextId) return;
    setSaving(true);
    try {
      await updateContextWords(contextId, trunicText);
    } finally {
      setSaving(false);
    }
  };

  // Typing functions
  const [trunicText, setTrunicText] = useState<number[][]>([]);

  useEffect(() => {
    setTrunicText(
      curContext?.words.toArray.flatMap((w) => {
        const t = words.collection.get(w.wordId)?.truneIds;
        return t ? [t] : [];
      }) ?? []
    );
  }, [curContext, words]);

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
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Context & Trune Entry</DialogTitle>
      </DialogHeader>
      <div className="flex h-full flex-row gap-5">
        <div className="flex flex-col">
          {curContext ? (
            <ContextImage
              imageId={curContext.imageId}
              className="h-full w-auto object-contain"
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
                  className="h-full w-auto object-contain"
                />
              ) : (
                <FileUploadDropzone className="h-full">
                  Drop an image here or click to select
                </FileUploadDropzone>
              )}
            </FileUpload>
          )}
        </div>
        {contextId ? (
          <div className="flex flex-[0_0_50%] flex-col">
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
          </div>
        ) : null}
      </div>

      <DialogFooter>
        {file && previewUrl ? (
          <Button variant="destructive" onClick={() => setFile(null)}>
            Remove
          </Button>
        ) : null}
        {contextId ? (
          <Button disabled={saving} onClick={() => void onSaveChanges()}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        ) : (
          <Button
            disabled={saving || !file || !previewUrl}
            onClick={() => void onNewSave()}
          >
            {saving ? "Saving..." : "Create New Context"}
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
}

export default ContextEditor;
