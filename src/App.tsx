import WordsSection from "./sections/WordsSection";
import TrunesSection from "./sections/TrunesSection";
import GraphemesSection from "./sections/GraphemesSection";
// import EntrySection from "./sections/EntrySection";
import ContextsSection from "./sections/ContextsSection";
import {
  DerivedMeaningContext,
  useComputeDerivedMeaning,
} from "./data/ruleset";
import GlyphDefs from "./components/GlyphDefs";

function App() {
  const derivedMeaning = useComputeDerivedMeaning();

  return (
    <DerivedMeaningContext value={derivedMeaning}>
      <div className="flex h-full flex-col">
        <GlyphDefs />
        <GraphemesSection />
        <TrunesSection />
        <WordsSection />
        <ContextsSection />
        {/* <EntrySection /> */}
      </div>
    </DerivedMeaningContext>
  );
}

export default App;
