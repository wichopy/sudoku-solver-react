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

const digits = "123456789";
const rows = "ABCDEFGHI";

function cross(A, B) {
  const result = [];

  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < B.length; j++) {
      result.push(A.charAt(i) + B.charAt(j));
    }
  }
  return result;
}

const squares = cross(rows, digits);

const unitlist = [].concat(
  digits.split("").map((c) => cross(rows, c)),
  rows.split("").map((r) => cross(r, digits)),
  (() => {
    const result = [];
    const rowSquares = ["ABC", "DEF", "GHI"];
    const colSquares = ["123", "456", "789"];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        result.push(cross(rowSquares[i], colSquares[j]));
      }
    }

    return result;
  })()
);

/**
 * @type {Object <string, Array<string>>}
 */
const units = squares.reduce((result, current) => {
  if (!result[current]) {
    result[current] = []
  }
  for (let unit of unitlist) {
    if (unit.includes(current)) {
      result[current].push(unit)
    }
  }

  return result
}, {});

/**
 * @type {Object <string, Set<string>>}}
 */
const peers = squares.reduce((result, current) => {
  result[current] = new Set()
  units[current].forEach(u => u.forEach(s => result[current].add(s)))
  result[current].delete(current)
  return result
}, {});

// console.log(peers)
/**
 *
 * @param {string} grid
 * @returns {Object <string, string>}
 */
const parseGrid = (grid) => {
  const values = squares.reduce((result, s) =>{
    result[s] = digits
    return result
  }, {})

  for (let entry of Object.entries(gridValues(grid))) {
    const [square, digit] = entry
    if (digits.includes(digit) && !assign(values, square, digit)) {
      return false;
    }
  }

  return values
}

const gridValues = (grid) => {
  const result = {}
  for (let i = 0; i < 81; i++) {
    result[squares[i]] = grid.charAt(i)
  }

  return result;
}

//     /**
//      *
//      * @param {Object <string, string>} values
//      * @param {string} square
//      * @param {string} digit
//      */
function assign(values, square, digit) {
  const otherValues = values[square].replace(digit, '')

  for (let i = 0; i < otherValues.length; i++) {
      const d2 = otherValues[i]
      const result = eliminate(values, square, d2)

      if (!result) return false
  }

    return values;
}

//     /**
//      *
//      * @param {Object <string, string>} values
//      * @param {string} square
//      * @param {string} digit
//      */
function eliminate(values, square, digit) {
  if (!values[square].includes(digit)) {
    return values
  }

  values[square] = values[square].replace(digit, '')
  if (values[square].length === 0) {
    return false
  } else if(values[square].length === 1)  {
    const digitToPropogate = values[square]
    const peerCells = Array.from(peers[square])
    for (let i = 0; i < peerCells.length; i++) {
        const s = peerCells[i]
        const result = eliminate(values, s, digitToPropogate)
        if (!result) return false
    }
  }

  for (let u of units[square]) {
    const dplaces = u.filter(s => values[s].includes(digit))

    if (dplaces.length === 0) {
      return false
    } else if (dplaces.length === 1) {
      if (!assign(values, dplaces[0], digit)) {
        return false
      }
    }
  }

  return values
}

function findMinSquare(values) {
  return Object.entries(values).reduce((answer, entry) => {
    const [square, digits] = entry
    if (digits.length < answer[0] && digits.length > 1) {
      answer = [digits.length, square]
    }

    return answer
  }, [Infinity, null])
}

function valuesToStr(values){
  const result = Array(81)
  Object.entries(values).forEach(entry => {
    result[squares.indexOf(entry[0])] = entry[1]
  })
  return result.join('')
}


//     /**
//      *
//      * @param {Object <string,string>} values
//      */
function search(values) {
  if (!values) {
    return false
  }

  if (Object.values(values).every(value => value.length === 1)) {
    return values
  }

  const [_, nextTry] = findMinSquare(values)


  return values[nextTry].split('').reduce((answer, d) => {
    if (answer) return answer
    const solution = search(assign({...values}, nextTry, d))
    if (solution) {
      return solution
    }
  }, false)
}

export function norvigSolve(grid) {
  return valuesToStr(search(parseGrid(grid)))
}
