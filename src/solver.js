// Use Heap methods for prioritizing answers to cells.
const { Heap } = require('heap-js')

// Store possible answers for a cell as a tuple [row, col, answers]
// Use the length of the tuple as the score for min heap
const comparator = (a,b) => a[2].length - b[2].length

export function solver(sudokuStr) {
  const grid = stringToGrid(sudokuStr)
  // Meta data
  let callstackCount = 1
  let treesCreated = 1
  // const actions = []

  // Use backtracking DFS algorithm to solve the sudoku puzzle
  function backtrack(grid) {
    let emptyCellHeap = []
    callstackCount += 1

    // 1. Find all possible answers for each cell
    // console.log('Find all possible answers')
    for (let row = 0; row < 9; row++) {
      for(let col = 0; col < 9; col++) {
        if (grid[row][col] === '.') {
          const cellPossibleAnswers = possibleAnswers(row, col, grid)
          if (cellPossibleAnswers.length === 0) {
            // 3. [Backtracking stop condition] no possible answers, there should be at least 1 for each cell. Return to parent
            // console.log('No possible answers, backtrack')
            return false
          }
          // Prioritize the answers using heap.
          Heap.heappush(emptyCellHeap, [row, col, cellPossibleAnswers], comparator)
        }
      }
    }

    // 2. Solve cells with least possible answers first.
    // console.log('Attempt to solve')
    while (emptyCellHeap.length) {
      const prioritizedAnswer = Heap.heappop(emptyCellHeap, comparator)
      const [row, col, answers] = prioritizedAnswer
      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i]
        // actions.push(`+${row} ${col} ${answer}`)
        grid[row][col] = answer
        treesCreated += 1
        if (backtrack(grid)) {
          // 7. The solution is found, clear all functions in the call stack
          // console.log('Found solution, clear functions in callstack')
          return true
        } else {
          // 4. Subtree failed, set to empty and try the next answer
          // console.log('Solution didnt work, try next answer')
          grid[row][col] = '.'
          // actions.push(`-${row} ${col} ${answer}`)
        }
      }

      // 5. [Backtracking stop condition] no answers work for this solution set, go back up to parent decision
      // console.log('None of the answer subtree worked, backtrack')
      callstackCount -= 1
      return false
    }

    // 6. Solved sudoku!!
    // console.log('A solution is found!')
    return true
  }

  backtrack(grid)

  return [grid, {
    // actions,
    treesCreated,
    callstackCount,
  }]
}

function possibleAnswers(row, col, grid) {
  const result = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9'])
  for (let i = 0; i < 9; i++) {
    if (grid[i][col] !== '.') {
      result.delete(grid[i][col])
    }

    if (grid[row][i] !== '.') {
      result.delete(grid[row][i])
    }
  }

  let squareCol = clampToSquare(col)
  let squareRow = clampToSquare(row)
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[squareRow+i][squareCol + j] !== '.') {
        result.delete(grid[squareRow+i][squareCol + j])
      }
    }
  }

  return Array.from(result)
}

export function stringToGrid(sudokuString) {
  const values = sudokuString.split('')
  const result = Array(9)
  let row = 0
  let col = 0
  let count = 0
  for (let i = 0; i < values.length; i++) {
    if (!result[row]) {
      result[row] = []
    }
    result[row][col] = values[i]

    col += 1
    count += 1
    if (count === 9) {
      row += 1
      col = 0
      count = 0
    }
  }

  return result
}

function gridToStr(grid) {
  let result = ''
  for(let row = 0; row<9; row++) {
    for (let col = 0; col < 9; col++) {
      result += grid[row][col]
    }
  }

  return result
}

function clampToSquare(val) {
  if (val < 3) {
    return 0
  } else if (val < 6) {
    return 3
  }

  return 6
}
