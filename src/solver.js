export function solver(grid) {
  
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

export function isValidMove(row, col, sudoku, value) {
  for (let i = 0; i < 9; i++) {
    if (sudoku[row][i] === ""+value) {
      return false
    }
    if (sudoku[i][col] === ""+value) {
      return false
    }
  }

  let squareCol = clampToSquare(col)
  let squareRow = clampToSquare(row)
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (sudoku[squareRow+i][squareCol + j] === ""+value) {
        return false
      }
    }
  }

  return true
}

function clampToSquare(val) {
  if (val < 3) {
    return 0
  } else if (val < 6) {
    return 3
  }

  return 6
}