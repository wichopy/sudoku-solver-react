import React from 'react';
import './App.css';
import { stringToGrid, norvigSolve } from './solver'
// Consider react-sigma for graph https://www.npmjs.com/package/react-sigma#usage
import Graph from 'vis-react';
import {Sigma, RandomizeNodePositions, RelativeSize,  EdgeShapes, ForceAtlas2} from 'react-sigma';
import GridCell from './GridCell';

function rowcolToValue(i, j) {
  const row = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D',
    4: 'E',
    5: 'F',
    6: 'G',
    7: 'H',
    8: 'I',
  }

  const col = {
    0: '1',
    1: '2',
    2: '3',
    3: '4',
    4: '5',
    5: '6',
    6: '7',
    7: '8',
    8: '9',
  }

  return `${row[i]}${col[j]}`
}

function heatMapColorforValue(value){
  var h = (1.0 - value) * 240
  return "hsl(" + h + ", 100%, 50%)";
}

function Replay({ steps, max }) {
  const [index, setIndex] = React.useState(0)
  const [playing, setPlay] = React.useState(false)
  const [showPropogations, setShowPropogations] = React.useState(false)
  const [stopOnFailures, setStopOnFailures] = React.useState(false)
  const [speed, setSpeed] = React.useState(16)
  const [stackPosition, setStackPosition] = React.useState(0)
  const [values, gridMetaData, msg, type, status, callStackCount, stackVisual] = steps[index]
  const timeout = React.useRef(null)

  React.useEffect(() => {
    if (index === steps.length - 1) {
      clearTimeout(timeout.current)
      setPlay(false)
    }

    if (stopOnFailures && status === 'failure') {
      clearTimeout(timeout.current)
      setPlay(false)
    }

    if (playing) {
      timeout.current = setTimeout(() => {
        let nextIndex = index+1
        if (!showPropogations) {
          while (steps[nextIndex][3] === 'Propogating') {
            nextIndex += 1
          }
        }
        setIndex(nextIndex)

        timeout.current=setTimeout(() => {
          let nextIndex = index+1
          if (!showPropogations) {
            while (steps[nextIndex][3] === 'Propogating') {
              nextIndex += 1
            }
          }
          setIndex(nextIndex)
        }, speed)
      }, speed)
    } else {
      clearTimeout(timeout.current)
    }
  }, [index, playing])


  function getNextIndex() {
    let nextIndex = index+1
    if (!showPropogations) {
      while (steps[nextIndex][3] === 'Propogating') {
        nextIndex += 1
      }
    }

    return nextIndex
  }

  function getPrevIndex() {
    let nextIndex = index-1
    if (!showPropogations) {
      while (steps[nextIndex][3] === 'Propogating') {
        nextIndex -= 1
      }
    }

    return nextIndex
  }

  function nextAttempt() {
    let nextIndex = index+1
    while (steps[nextIndex][3] === 'Propogating') {
      nextIndex += 1
    }

    return nextIndex
  }

  return <>
    <h3>Replay</h3>
    <button disabled={stackVisual.length === stackPosition} onClick={() => setStackPosition(stackPosition + 1)}>
      PrevStack
    </button>
    <button disabled={stackPosition === 0} onClick={() => setStackPosition(stackPosition - 1)}>
      NextStack
    </button>
    {
      stackPosition !== 0 ? stackVisual.slice(-1 * stackPosition)[0][2] : `Current Solution: ${gridMetaData.currentSolution}  - ${gridMetaData.lastAttempt}`
    }
    <div className="sudoku">
      {Array(9).fill(Array(9).fill('')).map((row, i) => <div className="sudoku-row">
        {stackPosition === 0 ? row.map(
          (col, j) => {
            // values[rowcolToValue(i,j)].length > 1 ||
            return <GridCell key={i+":"+j} isPicked={gridMetaData[rowcolToValue(i,j)].isPicked} row={i} col={j} value={!values[rowcolToValue(i,j)] ? '.' : values[rowcolToValue(i,j)]}
              styles={{
                backgroundColor: (() => {
                  if (gridMetaData.squareInFocus === rowcolToValue(i,j)) return 'yellow'
                  if (gridMetaData.dplacesCheck && gridMetaData.dplacesCheck.includes(rowcolToValue(i,j))) return 'purple'
                  if (gridMetaData[rowcolToValue(i,j)].solutionState === 'given') return '#263238'
                  if (gridMetaData[rowcolToValue(i,j)].solutionState === 'exploring') return 'aqua' //return heatMapColorforValue(gridMetaData[rowcolToValue(i,j)].parentSolution / max)
                  if (gridMetaData[rowcolToValue(i,j)].solutionState === 'potentialAnswer') return '#c8e6c9'
                })(),
                color: (() => {
                  if (gridMetaData[rowcolToValue(i,j)].solutionState === 'given') return 'white'
                  if (gridMetaData[rowcolToValue(i,j)].isPicked) return 'yellow'
                  return 'initial'
                })(),
              }}
            />
          }
        ) : row.map((col, j) => {
          // values[rowcolToValue(i,j)].length > 1 ||
          return <GridCell
            styles={{
              backgroundColor: (() => {
                if (stackVisual.slice(-1 * stackPosition)[0][1].includes(rowcolToValue(i,j))) return 'aqua' //return heatMapColorforValue(gridMetaData[rowcolToValue(i,j)].parentSolution / max)
              })(),
            }}
            key={i+":"+j} row={i} col={j} value={!stackVisual.slice(-1 * stackPosition)[0][0][rowcolToValue(i,j)] ? '.' : stackVisual.slice(-1 * stackPosition)[0][0][rowcolToValue(i,j)]} />
        })}
      </div>)}
    </div>
    <div>
      <p style={{ height: '50px'}}>
        {msg}
      </p>
      <p>Callstacks:        {callStackCount}</p>
      <div>
        <button onClick={() => setIndex(0)}>{'Back to start'}</button>
        <button disabled={index === 0} onClick={() => setIndex(getPrevIndex())}>back</button>
        <button disabled={index === steps.length - 1} onClick={() => setIndex(getNextIndex())}>next</button>
        <button onClick={() => setIndex(steps.length - 1)}>{'To end'}</button>
      </div>
      <div>
        <button onClick={() => setPlay(!playing)}>{!playing ? 'Play': 'Pause'}</button>
      </div>
      <div>
        <button onClick={() => setIndex(nextAttempt())}>Go to next attempt</button>
      </div>
      <div>
        <label>
          Show Propogations
          <input type="checkbox" checked={showPropogations} onChange={() => setShowPropogations(!showPropogations)}/>
        </label>
      </div>
      <div>
        <label>
          Stop on failures
          <input type="checkbox" checked={stopOnFailures} onChange={() => setStopOnFailures(!stopOnFailures)}/>
        </label>
      </div>
      <div>
        <label>
          Set interval
          <input type="number" value={speed} onChange={(ev) => setSpeed(ev.target.value)} />
        </label>
      </div>
    </div>
  </>
}

const sudokuRegex = /^[1-9.]*$/

const defaultState = {
  sudokuStr: '..7..8.....6.2.3...3......9.1..5..6.....1.....7.9....2........4.83..4...26....51.',
  solvedGrid: Array(9).fill(Array(9).fill('.')),
benchmark: {
    start: null, end: null,
  },
  solving: false,
  solved: false,
  inputError: '',
  stats: null,
  edges: [],
  nodes: [],
}

const NEW_SUDOKU = 'NEW_SUDOKU'
const PUZZLE_INPUT_ERROR = 'PUZZLE_INPUT_ERROR'
const START_SOLVING = 'START_SOLVING'
const FINISH_SOLVING = 'FINISH_SOLVING'
const LOAD_REPLAY = 'LOAD_REPLAY'

const reducer = (state, action) => {
  switch (action.type) {
    case NEW_SUDOKU:
      return {
        ...defaultState,
        sudokuStr: action.payload
      }
    case PUZZLE_INPUT_ERROR:
      return {
        ...defaultState,
        sudokuStr: state.sudokuStr,
        inputError: action.payload,
      }
    case START_SOLVING:
      return {
        ...defaultState,
        sudokuStr: state.sudokuStr,
        benchmark: {
          start: action.payload.start,
          end: null,
        },
        solving: true,
      }
    case FINISH_SOLVING:
      return {
        ...state,
        solvedGrid: action.payload.solution,
        benchmark: {
          ...state.benchmark,
          end: action.payload.end
        },
        solving: false,
        solved: true,
      }
    case LOAD_REPLAY:
      return {
        ...state,
        stats: action.payload.stats,
        edges: action.payload.edges,
        nodes: action.payload.nodes,
        // sigmaEdges: action.payload.sigmaEdges,
      }
    default:
      return state;
  }
}

function Statistics({
  end, start, callStackCount,
  treesCreated
}) {
  return <div data-qa="statistics">
    <h3>Statistics</h3>
    <p>
      Time to solve: {end && start && `${(end - start) / 1000}  seconds`}
    </p>
    <p>
      Number of call stacks needed: {callStackCount}
    </p>
    <p>
      Number of subtrees explored: {treesCreated}
    </p>
  </div>
}

function App() {
  const [state, dispatch] = React.useReducer(reducer, defaultState)
  const {
    sudokuStr,
    solvedGrid,
    benchmark,
    solving,
    solved,
    inputError,
    stats,
    nodes, edges, sigmaEdges
  } = state;
  const [makingReplay, setMakingReplay] = React.useState(false)
  // Worker needs to be in a ref so its not lost on rerenders.
  const workerRef = React.useRef()

  React.useEffect(() => {
    workerRef.current = new Worker('./solver-worker.js')

    // Dispatch action when worker is done its job.
    workerRef.current.onmessage = e => {
      const [solution, stats] = e.data
      setMakingReplay(false)
      dispatch({
        type: LOAD_REPLAY,
        payload: {
          stats,
          edges: stats.tree.edges,
          nodes: stats.tree.nodes,
          // sigmaEdges
        }
      })
    }
  }, [])

  function handleInputChange(ev) {
    if (!sudokuRegex.test(ev.target.value)) {
      dispatch({ type: PUZZLE_INPUT_ERROR, payload: 'Chacters must be 1-9 or .' })
      return
    }

    if (ev.target.value.length !== 81) {
      dispatch({ type: PUZZLE_INPUT_ERROR, payload: 'Sudoku puzzle must be 81 characters long with only numbers or `.`s to represent empty cells. Only pasting of a valid sudoku string is support at the moment.'})
      return
    }

    dispatch({ type: NEW_SUDOKU, payload: ev.target.value })
  }

  function selectAllAndPasteIfValid(ev) {
    ev.target.select()

    navigator.clipboard.readText().then(clipText => {
      if (sudokuRegex.test(clipText) ) {
        dispatch({ type: NEW_SUDOKU, payload: clipText })
      }
    })
  }

  function handleSolveClick() {
    dispatch({
      type: START_SOLVING,
      payload: { start: new Date().getTime()}
    })

    // Outsource computation to background thread.
    workerRef.current.postMessage(sudokuStr)

    const solution = norvigSolve(sudokuStr)
    setMakingReplay(true)
    dispatch({
      type: FINISH_SOLVING,
      payload: {
        solution: stringToGrid(solution),
        end: new Date().getTime(),
      }
    })

  }
  // let myGraph = {nodes:nodes, edges: sigmaEdges};
  return (
    <div className="App">
      <h1>Sudoku Solver</h1>
      <p>
        Copy a sudoku puzzle and click below:
      </p>
      <textarea
        data-qa="puzzle-definition"
        className="puzzle-definition"
        disabled={solving}
        onClick={selectAllAndPasteIfValid}
        onChange={handleInputChange}
        value={sudokuStr}
        rows="4"
      />
      <p className="error-text" data-qa="input-error">
        {inputError}
      </p>
      <div>
        <a href="http://magictour.free.fr/top95" target="blank">Find more sudokus here</a>
      </div>

      <div className="solver-area">
        <div className="item">
          <h3>Input</h3>
          <div className="sudoku">
            {stringToGrid(sudokuStr).map((row, i) => <div>
              {row.map(
                (col, j) => <GridCell key={i+":"+j} row={i} col={j} value={col} />
              )}
            </div>)}
          </div>
        </div>

        <div className="item">
          <button disabled={solving || solved} data-qa="solve-button" className="solve" onClick={handleSolveClick}>Solve</button>
          <p style={{
            visibility: solving ? 'visible' : 'hidden'
          }}>
            Solving.......
          </p>

          <p style={{
            visibility: makingReplay ? 'visible' : 'hidden'
          }}>
            Making replay...
          </p>
        </div>

        <div className="item">
          <h3>Result</h3>
          <div className="sudoku">
            {solvedGrid.map((row, i) => <div>
              {row.map(
                (col, j) => <GridCell key={i+":"+j} row={i} col={j} value={col} />
              )}
            </div>)}

          </div>
        </div>
      </div>

      {
        solved && stats && [<Statistics
          start={benchmark.start}
          end={benchmark.end}
          callStackCount={stats.callstackCount}
          treesCreated={stats.treesCreated}
        />,
        <div style={{
          display: 'flex',
          alignItems: 'center',
          alignContent: 'center',
          width: '100%',
          flexDirection: 'column',
        }}>
          <Replay steps={stats.steps} max={stats.treesCreated}/>,
        </div>,
        <div style={{ height: '800px', margin: '30px'}}>
          <h3>Decision Tree</h3>
          <Graph
            graph={{
              nodes: nodes,
              edges: edges,
            }}
            options={{
              layout: {
                hierarchical:true,
              }
            }}
          />,
        </div>
        // <div>
        //   <Sigma graph={myGraph} settings={{ drawEdges: true, drawEdgeLabels: true }} >
        //     <EdgeShapes default="curvedArrow"/>
        //     <RandomizeNodePositions>
        //       <RelativeSize initialSize={15} />
        //       <ForceAtlas2 iterationsPerRender={1} timeout={10000}/>
        //     </RandomizeNodePositions>
        //   </Sigma>
        // </div>
        ]
      }
    </div>
  );
}

export default App;
