import { css } from "@emotion/react";
import GlyphsSection from "./components/GlyphsSection";
import ContextsSection from "./components/ContextsSection";
import EntrySection from "./components/EntrySection";
import WordsSection from "./components/WordsSection";

const rootLayout = css`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin: 0;
  height: 100vh;
`;

function App() {
  return (
    <main css={rootLayout}>
      <GlyphsSection />
      <WordsSection />
      <ContextsSection />
      <EntrySection />
    </main>
  );
}

export default App;
