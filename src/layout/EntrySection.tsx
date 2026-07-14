import { ReflexElement, ReflexContainer, ReflexSplitter } from "react-reflex";
import { InnerImageZoom } from "react-inner-image-zoom";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { isEmpty, isEqual } from "lodash";
import clsx from "clsx";
import DownloadingIcon from "@mui/icons-material/Downloading";

import Section from "../components/ui/section";

import { useSelectionStore } from "@/data/selectionStore";
import { useDerivedMeaning } from "@/data/ruleset";
import { upsertWord, updateContextText } from "@/data/mutations";
import { saveImage, useImageUrl } from "@/data/images";
import TrunicWord from "@/components/TrunicWord";
import TruneTyper from "@/components/TruneTyper";
import InlineEdit from "@/components/InlineEdit";

const clearButton = "text-red-900 hover:bg-red-400";

type EntryMode = "enter" | "edit";

function EntrySection() {
  const [mode, setMode] = useState<EntryMode>(
    (localStorage.getItem("tunic-EntryMode") as EntryMode) ??
      ("enter" as EntryMode)
  );
  const [trunic, setTrunic] = useState<number[][]>(
    JSON.parse(localStorage.getItem("tunic-EntryTrunic") ?? "[]") as number[][]
  );
  const [curTrunicWord, setCurTrunicWord] = useState<number[]>(
    (JSON.parse(localStorage.getItem("tunic-EntryCurTrunicWord") ?? "[]") ??
      []) as number[]
  );
  const [curImageId, setCurImageId] = useState<number | null>(() => {
    const stored = localStorage.getItem("tunic-EntryCurImageId");
    return stored ? parseInt(stored, 10) : null;
  });

  useEffect(() => {
    localStorage.setItem("tunic-EntryMode", mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem("tunic-EntryTrunic", JSON.stringify(trunic));
  }, [trunic]);

  useEffect(() => {
    localStorage.setItem(
      "tunic-EntryCurTrunicWord",
      JSON.stringify(curTrunicWord)
    );
  }, [curTrunicWord]);

  useEffect(() => {
    if (curImageId != null)
      localStorage.setItem("tunic-EntryCurImageId", String(curImageId));
    else localStorage.removeItem("tunic-EntryCurImageId");
  }, [curImageId]);

  const curImageUrl = useImageUrl(curImageId);

  const selectedContextId = useSelectionStore((s) => s.selectedContext);

  const selectedContext = useContext(selectedContextId);

  const [uploading, setUploading] = useState(false);

  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);

  const words = useWords();
  const deriveMeaning = useDerivedMeaning();

  const trunicTextWrapperRef = useRef<HTMLDivElement>(null);

  const getWordTranslation = useCallback(
    (w: number[]): string => {
      const existingWord = words?.find((word) =>
        isEqual(
          word.trunes.map((t) => t.id),
          w
        )
      );
      if (existingWord && !isEmpty(existingWord.meaning)) {
        return existingWord.meaning ?? "";
      } else {
        return w.map((val) => deriveMeaning(val)).join("");
      }
    },
    [words, deriveMeaning]
  );

  useEffect(() => {
    const wordEls =
      trunicTextWrapperRef.current?.querySelectorAll(".wordWrapper");
    if (wordEls) {
      [...wordEls].forEach((child) => {
        const wordEl = child.querySelector(".word");
        const wordString = wordEl?.getAttribute("data-word");
        const existingSpan: HTMLSpanElement =
          child.querySelector(`.translatedText`)!;
        if (wordEl && wordString) {
          const wordNums = wordString.split(",").map((w) => parseInt(w));
          const translatedTextEl =
            existingSpan ?? document.createElement("span");
          translatedTextEl.setAttribute("class", "translatedText");
          translatedTextEl.innerText = getWordTranslation(wordNums);
          translatedTextEl.style.color = "var(--color-cyan-600)";
          child.appendChild(translatedTextEl);
        }
      });
    }
  }, [trunic, getWordTranslation]);

  const setContextTranslationFn = (val: string) => {
    if (selectedContext?.id) {
      updateContextText(selectedContext.id, val);
    }
  };

  const submitTrunicFn = () => {
    if (isEmpty(trunic) || curImageId == null) return;
    const submit = confirm("Submit Text with Context?");
    if (!submit) return;
    const context = upsertContextWithImage(curImageId);
    for (const [order, w] of trunic.entries()) {
      upsertWord(w, context.id, order);
    }
    setTrunic([]);
    setCurImageId(null);
  };

  const addGraphemeToWord = (val: number) => {
    setCurTrunicWord(curTrunicWord.concat([val]));
  };

  const translation = useMemo(() => {
    return mode === "enter"
      ? trunic.map(getWordTranslation).join(" ")
      : selectedContext
        ? selectedContext.wordIds
            .map((id) => words?.find((word) => word.id === id))
            .map((w) => {
              if (!w) return "???";
              else if (!isEmpty(w.meaning)) {
                return w.meaning;
              } else {
                return w.trunes.map((t) => deriveMeaning(t.id)).join("");
              }
            })
            .join(" ")
        : "";
  }, [selectedContext, trunic, mode, getWordTranslation, deriveMeaning, words]);

  useEffect(() => {
    if (words) {
      if (selectedContext != null) {
        setTrunic(
          selectedContext.wordIds
            .map((id) => words.find((word) => word.id === id))
            .filter((wd) => wd !== undefined)
            .map((wd) => wd.trunes.map((t) => t.id))
        );
      } else setTrunic([]);
    }
  }, [selectedContext, words]);

  const addWordToText = () => {
    if (curTrunicWord.length > 0) {
      setTrunic(trunic.concat([curTrunicWord]));
      setCurTrunicWord([]);
    }
  };

  const popLastGrapheme = () => {
    let lastWord = curTrunicWord;
    if (curTrunicWord.length === 0) {
      if (trunic.length === 0) {
        return 0;
      }
      lastWord = trunic[trunic.length - 1];
      setTrunic(trunic.slice(0, -1));
    }
    const lastLetter = lastWord[lastWord.length - 1];
    setCurTrunicWord(lastWord.slice(0, -1));
    return lastLetter;
  };

  const uploadFile = async (files: FileList | null) => {
    if (files) {
      setUploading(true);
      setError(null);
      const file = Array.from(files)[0];
      if (
        !["image/png", "image/jpg", "image/jpeg", "image/webp"].includes(
          file.type
        )
      ) {
        setUploading(false);
        setError(null);
        if (fileInput.current) {
          fileInput.current.value = "";
        }
        return;
      }
      try {
        const id = await saveImage(file);
        setCurImageId(id);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setUploading(false);
        if (fileInput.current) {
          fileInput.current.value = "";
        }
      }
    }
  };

  return (
    <Section title="Entry">
      <div className="flex flex-[0_0_auto] flex-row p-2 text-xs [&_button:not(:last-child)]:mr-2">
        <button
          className={clsx(mode === "enter" && "active")}
          onClick={() => {
            setMode("enter");
          }}
        >
          Enter
        </button>
        <button
          className={clsx(mode === "edit" && "active")}
          onClick={() => {
            setMode("edit");
          }}
        >
          Edit
        </button>
      </div>
      {mode === "enter" ? (
        <ReflexContainer orientation={"horizontal"} windowResizeAware={true}>
          <ReflexElement minSize={225} size={225} className="px-3 pt-0 pb-2">
            <div className="flex h-full max-w-full flex-row items-center text-center">
              <div className="flex h-full flex-[1_1_auto] flex-col">
                <div
                  className="flex flex-[1_0_50%] flex-row flex-wrap content-start justify-start self-stretch overflow-y-scroll border border-dotted border-slate-500 [&>div]:px-1.5 [&>div]:py-0.5"
                  ref={trunicTextWrapperRef}
                >
                  {trunic.map((w, i) => (
                    <div className="wordWrapper" key={i}>
                      <TrunicWord wordTrunes={w} width={18} inline />
                    </div>
                  ))}
                </div>
                <button
                  className={clsx(
                    "mt-2",
                    (isEmpty(trunic) || curImageId == null) && "disabled"
                  )}
                  onClick={() => {
                    submitTrunicFn();
                  }}
                >
                  Submit Trunic
                </button>
                <div className="flex-[0_0_50%]">
                  <div className="overflow-y-scroll text-cyan-600">
                    {translation}
                  </div>
                </div>
              </div>
              <div
                tabIndex={0}
                className="flex flex-[0_0_auto] flex-col items-center justify-start px-2"
                onFocus={() => {
                  setIsTyping(true);
                }}
                onBlur={() => {
                  setIsTyping(false);
                }}
              >
                <div className="flex-[0_0_auto] py-2">
                  <TrunicWord wordTrunes={curTrunicWord} width={20} inline />
                </div>
                <TruneTyper
                  width={100}
                  emitGrapheme={addGraphemeToWord}
                  emitWord={addWordToText}
                  popLastGrapheme={popLastGrapheme}
                  isActive={isTyping}
                />
              </div>
            </div>
          </ReflexElement>
          <ReflexSplitter propagate />
          <ReflexElement>
            <div className="flex flex-[0_0_auto] flex-col items-center [&_input]:hidden [&_label]:m-2 [&_label]:flex-[0_0_auto]">
              <div className="flex w-full flex-row items-center justify-center">
                <label htmlFor="fileInput">
                  {curImageId != null ? `Image #${curImageId}` : "Add Context"}
                </label>
                <input
                  disabled={curImageId != null}
                  type="file"
                  id="fileInput"
                  ref={fileInput}
                  onInput={(event: React.FormEvent) => {
                    uploadFile((event.target as HTMLInputElement).files).catch(
                      console.error
                    );
                  }}
                />
                <button
                  className={clsx(
                    clearButton,
                    isEmpty(curImageId) && "disabled"
                  )}
                  onClick={() => {
                    if (curImageId) {
                      const clear = confirm("Clear Context?");
                      if (clear) {
                        setCurImageId(null);
                      }
                    }
                  }}
                >
                  Clear Context
                </button>
              </div>
              {error != null ? (
                <div className="font-bold text-red-700">{error}</div>
              ) : null}
              {uploading ? (
                <DownloadingIcon fontSize="large" className="animate-spin" />
              ) : null}
              <div className="h-full overflow-x-scroll">
                {curImageUrl ? (
                  <InnerImageZoom
                    hideHint
                    className="w-[200%]"
                    zoomScale={2}
                    zoomType="hover"
                    src={curImageUrl}
                  />
                ) : null}
              </div>
            </div>
          </ReflexElement>
        </ReflexContainer>
      ) : (
        <div className="flex h-full flex-col px-3 py-2">
          <div className="text-cyan-600">{translation}</div>
          <InlineEdit
            textarea
            className="w-full flex-[1_0_auto] cursor-text overflow-y-scroll p-2 text-base leading-normal whitespace-pre-wrap"
            value={
              selectedContext && !isEmpty(selectedContext.text)
                ? (selectedContext.text ?? "")
                : (translation ?? "")
            }
            setValue={setContextTranslationFn}
          />
        </div>
      )}
    </Section>
  );
}

export default EntrySection;
