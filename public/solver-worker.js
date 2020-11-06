function stringToGrid(sudokuString) {
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

// VISUALIZING STATES
const squareStates = {
  'given': 'given',
  'unknown': 'unknown',
  'branchedOffRoot': 'branchedOffRoot',
  exploring: 'exploring',
  potentialAnswer: 'potentialAnswer',
}

self.doneParsing = false

function captureStep(values, message, type, failure) {
  self.steps.push([
    {...values},
    JSON.parse(JSON.stringify(self.gridMetaData)),
    message,
    type,
    failure,
    self.callstackCount,
  ])
}
class Node {
  constructor(val, parent) {
    this.children = []
    this.val = val
    this.parent = parent
    this.partOfSolution = false
    this.finalLeaf = false
  }
}

self.gridMetaData = squares.reduce((result, s) => {
  result[s] = {
    timesVisited: 0,
    solutionState: squareStates.unknown,
    parentSolution: null,
    currentSolution: null,
  }
  return result
}, {
  squareInFocus: null,
  dplacesCheck: null,
})

self.treeMetaData = {}
self.tree = new Node('root', null)
self.root = self.tree
self.pointer = self.root
self.steps = []

// INITIALIZE
const gridValues = (grid) => {
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
const parseGrid = (grid) => {
  self.doneParsing = false
  self.tree = new Node('root', null)
  self.root = self.tree
  self.pointer = self.root
  self.steps = []
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
      self.gridMetaData[s].solutionState = squareStates.given;
    } else {
      self.gridMetaData[s].solutionState = squareStates.unknown;
    }
  }
  gridMetaData.squareInFocus = null;
  captureStep(values, ' Initialize grid')
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
  if (self.doneParsing) {
    self.callstackCount += 1
  }
  const otherValues = values[square].replace(digit, '')

  for (let d2 of otherValues.split('')) {
    const result = eliminate(values, square, d2)
    if (!result) {
      if (self.doneParsing) {
        self.gridMetaData.squareInFocus = square
        self.callstackCount -= 1
        captureStep(
          values,
          'Assigning ' + digit + ' to ' + square + ' failed... bubble up error',
          'Propogating',
          'failure'
        )
      }
      return false
    }
  }
  if (self.doneParsing) {
    self.callstackCount -= 1
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
  if (self.doneParsing) {
    self.callstackCount += 1
    self.gridMetaData.squareInFocus = square
    captureStep(
      values,
      'Try to eliminate '+digit+' from ' + square,
      'Propogating'
    )
  }
  if (!values[square].includes(digit)) {
    if (self.doneParsing) {
      self.callstackCount -= 1
    }
    return values
  }
  values[square] = values[square].replace(digit, '')
  if (self.doneParsing) {
    self.gridMetaData.squareInFocus = square
    captureStep(values,  'Remove '+digit+' from ' + square, 'Propogating')
  }
  if (values[square].length === 0) {
    if (self.doneParsing) {
      self.callstackCount -= 1
      self.gridMetaData.squareInFocus = square
      captureStep(
        values,
        'Invalid elimination, no values left, bubble up failure....',
        'Propogating',
        'failure'
      )
    }
    return false
  } else if(values[square].length === 1)  {
    const digitToPropogate = values[square]
    if (self.doneParsing) {
      captureStep(values, 'Single digit left, '+values[square]+ ' inside of ' + square + ' eliminate it from peers by propogating the change.', 'Propogating')
    }

    for (let s of Array.from(peers[square])) {
      if (self.doneParsing) {
        self.gridMetaData.squareInFocus = s
      }
      const result = eliminate(values, s, digitToPropogate)

      if (!result) {
        if (self.doneParsing) {
          self.callstackCount -= 1
        }
        return false
      }
    }
  }

  for (let u of units[square]) {
    self.gridMetaData.dplacesCheck = u
    const dplaces = u.filter(s => {
      return values[s].includes(digit)
    })

    if (self.doneParsing) {
      captureStep(
        values,
        'Scan for digit ' + digit + ' in unit.', 'Propogating'
      )
    }
    self.gridMetaData.dplacesCheck = null
    if (dplaces.length === 0) {
      if (self.doneParsing) {
        self.callstackCount -= 1
        captureStep(
          values,
          'No squares in units for '+ square+' have ' + digit + ' Bubble up error', 'Propogating', 'failure'
        )
      }
      return false
    } else if (dplaces.length === 1) {
      if (self.doneParsing) {
        self.gridMetaData.squareInFocus = dplaces[0]
        // self.gridMetaData[dplaces[0]].solutionState = squareStates.potentialAnswer;
        self.gridMetaData[dplaces[0]].timesVisited += 1
        self.gridMetaData[dplaces[0]].parentSolution = self.treesCreated - 1
        self.gridMetaData[dplaces[0]].parentSolution = self.gridMetaData.currentSolution
        captureStep(
          values,
          'While propogating an answer was found at ' + dplaces[0] + ' for digit ' + digit, 'Propogating'
        )
      }
      const attemped = assign(values, dplaces[0], digit)
      if (!attemped) {
        if (self.doneParsing) {
          self.callstackCount -= 1
          self.gridMetaData.squareInFocus = dplaces[0]
          self.gridMetaData[dplaces[0]].parentSolution = null
        }
        return false
      }
    }
  }
  if (self.doneParsing) {
    self.callstackCount -= 1
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

function serializeTree(root) {
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

self.treesCreated
self.callstackCount
/**
 *
 * @param {Object <string,string>} values
 */
function search(values) {
  if (self.doneParsing) {
    self.callstackCount += 1
  }
  if (!values) {
    if (self.doneParsing) {
      self.callstackCount -= 1
    }
    return false
  }

  if (Object.values(values).every(value => value.length === 1)) {
    if (self.doneParsing) {
      self.callstackCount -= 1
    }
    captureStep(values,'solution found', 'Picking')
    console.log('solution found')
    return values
  }

  const [_, nextTry] = findMinSquare(values)
  let treeDepth = self.treesCreated
  let nodeParent = self.pointer
  self.treesCreated += 1
  self.gridMetaData[nextTry].solutionState = squareStates.exploring;
  self.gridMetaData[nextTry].timesVisited += 1
  self.gridMetaData[nextTry].parentSolution = self.treesCreated - 1
  self.gridMetaData[nextTry].isPicked = true
  self.gridMetaData.currentSolution = treeDepth
  self.gridMetaData.squareInFocus = nextTry
  let original = {...values}
  captureStep(
    values,
    'square with minimal possibility is '+ nextTry,
    'Picking'
  )
  const result =  values[nextTry].split('').reduce((answer, d) => {
    // Stop calling search when an answer is found.
    if (answer) return answer
    captureStep(values, 'Explore '+ nextTry  + ' Try' + d, 'Picking')
    const nodeId = treeDepth+'-'+nextTry+'-'+d
    const newNode = new Node(nodeId, nodeParent)
    self.gridMetaData.currentSolution = treeDepth
    self.gridMetaData.lastAttempt = nextTry + '-' + d
    self.gridMetaData.parentSquare = nextTry
    self.treeMetaData[nodeId] = {
      state: 'exploring'
    }
    self.pointer = newNode
    nodeParent.children.push(newNode)

    const solution = search(assign({...values}, nextTry, d))
    if (solution) {
      self.gridMetaData.squareInFocus = nextTry
      captureStep(solution, 'Plugging in ' + d + ' at ' + nextTry + 'was a valid move, end search.', 'Picking')
      self.pointer.partOfSolution = true
      self.gridMetaData.squareInFocus = ''
      return solution
    } else {
      self.treeMetaData[nodeId] = {
        state: 'rejected'
      }
      captureStep(
        original,
        'Plugging in ' + d + ' at ' + nextTry + ' created an invalid move somewhere in its children, reject this node and try other digits for square' + nextTry,
        'Picking',
        'failure'
      )
    }

    // defaults to returning false.
  }, false)

  if (!result) {
    self.gridMetaData[nextTry].solutionState = squareStates.unknown;
    self.gridMetaData[nextTry].isPicked = false
    captureStep(
      original,
      'No solutions in ' + nextTry + 'were valid, return to parent node of ' + nextTry + ' ', + nodeParent.val,
      'Picking',
      'failure'
    )
  }
  if (self.doneParsing) {
    self.callstackCount -= 1
  }
  return result
}

function norvigSolve(grid) {
  self.treesCreated = 0
  self.callstackCount = 0
  const solution = search(parseGrid(grid))
  console.log(solution, steps)
  self.gridMetaData.squareInFocus = ''
  captureStep(solution,'Ending algo.', 'Picking')
  return [valuesToStr(solution), {treesCreated: self.treesCreated, callstackCount: self.callstackCount, gridMetaData: self.gridMetaData, tree: serializeTree(self.root), steps: self.steps }]
}

onmessage = function (e) {
  const result = norvigSolve(e.data)
  postMessage(result)
}
