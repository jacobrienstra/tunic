import { ReflexContainer, ReflexSplitter, ReflexElement } from "react-reflex";

import WordsSection from "./sections/WordsSection";
import EntrySection from "./sections/EntrySection";
import ContextsSection from "./sections/ContextsSection";
import GlyphDefs from "./components/GlyphDefs";

import "react-inner-image-zoom/lib/InnerImageZoom/styles.min.css";
import "react-reflex/styles.css";
import GraphemesSection from "./sections/GraphemesSection";
import TrunesSection from "./sections/TrunesSection";

function App() {
  return (
    <>
      <GlyphDefs />
      <GraphemesSection />
      <TrunesSection />
      <WordsSection />
      {/* <ContextsSection />
      <EntrySection /> */}
    </>
  );
}

export default App;
