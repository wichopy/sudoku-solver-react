import React from 'react';
import './App.css';
import { solver, stringToGrid } from './solver'

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
        inputError: 'Sudoku puzzle must be 81 characters long with only numbers or `.`s to represent empty cells'
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
  } = state;

  function handleInputChange(ev) {
    if (ev.target.value.length !== 81) {
      dispatch({ type: PUZZLE_INPUT_ERROR })
      return
    }

    dispatch({ type: NEW_SUDOKU, payload: ev.target.value })
  }

  function selectAll(ev) {
    ev.target.select()
  }

  function handleSolveClick() {
    dispatch({
      type: START_SOLVING,
      payload: { start: new Date().getTime()}
    })
    const [solution, stats] = solver(sudokuStr)
    dispatch({
      type: FINISH_SOLVING,
      payload: {
        solution,
        stats,
        end: new Date().getTime(),
      }
    })
  }

  return (        
    <div className="App">
      <h1>Sudoku Solver</h1>
      <p>
        Puzzle Definition:
      </p>
      <textarea
        data-qa="puzzle-definition"
        className="puzzle-definition"
        disabled={solving}
        onClick={selectAll}
        onChange={handleInputChange}
        value={sudokuStr}
        rows="4"
      />
      <div>
        <a href="http://magictour.free.fr/top95" target="blank">Find more sudokus here</a>
      </div>
      <p className="error-text" data-qa="input-error">
        {inputError}
      </p>
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
          <button data-qa="solve-button" className="solve" onClick={handleSolveClick}>Solve</button>
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
        solved && <Statistics
          start={benchmark.start}
          end={benchmark.end}
          callStackCount={stats.callstackCount}
          treesCreated={stats.treesCreated}
        />
      }
    </div>
  );
}

export default App;
