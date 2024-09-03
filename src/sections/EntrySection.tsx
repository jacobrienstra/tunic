import { ReflexElement, ReflexContainer, ReflexSplitter } from "react-reflex";
import InnerImageZoom from "react-inner-image-zoom";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { isEmpty, isEqual } from "lodash";
import DownloadingIcon from "@mui/icons-material/Downloading";
import { css } from "@emotion/react";
import { cx, css as cssClass } from "@emotion/css";
import { uploadFiles } from "@directus/sdk";

import { selectSelectedContext } from "../selectors";
import {
  ContextData,
  sdk,
  useGetContextWordJunctionsQuery,
  useGetContextsQuery,
  useGetGraphemesQuery,
  useGetWordsQuery,
  useUpdateContextMutation,
  useUpsertContextMutation,
} from "../redux/services/data";
import { useAddWordMutation } from "../redux/services/data";
import { useAppSelector } from "../redux/hooks";
import { getGraphemeSoundGuess } from "../glyph";
import Word from "../components/Word";
import InlineEdit from "../components/InlineEdit";
import GlyphTyper from "../components/GlyphTyper";

import Section from "./Section";

const trunicTextSection = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  text-align: center;
  height: 100%;
  max-width: 100%;
`;

const trunicTextRenderSection = css`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  height: 100%;
`;

const trunicTextWrapper = css`
  flex: 1 0 50%;
  align-self: stretch;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: flex-start;
  overflow-y: scroll;

  border: 1px dotted var(--slate-500);

  & > div {
    padding: 2px 6px;
  }
`;

const wordWrapper = css`
  padding: 8px 0;
  flex: 0 0 auto;
`;

const typerWrapper = css`
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: center;
  padding: 0 8px;
  justify-content: flex-start;
`;

const imgSection = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 auto;
  /* height: 100%; */
  label {
    margin: 8px;
    flex: 0 0 auto;
  }

  input {
    display: none;
  }
`;

const imgSectionButtons = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const imgScrollWrapper = css`
  overflow-x: scroll;
  height: 100%;
`;

const contextImg = css`
  width: 200%;
`;

const errorSection = css`
  color: var(--red-700);
  font-weight: 700;
`;

const loadingIcon = css`
  @keyframes rotation {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(359deg);
    }
  }
  animation: rotation 1s infinite linear;
`;

const clearButton = cssClass`
  color: var(--red-900);

  &:hover {
    background: var(--red-400);
  }
`;

const translationStyle = css`
  color: var(--cyan-600);
`;

const headerSwitcher = css`
  display: flex;
  flex-direction: row;
  flex: 0 0 auto;
  padding: 8px;
  font-size: 12px;

  button:not(:last-child) {
    margin-right: 8px;
  }
`;

const textEditor = css`
  width: 100%;
  flex: 1 0 auto;
  white-space: pre-wrap;
  padding: 8px;
  font-family: "Noto Serif", Inter, system-ui, Avenir, Helvetica, Arial,
    sans-serif;
  font-size: 16px;
  line-height: 1.5;
  cursor: text;
  overflow-y: scroll;
`;

const editingWrapper = css`
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  height: 100%;
`;

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
  const [curImageId, setCurImageId] = useState<string | null>(
    localStorage.getItem("tunic-EntryCurImageId")
  );

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
    if (curImageId) localStorage.setItem("tunic-EntryCurImageId", curImageId);
    else localStorage.removeItem("tunic-EntryCurImageId");
  }, [curImageId]);

  const selectedContextId = useAppSelector(selectSelectedContext);

  const { data: selectedContext } = useGetContextsQuery(undefined, {
    selectFromResult: ({ data }) => ({
      data:
        data?.find((ctx) => ctx.id === selectedContextId) ??
        ({} as ContextData),
    }),
  });

  const [uploading, setUploading] = useState(false);

  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);

  const [addWord] = useAddWordMutation();
  const [updateContext] = useUpdateContextMutation();
  const [upsertContext] = useUpsertContextMutation();
  const { data: graphemes } = useGetGraphemesQuery();
  const { data: junctions } = useGetContextWordJunctionsQuery();
  const { data: words } = useGetWordsQuery();

  const trunicTextWrapperRef = useRef<HTMLDivElement>(null);

  const getWordTranslation = useCallback(
    (w: number[]): string => {
      const existingWord = words?.find((word) =>
        isEqual(word.word.join(","), w.join(","))
      );
      if (existingWord && !isEmpty(existingWord.meaning)) {
        return existingWord.meaning;
      } else {
        return w.map((val) => getGraphemeSoundGuess(val, graphemes)).join("");
      }
    },
    [words, graphemes]
  );

  useEffect(() => {
    const wordEls =
      trunicTextWrapperRef.current?.querySelectorAll(".wordWrapper");
    if (wordEls) {
      [...wordEls].forEach((child) => {
        const wordEl = child.querySelector(".word");
        const wordString = wordEl?.getAttribute("data-word");
        const existingSpan = child.querySelector(`.translatedText`);
        if (wordEl && wordString && !existingSpan) {
          const wordNums = wordString.split(",").map((w) => parseInt(w));
          const translatedTextEl = document.createElement("span");
          translatedTextEl.setAttribute("class", "translatedText");
          translatedTextEl.innerText = getWordTranslation(wordNums);
          translatedTextEl.style.color = "var(--cyan-600)";
          child.appendChild(translatedTextEl);
        }
      });
    }
  }, [trunic, getWordTranslation]);

  const setContextTranslationFn = (val: string) => {
    if (selectedContext != null && selectedContext?.id) {
      return updateContext({ id: selectedContext.id, text: val });
    } else {
      return () => {};
    }
  };

  const submitTrunicFn = async () => {
    if (!isEmpty(trunic)) {
      const submit = confirm("Submit Text with Context?");
      if (submit) {
        let context = null;
        if (curImageId) {
          context = await upsertContext({ imageId: curImageId });
        } else {
          context = await upsertContext({});
        }
        if (context && "data" in context && context?.data?.id) {
          const promises = [];
          for (let i = 0; i < trunic.length; i++) {
            promises.push(
              addWord({
                word: trunic[i],
                ctxId: context.data?.id,
                order: i,
              })
            );
          }
          await Promise.all(promises);
        }
        setTrunic([]);
        setCurImageId(null);
      }
    }
  };

  const addGraphemeToWord = (val: number) => {
    setCurTrunicWord(curTrunicWord.concat([val]));
  };

  const translation = useMemo(() => {
    return mode === "enter"
      ? trunic.map(getWordTranslation).join(" ")
      : junctions && selectedContext
        ? junctions
            ?.filter((j) => j.contexts_id === selectedContext?.id)
            .sort((a, b) => a.order - b.order)
            .map((j) => words?.find((word) => word.id === j.words_id))
            .map((w) => {
              if (!w) return "???";
              else if (!isEmpty(w.meaning)) {
                return w.meaning;
              } else {
                return w.word
                  .map((val) => getGraphemeSoundGuess(parseInt(val), graphemes))
                  .join("");
              }
            })
            .join(" ")
        : "";
  }, [
    selectedContext,
    trunic,
    mode,
    getWordTranslation,
    junctions,
    graphemes,
    words,
  ]);

  useEffect(() => {
    if (junctions && words) {
      if (selectedContextId != null) {
        setTrunic(
          junctions
            .filter((j) => j.contexts_id === selectedContextId)
            .sort((a, b) => a.order - b.order)
            .map((j) => words?.find((word) => word.id === j.words_id))
            .filter((wd) => wd !== undefined)
            .map((wd) =>
              wd?.word.map((g) => {
                return parseInt(g, 10);
              })
            )
        );
      } else setTrunic([]);
    }
  }, [selectedContextId, junctions, words]);

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
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await sdk.request(uploadFiles(formData));
        setCurImageId(response.id);
      } catch ({ errors }: any) {
        setError(
          errors
            .map(
              (e: { message: string; extensions: Record<string, any> }) =>
                e.message
            )
            .toString()
        );
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
      <div css={headerSwitcher}>
        <button
          className={cx({ active: mode === "enter" })}
          onClick={() => {
            setMode("enter");
          }}
        >
          Enter
        </button>
        <button
          className={cx({ active: mode === "edit" })}
          onClick={() => {
            setMode("edit");
          }}
        >
          Edit
        </button>
      </div>
      {mode === "enter" ? (
        <ReflexContainer orientation={"horizontal"} windowResizeAware={true}>
          <ReflexElement
            minSize={225}
            size={225}
            style={{ padding: "0px 12px 8px" }}
          >
            <div css={trunicTextSection}>
              <div css={trunicTextRenderSection}>
                <div css={trunicTextWrapper} ref={trunicTextWrapperRef}>
                  {trunic.map((w, i) => (
                    <div className="wordWrapper" key={i}>
                      <Word word={w} width={18} />
                    </div>
                  ))}
                </div>
                <button
                  style={{ marginTop: "8px" }}
                  className={cx({
                    disabled: isEmpty(trunic),
                  })}
                  onClick={submitTrunicFn}
                >
                  Submit Trunic
                </button>
                <div style={{ flex: "0 0 50%" }}>
                  <div css={translationStyle} style={{ overflowY: "scroll" }}>
                    {translation}
                  </div>
                </div>
              </div>
              <div
                tabIndex={0}
                css={typerWrapper}
                onFocus={() => {
                  setIsTyping(true);
                }}
                onBlur={() => {
                  setIsTyping(false);
                }}
              >
                <div css={wordWrapper}>
                  <Word word={curTrunicWord} width={20} />
                </div>
                <GlyphTyper
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
            <div css={imgSection}>
              <div css={imgSectionButtons}>
                <label htmlFor="fileInput">{curImageId ?? "Add Context"}</label>
                <input
                  disabled={curImageId != null}
                  type="file"
                  id="fileInput"
                  ref={fileInput}
                  onInput={(event: React.FormEvent) =>
                    uploadFile((event.target as HTMLInputElement).files)
                  }
                />
                <button
                  className={cx({
                    disabled: isEmpty(curImageId),
                    [clearButton]: true,
                  })}
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
              {error != null ? <div css={errorSection}>{error}</div> : null}
              {uploading ? (
                <DownloadingIcon fontSize="large" css={loadingIcon} />
              ) : null}
              <div css={imgScrollWrapper}>
                {curImageId != null ? (
                  <InnerImageZoom
                    hideHint
                    css={contextImg}
                    zoomScale={2}
                    zoomType="hover"
                    src={`${
                      import.meta.env.VITE_DIRECTUS_URL
                    }/assets/${curImageId}`}
                  />
                ) : null}
              </div>
            </div>
          </ReflexElement>
        </ReflexContainer>
      ) : (
        <div css={editingWrapper}>
          <div css={translationStyle}>{translation}</div>
          <InlineEdit
            textarea
            css={textEditor}
            value={
              selectedContext && !isEmpty(selectedContext.text)
                ? selectedContext.text
                : translation ?? ""
            }
            setValue={setContextTranslationFn}
          />
        </div>
      )}
    </Section>
  );
}

export default EntrySection;
