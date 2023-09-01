import { useState, useRef } from 'react';
import { css } from '@emotion/react';
import { glyphStrokes, W, ULV, LLV, LBC} from '../glyph'

const stroke = css`
  cursor: pointer;
`
const ghost = css`
  stroke: whitesmoke;
`
const solid = css`
  stroke: black;
`
interface GlyphTyperProps {
  emit: (val: number) => void;
  width?: number;
}

function GlyphTyper({width = 200}: GlyphTyperProps) {
  const [val, setVal] = useState(0);

  const unusedLines = [];
  const usedLines = [];
  
  // Omit 5 because that's the circle, special case
  for (const i of [0,1,2,3,4,6,7,8,9,10,11]) {
    if (val & (1 << i)) {
      usedLines.push({...glyphStrokes[1 << i], k: 1 << i})
    } else {
      unusedLines.push({...glyphStrokes[1 << i], k: 1 << i})
    }
  }
  if (val & (1 << 12)) {
    usedLines.push({...ULV, k: 1 << 12});
    usedLines.push({...LLV, k: 1 << 12});
  } else {
    unusedLines.push({...ULV, k: 1 << 12});
    unusedLines.push({...LLV, k: 1 << 12});
  }

  return <svg width={width} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox={`-5 -5 ${W + 10} 280`} style={{border: '1px dashed lightgrey'}}>  
    {unusedLines.map((l) => {
      return <line css={[ghost, stroke]} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" {...l} onClick={() => setVal(val ^ l.k)}/>
    })}

    <circle css={[val & (32) ? solid : ghost, stroke]} strokeWidth="10" {...LBC} fill="transparent" onClick={() => setVal(val ^ 32)}/>

    {/* Midline */ }
    <line css={[solid]} strokeWidth="10" strokeLinecap="round" strokeLinejoin='round' x1="0" x2={W} y1="125" y2="125" />

    {usedLines.map((l) => {
      return <line css={[solid, stroke]} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" {...l} onClick={() => setVal(val ^ l.k)}/>
    })}
  </svg>
}

export default GlyphTyper