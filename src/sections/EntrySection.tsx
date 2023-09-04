import { cx, css as cssClass } from "@emotion/css";
import { css } from "@emotion/react";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import GlyphTyper from "../components/GlyphTyper";
import Section from "./Section";
import Word from "../components/Word";
import storage from "../storage";
import { uploadFiles } from "@directus/sdk";
import DownloadingIcon from "@mui/icons-material/Downloading";
import { isEmpty } from "lodash";
import { saveAction } from "../redux/store";
import { addWord } from "../redux/reducers/data";

const entrySectionWrapper = css`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: space-between;

  flex: 1 1 auto;
  padding: 12px;
`;

const textSection = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px dashed var(--slate-600);
  flex: 1 0 auto;
  max-width: 25vw;
`;

const textWrapper = css`
  flex: 1 1 auto;
  min-height: 30px;
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
  padding-top: 8px;
  flex: 1 1 auto;
  min-height: 30px;
`;

const submitButton = cssClass`
  margin-bottom: 8px;
`;

const typerWrapper = css`
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
`;

const imgSection = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 1 auto;
  max-width: 25vw;
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
  height: 100%;
`;

const contextImg = css`
  max-height: 100%;
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

function EntrySection() {
  const dispatch = useDispatch();
  const [text, setText] = useState<number[][]>([]);
  const [curWord, setCurWord] = useState<number[]>([]);
  const [curContext, setCurContext] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);

  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);

  const addGraphemeToWord = (val: number) => {
    setCurWord(curWord.concat([val]));
  };

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
        const response = await storage.request(uploadFiles(formData));
        setCurContext(response.filename_disk);
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
    <Section title="Entry" style={{ flex: "0 1 auto" }}>
      <div css={entrySectionWrapper}>
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
        <div
          tabIndex={0}
          css={typerWrapper}
          onFocus={() => {
            if (curContext != null) {
              setIsTyping(true);
            }
          }}
          onBlur={() => {
            setIsTyping(false);
          }}
        >
          <button
            className={cx({
              disabled: isEmpty(text) || isEmpty(curContext),
              [submitButton]: true,
            })}
            onClick={async () => {
              if (
                !isEmpty(text) &&
                !isEmpty(curContext) &&
                curContext != null
              ) {
                const submit = confirm("Submit Text with Context?");
                if (submit) {
                  for (let word of text) {
                    await saveAction(dispatch, addWord, {
                      word: word,
                      ctx: curContext,
                    });
                  }
                  setText([]);
                  setCurContext(null);
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
        <div css={imgSection}>
          <label htmlFor="fileInput">{curContext ?? "Add Context"}</label>
          <input
            disabled={curContext != null}
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
            {curContext != null ? (
              <img
                css={contextImg}
                src={`${
                  import.meta.env.VITE_DIRECTUS_URL
                }/assets/${curContext}`}
              />
            ) : null}
          </div>
          <button
            className={cx({
              disabled: isEmpty(curContext),
              [clearButton]: true,
            })}
            onClick={() => {
              if (curContext) {
                const clear = confirm("Clear Context?");
                if (clear) {
                  setCurContext(null);
                }
              }
            }}
          >
            Clear Context
          </button>
        </div>
      </div>
    </Section>
  );
}

export default EntrySection;
