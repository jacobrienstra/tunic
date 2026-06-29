import TrunesSection from "./TrunesSection";
import Section from "./Section";
import GraphemesSection from "./GraphemesSection";

function GlyphsSection() {
  return (
    <Section title="Glyphs">
      <div className="flex h-full flex-row">
        <GraphemesSection />
        <TrunesSection />
      </div>
    </Section>
  );
}

export default GlyphsSection;
