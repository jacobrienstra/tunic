import { css } from "@emotion/react";

import TrunesSection from "./TrunesSection";
import Section from "./Section";
import GraphemesSection from "./GraphemesSection";

const columnsWrapper = css`
  display: flex;
  flex-direction: row;
  height: 100%;
`;

function GlyphsSection() {
  return (
    <Section title="Glyphs">
      <div css={columnsWrapper}>
        <GraphemesSection />
        <TrunesSection />
      </div>
    </Section>
  );
}

export default GlyphsSection;
