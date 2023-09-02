import { css } from "@emotion/react";
import Section from "./Section";
import Filters from "./Filters";
import NGrams from "./NGrams";

const columnsWrapper = css`
  display: flex;
  flex-direction: row;
  height: 100%;
`;

function GlyphsSection() {
  return (
    <Section title="Glyphs" style={{ flex: "0 1 auto" }}>
      <div css={columnsWrapper}>
        <Filters />
        <NGrams />
      </div>
    </Section>
  );
}

export default GlyphsSection;
