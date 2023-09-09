import { cx, css as cssClass } from "@emotion/css";
import { css } from "@emotion/react";
import { useRef, useState } from "react";
import GlyphTyper from "../components/GlyphTyper";
import Section from "./Section";
import Word from "../components/Word";
import {
  ContextData,
  sdk,
  useGetContextWordJunctionsQuery,
  useGetContextsQuery,
  useGetGraphemesQuery,
  useGetWordsQuery,
  useUpdateContextMutation,
} from "../redux/services/data";
import { uploadFiles } from "@directus/sdk";
import DownloadingIcon from "@mui/icons-material/Downloading";
import { isEmpty, isEqual } from "lodash";
import { ReflexElement, ReflexContainer, ReflexSplitter } from "react-reflex";
import { getGraphemeSoundGuess } from "../glyph";
import { useAddWordMutation } from "../redux/services/data";
import { useAppSelector } from "../redux/hooks";
import { selectSelectedContext } from "../selectors";
import InlineEdit from "../components/InlineEdit";

const textSection = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px dashed var(--slate-600);
  /* flex: 1 0 auto; */
`;

const textWrapper = css`
  flex: 1 1 auto;
  min-height: 40px;
  align-self: stretch;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

  border-bottom: 2px solid var(--slate-500);

  & > div {
    padding: 2px 6px;
  }
`;

const wordWrapper = css`
  padding: 8px 0;
  flex: 1 1 auto;
  min-height: 65px;
`;

const submitButton = cssClass`
  margin-bottom: 8px;
`;

const typerWrapper = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  height: 100%;
  justify-content: center;
`;

const imgSection = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  /* height: 100%; */
  label {
    margin: 8px;
    flex: 0 0 auto;
  }

  input {
    display: none;
  }
`;

const imgScrollWrapper = css`
  max-width: 100%;
  overflow-x: scroll;
  /* height: 100%; */
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
  margin-top: 8px;
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
  height: 100%;
`;

type EntryMode = "enter" | "edit";

function EntrySection() {
  const [mode, setMode] = useState<EntryMode>("enter");
  const [text, setText] = useState<number[][]>([]);
  const [curWord, setCurWord] = useState<number[]>([]);
  const [curImageId, setCurImageId] = useState<string | null>(null);

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
  const { data: graphemes } = useGetGraphemesQuery();
  const { data: junctions } = useGetContextWordJunctionsQuery();
  const { data: words } = useGetWordsQuery();

  const setValueFn = (val: string) => {
    if (selectedContext != null && selectedContext?.id) {
      return updateContext({ id: selectedContext!.id, text: val });
    } else {
      return () => {};
    }
  };

  const addGraphemeToWord = (val: number) => {
    setCurWord(curWord.concat([val]));
  };

  const translation =
    mode === "enter"
      ? text
          .map((w) => {
            let existingWord = words?.find((word) =>
              isEqual(word.word.join(","), w.join(","))
            );
            if (existingWord && !isEmpty(existingWord.meaning)) {
              return existingWord.meaning;
            } else {
              return w
                .map((val) => getGraphemeSoundGuess(val, graphemes))
                .join("");
            }
          })
          .join(" ")
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

  const addWordToText = () => {
    if (curWord.length > 0) {
      setText(text.concat([curWord]));
      setCurWord([]);
    }
  };

  const popLastGrapheme = () => {
    let lastWord = curWord;
    if (curWord.length === 0) {
      if (text.length === 0) {
        return 0;
      }
      lastWord = text[text.length - 1];
      setText(text.slice(0, -1));
    }
    const lastLetter = lastWord[lastWord.length - 1];
    setCurWord(lastWord.slice(0, -1));
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
      <ReflexContainer orientation={"horizontal"} windowResizeAware={true}>
        <ReflexElement minSize={121} size={121} style={{ padding: "8px 12px" }}>
          {mode === "enter" ? (
            <>
              <div css={textSection}>
                <div css={textWrapper}>
                  {text.map((w, i) => (
                    <Word word={w} key={i} />
                  ))}
                </div>
                <div css={wordWrapper}>
                  <Word word={curWord} width={30} />
                </div>
              </div>
              <div css={translationStyle}>{translation}</div>
            </>
          ) : (
            <>
              <div css={translationStyle}>{translation}</div>
              <InlineEdit
                textarea
                css={textEditor}
                value={
                  selectedContext && !isEmpty(selectedContext.text)
                    ? selectedContext.text
                    : translation ?? ""
                }
                setValue={setValueFn}
              />
            </>
          )}
        </ReflexElement>
        <ReflexSplitter />
        <ReflexElement minSize={200} maxSize={280} size={250}>
          <div
            tabIndex={0}
            css={typerWrapper}
            onFocus={() => {
              // if (curContext != null) {
              setIsTyping(true);
              // }
            }}
            onBlur={() => {
              setIsTyping(false);
            }}
          >
            <button
              className={cx({
                disabled: isEmpty(text),
                [submitButton]: true,
              })}
              onClick={async () => {
                if (
                  !isEmpty(text)
                  // !isEmpty(curContext) &&
                  // curContext != null
                ) {
                  const submit = confirm("Submit Text with Context?");
                  if (submit) {
                    for (let i = 0; i < text.length; i++) {
                      if (curImageId) {
                        await addWord({
                          word: text[i],
                          ctxImageId: curImageId,
                          order: i,
                        });
                      } else {
                        await addWord({
                          word: text[i],
                        });
                      }
                    }
                    setText([]);
                    setCurImageId(null);
                  }
                }
              }}
            >
              Submit Text
            </button>
            <GlyphTyper
              emitGrapheme={addGraphemeToWord}
              emitWord={addWordToText}
              popLastGrapheme={popLastGrapheme}
              isActive={isTyping}
            />
          </div>
        </ReflexElement>
        <ReflexSplitter propagate />
        <ReflexElement>
          <div css={imgSection}>
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
            {error != null ? <div css={errorSection}>{error}</div> : null}
            {uploading ? (
              <DownloadingIcon fontSize="large" css={loadingIcon} />
            ) : null}
            <div css={imgScrollWrapper}>
              {curImageId != null ? (
                <img
                  // hideHint
                  css={contextImg}
                  // zoomScale={2}
                  src={`${
                    import.meta.env.VITE_DIRECTUS_URL
                  }/assets/${curImageId}`}
                />
              ) : null}
            </div>
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
        </ReflexElement>
      </ReflexContainer>
    </Section>
  );
}

export default EntrySection;
