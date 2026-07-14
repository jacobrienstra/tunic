import TrunesSection from "./layout/TrunesSection";

import WordsSection from "@/layout/WordsSection";
import GraphemesSection from "@/layout/GraphemesSection";
import ContextsSection from "@/layout/ContextsSection";
import {
  DerivedMeaningContext,
  useComputeDerivedMeaning,
} from "@/data/ruleset";
import { GlyphDefs } from "@/components/Glyph";

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
