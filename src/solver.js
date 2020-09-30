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