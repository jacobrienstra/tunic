import { css } from "@emotion/react";
import GlyphsSection from "./sections/GlyphsSection";
import ContextsSection from "./sections/ContextsSection";
import EntrySection from "./sections/EntrySection";
import WordsSection from "./sections/WordsSection";
import "react-inner-image-zoom/lib/InnerImageZoom/styles.min.css";
import "react-reflex/styles.css";
import { ReflexContainer, ReflexSplitter, ReflexElement } from "react-reflex";

const rootLayout = css`
  width: 100%;
  margin: 0;
  height: 100vh;
`;

function App() {
  return (
    <ReflexContainer
      orientation="vertical"
      windowResizeAware={true}
      css={rootLayout}
    >
      <ReflexElement size={100} style={{ overflow: "hidden" }}>
        <GlyphsSection />
      </ReflexElement>
      <ReflexSplitter propagate />
      <ReflexElement size={250} style={{ overflow: "hidden" }}>
        <WordsSection />
      </ReflexElement>
      <ReflexSplitter propagate />
      <ReflexElement size={200} style={{ overflow: "hidden" }}>
        <ContextsSection />
      </ReflexElement>
      <ReflexSplitter propagate />
      <ReflexElement minSize={250} style={{ overflow: "hidden" }}>
        <EntrySection />
      </ReflexElement>
    </ReflexContainer>
  );
}

export default App;
