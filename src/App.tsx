import './App.css'
import GlyphTyper from './components/GlyphTyper';
import Glyph from './components/Glyph';
import { getCombo } from './glyph';

function App() {

  const emit = (val: number) => {

  }

  const glyphs = [];

  for (let i = 0; i < 64; i++) {
    for (let j = 0; j < 64; j++) {
      glyphs.push(<Glyph val={getCombo(i, j)} />)
    }
  }
  
  
  return (
    <div>
      <div>
        {glyphs}
      </div>
      <GlyphTyper emit={emit} />
    </div>
  )
}

export default App
