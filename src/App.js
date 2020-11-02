import React from 'react';
import './App.css';
import { stringToGrid, norvigSolve } from './solver'
import Graph from 'vis-react';

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
  stats: {},
  edges: [],
  nodes: [],
}

const NEW_SUDOKU = 'NEW_SUDOKU'
const PUZZLE_INPUT_ERROR = 'PUZZLE_INPUT_ERROR'
const START_SOLVING = 'START_SOLVING'
const FINISH_SOLVING = 'FINISH_SOLVING'

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
        stats: action.payload.stats,
        edges: action.payload.edges,
        nodes: action.payload.nodes,
      }
    default:
      return state;
  }
}

function GridCell({value, row, col}) {
  return <div style={{
    display: 'inline-block',
    width: '2rem',
    height: '2rem',
    textAlign: 'center',
    lineHeight: '2rem',
    border: '1px solid black',
    borderRight: (col === 2 || col === 5) && '2px solid black',
    borderBottom: (row === 2 || row === 5) && '2px solid black',
    color: value === '.' ? 'transparent' : 'initial'
  }}>{value}</div>
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
    nodes, edges
  } = state;

  // Worker needs to be in a ref so its not lost on rerenders.
  const workerRef = React.useRef()

  React.useEffect(() => {
    workerRef.current = new Worker('./solver-worker.js')

    // Dispatch action when worker is done its job.
    workerRef.current.onmessage = e => {
      const [solution, stats] = e.data

      dispatch({
        type: FINISH_SOLVING,
        payload: {
          solution: stringToGrid(solution),
          stats,
          end: new Date().getTime(),
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
    const [solution, stats] = norvigSolve(sudokuStr)

    const end = Date.now()
    const stack = [stats.tree]
    const edges = []
    const nodes = []
    while(stack.length) {
      const current = stack.pop()
      nodes.push({ id: current.val, label: current.val })
      edges.push({ from: current.parent ? current.parent.val : null, to: current.val })
      if (current.children.length) {
        stack.push(...current.children)
      }
    }

    setTimeout(() => {
      dispatch({
        type: FINISH_SOLVING,
        payload: {
          solution: stringToGrid(solution),
          stats,
          end,
          edges,
          nodes,
        }
      })
    }, 1000)


    // workerRef.current.postMessage(sudokuStr)
  }

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
          <button disabled={solving} data-qa="solve-button" className="solve" onClick={handleSolveClick}>Solve</button>
          <p style={{
            visibility: solving ? 'visible' : 'hidden'
          }}>
            Solving.......
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
        solved && [<Statistics
          start={benchmark.start}
          end={benchmark.end}
          callStackCount={stats.callstackCount}
          treesCreated={stats.treesCreated}
        />,
        <Graph
          styles={{
            wdith: 1600,
            height: 1000,
          }}
          graph={{
            nodes,
            edges,
          }}
          options={{
            layout: {
              hierarchical:true,
            }
          }}
        />
        ]
      }
    </div>
  );
}

export default App;
