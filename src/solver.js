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


// NORVIGS ALGO

// DATA SETUP
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

export const squares = cross(rows, digits);

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
export const units = squares.reduce((result, current) => {
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
export const peers = squares.reduce((result, current) => {
  result[current] = new Set()
  units[current].forEach(u => u.forEach(s => result[current].add(s)))
  result[current].delete(current)
  return result
}, {});

// VISUALIZING STATES
const squareStates = {
  'given': 'given',
  'unknown': 'unknown',
  'branchedOffRoot': 'branchedOffRoot',
  exploring: 'exploring',
  potentialAnswer: 'potentialAnswer',
}

let doneParsing = false

class Node {
  constructor(val, parent) {
    this.children = []
    this.val = val
    this.parent = parent
    this.partOfSolution = false
    this.finalLeaf = false
  }
}

const gridMetaData = squares.reduce((result, s) => {
  result[s] = {
    timesVisited: 0,
    solutionState: squareStates.unknown,
    parentSolution: null,
    currentSolution: null,
  }
  return result
}, {
  squareInFocus: null,
  failedSnapshots: []
})

const treeMetaData = {}
let tree = new Node('root', null)
let root = tree
let pointer = root
let steps = []

// INITIALIZE
export const gridValues = (grid) => {
  const result = {}
  for (let i = 0; i < 81; i++) {
    result[squares[i]] = grid.charAt(i)
  }

  return result;
}

/**
 *
 * @param {string} grid
 * @returns {Object <string, string>}
 */
export const parseGrid = (grid) => {
  doneParsing = false
  tree = new Node('root', null)
  root = tree
  pointer = root
  steps = []
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

  //Apply meta data
  for (let entry of Object.entries(values)) {
    const [s, d] = entry
    if (d.length === 1) {
      gridMetaData[s].solutionState = squareStates.given;
    } else {
      gridMetaData[s].solutionState = squareStates.unknown;
    }
  }

  steps.push([{...values}, JSON.parse(JSON.stringify(gridMetaData)), ' Initialize grid'])
  doneParsing = true

  return values
}


/**
 *
 * @param {Object <string, string>} values
 * @param {string} square
 * @param {string} digit
 */
function assign(values, square, digit) {
  callstackCount += 1
  const otherValues = values[square].replace(digit, '')

  for (let d2 of otherValues.split('')) {
    currentEliminationCount = 0
    const result = eliminate(values, square, d2)
    maxEliminationChainLength = Math.max(maxEliminationChainLength, currentEliminationCount)
    if (!result) {
      if (doneParsing) {
        steps.push([{...values}, JSON.parse(JSON.stringify(gridMetaData)), 'Assigning ' + digit + ' to ' + square + ' failed... bubble up error','Propogating'])
      }
      return false
    }
  }

  if (doneParsing) {
    steps.push([{...values}, JSON.parse(JSON.stringify(gridMetaData)), 'Assigning ' + digit + ' to ' + square + ' worked!','Propogating'])
  }
  return values
}

/**
 *
 * @param {Object <string, string>} values
 * @param {string} square
 * @param {string} digit
 */
function eliminate(values, square, digit) {
  callstackCount += 1
  currentEliminationCount += 1
  if (doneParsing) {
    gridMetaData.squareInFocus = square
    steps.push([{...values}, JSON.parse(JSON.stringify(gridMetaData)), 'Try to eliminate '+digit+' from ' + square, 'Propogating'])
  }
  if (!values[square].includes(digit)) {
    return values
  }
  values[square] = values[square].replace(digit, '')
  if (doneParsing) {
    gridMetaData.squareInFocus = square
    steps.push([{...values}, JSON.parse(JSON.stringify(gridMetaData)), 'Remove '+digit+' from ' + square, 'Propogating'])
  }
  if (values[square].length === 0) {
    if (doneParsing) {
      steps.push([{...values}, JSON.parse(JSON.stringify(gridMetaData)), 'Invalid elimination, bubble up failure....', 'Propogating'])
      gridMetaData.failedSnapshots.push([{...values}, square, treesCreated])
    }
    return false
  } else if(values[square].length === 1)  {
    const digitToPropogate = values[square]
    if (doneParsing) {
      steps.push([{...values}, JSON.parse(JSON.stringify(gridMetaData)), 'Single digit left, '+digit+ ' inside of ' + square + ' eliminate it from peers by propogating the change.', 'Propogating'])
    }

    for (let s of Array.from(peers[square])) {
      gridMetaData.squareInFocus = s
      const result = eliminate(values, s, digitToPropogate)

      if (!result) {
        if (doneParsing) {
          steps.push([{...values}, JSON.parse(JSON.stringify(gridMetaData)), 'Propogation failed, bubble up failure...', 'Propogating'])
        }
        return false
      }
    }
  }

  for (let u of units[square]) {
    const dplaces = u.filter(s => values[s].includes(digit))

    if (dplaces.length === 0) {
      if (doneParsing) {
        // gridMetaData.squareInFocus = square
        steps.push([{...values}, JSON.parse(JSON.stringify(gridMetaData)), 'No squares in units for '+ square+' have ' + digit + ' Bubble up error', 'Propogating'])
        gridMetaData.failedSnapshots.push([{...values}, square, treesCreated])
      }
      return false
    } else if (dplaces.length === 1) {
      if (doneParsing) {
        gridMetaData.squareInFocus = dplaces[0]
        callstackCount += 1
        // gridMetaData[dplaces[0]].solutionState = squareStates.potentialAnswer;
        gridMetaData[dplaces[0]].timesVisited += 1
        gridMetaData[dplaces[0]].parentSolution = treesCreated - 1
        gridMetaData[dplaces[0]].parentSolution = gridMetaData.currentSolution
        steps.push([{...values}, JSON.parse(JSON.stringify(gridMetaData)), 'While propogating an answer was found at ' + dplaces[0] + ' for digit ' + digit, 'Propogating'])
      }
      const attemped = assign(values, dplaces[0], digit)
      if (!attemped) {
        if (doneParsing) {
          // gridMetaData[dplaces[0]].solutionState = squareStates.unknown;
          gridMetaData.squareInFocus = dplaces[0]
          gridMetaData[dplaces[0]].parentSolution = null
          callstackCount -= 1
          steps.push([{...values}, JSON.parse(JSON.stringify(gridMetaData)), 'change failed, rollback', 'Propogating'])
        }
        return false
      }
    }
  }
  if (doneParsing) {
    steps.push([{...values}, JSON.parse(JSON.stringify(gridMetaData)), 'Eliminated '+digit +' from ' + square+', continue search', 'Propogating'])
  }
  return values
}

export function findMinSquare(values) {
  return Object.entries(values).reduce((answer, entry) => {
    const [square, digits] = entry
    if (digits.length < answer[0] && digits.length > 1) {
      answer = [digits.length, square]
    }

    return answer
  }, [Infinity, null])
}

export function valuesToStr(values){
  const result = Array(81)
  Object.entries(values).forEach(entry => {
    result[squares.indexOf(entry[0])] = entry[1]
  })
  return result.join('')
}

export function serializeTree(root) {
  const stack = [root]
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

  return {
    edges, nodes
  }
}

let treesCreated
let callstackCount
let maxEliminationChainLength = -Infinity
let currentEliminationCount
/**
 *
 * @param {Object <string,string>} values
 */
function search(values) {
  if (!values) {
    return false
  }

  if (Object.values(values).every(value => value.length === 1)) {
    console.log('solution found')
    return values
  }

  const [_, nextTry] = findMinSquare(values)
  let treeDepth = treesCreated
  let nodeParent = pointer
  treesCreated += 1
  gridMetaData[nextTry].solutionState = squareStates.exploring;
  gridMetaData[nextTry].timesVisited += 1
  gridMetaData[nextTry].parentSolution = treesCreated - 1
  gridMetaData[nextTry].isPicked = true
  gridMetaData.currentSolution = treeDepth
  gridMetaData.squareInFocus = nextTry
  let original = {...values}
  steps.push([{...values}, JSON.parse(JSON.stringify(gridMetaData)), 'square with minimal possibility is '+ nextTry, 'Picking'])
  const result =  values[nextTry].split('').reduce((answer, d) => {
    // Stop calling search when an answer is found.
    if (answer) return answer

    callstackCount += 1
    steps.push([{...values}, JSON.parse(JSON.stringify(gridMetaData)), 'Explore '+ nextTry  + ' Try' + d, 'Picking'])
    const nodeId = treeDepth+'-'+nextTry+'-'+d
    const newNode = new Node(nodeId, nodeParent)
    gridMetaData.currentSolution = treeDepth
    gridMetaData.lastAttempt = nextTry + '-' + d
    gridMetaData.parentSquare = nextTry
    treeMetaData[nodeId] = {
      state: 'exploring'
    }
    pointer = newNode
    nodeParent.children.push(newNode)

    const solution = search(assign({...values}, nextTry, d))
    callstackCount -= 1
    if (solution) {
      steps.push([{...solution}, JSON.parse(JSON.stringify(gridMetaData)), 'Plugging in ' + d + ' at ' + nextTry + 'was a valid move, end search.', 'Picking'])
      pointer.partOfSolution = true
      gridMetaData.squareInFocus = ''
      return solution
    } else {
      // console.log('attempt failed:', nextTry, d, ' at depth ', treeDepth)
      // gridMetaData[nextTry].solutionState = squareStates.exploring
      treeMetaData[nodeId] = {
        state: 'rejected'
      }
      steps.push([{...original}, JSON.parse(JSON.stringify(gridMetaData)), 'Plugging in ' + d + ' at ' + nextTry + ' created an invalid move somewhere in its children, reject this node and try other digits for square' + nextTry, 'Picking'])
    }

    // defaults to returning false.
  }, false)

  if (!result) {
    gridMetaData[nextTry].solutionState = squareStates.unknown;
    gridMetaData[nextTry].isPicked = false
    steps.push([{...original}, JSON.parse(JSON.stringify(gridMetaData)), 'No solutions in ' + nextTry + 'were valid, return to parent node of ' + nextTry + ' ', + nodeParent.val, 'Picking'])
  }

  return result
}

export function norvigSolve(grid) {
  treesCreated = 0
  callstackCount = 0
  return [valuesToStr(search(parseGrid(grid))), {treesCreated, callstackCount, gridMetaData, maxEliminationChainLength, tree: root, steps }]
}
