import WordsSection from "./sections/WordsSection";
import TrunesSection from "./sections/TrunesSection";
import GraphemesSection from "./sections/GraphemesSection";
// import EntrySection from "./sections/EntrySection";
import ContextsSection from "./sections/ContextsSection";
import GlyphDefs from "./components/GlyphDefs";

import "react-inner-image-zoom/lib/InnerImageZoom/styles.min.css";
import "react-reflex/styles.css";

function App() {
  return (
    <div className="flex h-full flex-col">
      <GlyphDefs />
      <GraphemesSection />
      <TrunesSection />
      <WordsSection />
      <ContextsSection />
      {/* <EntrySection /> */}
    </div>
  );
}

export default App;
