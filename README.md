## Sudoku Solver

### Algorithm
A javascript based sudoku solver using backtracking to DFS all possible answers, and revert backwards when no possible values can be entered to try a different answer set.

To improve the efficiency of the algorithm, a min heap is used to prioritize cells with the fewest possible answers.

This is largely based off of this [essay](http://norvig.com/sudoku.html)

### UI
The react app simply renders the answer and provides a text input for entering your own sudoku puzzles.

To improve on rendering performance, the sudoku solving algorithm is run in a background thread using web workers.

TODO:
- Use a web pack plugin to allow code sharing between worker and main react app
- Test UI
- Allow a user to scan a sudoku using phone camera instead of having to paste in the text box.
- For fun, add animation of the solution instead of loading and waiting for the answer to come.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**
