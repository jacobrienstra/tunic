import { css } from "@emotion/react";
import GlyphsSection from "./sections/GlyphsSection";
import ContextsSection from "./sections/ContextsSection";
import EntrySection from "./sections/EntrySection";
import WordsSection from "./sections/WordsSection";

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
