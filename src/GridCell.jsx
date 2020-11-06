import React from 'react'

function GridCell({value, row, col, styles, isPicked }) {
  return <div style={{
    display: 'inline-block',
    width: '2rem',
    height: '2rem',
    textAlign: 'center',
    // lineHeight: '2rem',
    border: '1px solid black',
    borderRight: (col === 2 || col === 5) && '2px solid black',
    borderBottom: (row === 2 || row === 5) && '2px solid black',
    color: value === '.' ? 'transparent' : 'initial',
    ...styles,
  }} className={isPicked ? 'is-picked' : ''}>
    {value.length === 1 ? <div
      style={{
        top: '50%',
        left: '50%'
      }}
    >
        {value}
      </div> : (
      <div
        style={{ position: 'relative', height: '100%', 'fontSize': '10px'}}
      >
        {value.split('').map((value, i) => {
          return <div
          style={{
            position: 'absolute',
            top: (() => {
              if (value < '4') return '0%'
              if (value < '7') return '30%'
              return '60%'
            })(),
            left: (() => {
              if (value === '1' || value === '4' || value === '7') return '0%'
              if (value === '2' || value === '5' || value === '8') return '30%'
              return '60%'
            })()
          }}
          >
            {value}
          </div>
        })}
      </div>
    )}
  </div>
}

export default GridCell;
