import {
  stringToGrid,
  isValidMove,
  solver
} from './solver'

const hardSudoku = '..7..8.....6.2.3...3......9.1..5..6.....1.....7.9....2........4.83..4...26....51.'

describe('helpers', () => {
  describe('stringToGrid', () => {
    it('should convert a sudoku string to a grid', () => {
      expect(stringToGrid(hardSudoku)).toEqual([
        [
          ".",
          ".",
          "7",
          ".",
          ".",
          "8",
          ".",
          ".",
          ".",
        ],
        [
          ".",
          ".",
          "6",
          ".",
          "2",
          ".",
          "3",
          ".",
          ".",
        ],
        [
          ".",
          "3",
          ".",
          ".",
          ".",
          ".",
          ".",
          ".",
          "9",
        ],
        [
          ".",
          "1",
          ".",
          ".",
          "5",
          ".",
          ".",
          "6",
          ".",
        ],
        [
          ".",
          ".",
          ".",
          ".",
          "1",
          ".",
          ".",
          ".",
          ".",
        ],
        [
          ".",
          "7",
          ".",
          "9",
          ".",
          ".",
          ".",
          ".",
          "2",
        ],
        [
          ".",
          ".",
          ".",
          ".",
          ".",
          ".",
          ".",
          ".",
          "4",
        ],
        [
          ".",
          "8",
          "3",
          ".",
          ".",
          "4",
          ".",
          ".",
          ".",
        ],
        [
          "2",
          "6",
          ".",
          ".",
          ".",
          ".",
          "5",
          "1",
          ".",
        ],
      ])
    })
  })

  describe('isValidMove', () => {
    it('should return false if there is a conflict', () => {
      expect(isValidMove(0, 0, stringToGrid(hardSudoku), 2)).toBeFalsy()
    })

    it('should return true if the move is valid', () => {
      expect(isValidMove(0, 0, stringToGrid(hardSudoku), 1)).toBeTruthy()
    })
  })
})

// describe('Sudoku solver algorithm', () => {
//   test('Solves sudoku with a valid answer', () => {
//     expect(solver(stringToGrid(hardSudoku))).toEqual([])
//   })
// })