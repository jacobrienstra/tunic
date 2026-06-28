import { ReflexContainer, ReflexSplitter, ReflexElement } from "react-reflex";
import { css } from "@emotion/react";

import WordsSection from "./sections/WordsSection";
import GlyphsSection from "./sections/GlyphsSection";
import EntrySection from "./sections/EntrySection";
import ContextsSection from "./sections/ContextsSection";
import GlyphDefs from "./components/GlyphDefs";

import "react-inner-image-zoom/lib/InnerImageZoom/styles.min.css";
import "react-reflex/styles.css";

const rootLayout = css`
  width: 100%;
  margin: 0;
  height: 100vh;
`;

function App() {
  return (
    <>
      <GlyphDefs />
      <ReflexContainer
        orientation="vertical"
        windowResizeAware={true}
        css={rootLayout}
      >
        <ReflexElement flex={3} style={{ overflow: "hidden" }}>
          <GlyphsSection />
        </ReflexElement>
        <ReflexSplitter propagate />
        <ReflexElement flex={1} style={{ overflow: "hidden" }}>
          <WordsSection />
        </ReflexElement>
        <ReflexSplitter propagate />
        <ReflexElement flex={2} style={{ overflow: "hidden" }}>
          <ContextsSection />
        </ReflexElement>
        <ReflexSplitter propagate />
        <ReflexElement flex={3} minSize={250} style={{ overflow: "hidden" }}>
          <EntrySection />
        </ReflexElement>
      </ReflexContainer>
    </>
  );
}

export default App;
