import { css } from "@emotion/react";

import Section from "./Section";
import GlyphPartsSection from "./GlyphPartsSection";
import FullGlyphsSection from "./FullGlyphsSection";

const columnsWrapper = css`
  display: flex;
  flex-direction: row;
  height: 100%;
`;

function GlyphsSection() {
  return (
    <Section title="Glyphs">
      <div css={columnsWrapper}>
        <GlyphPartsSection />
        <FullGlyphsSection />
      </div>
    </Section>
  );
}

export default GlyphsSection;
