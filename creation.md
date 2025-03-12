# The Rules
- I will not spend more than 15 minutes on this
- I am not allowed to touch the code, only interact with the AI agent.

# GPT 4.5 for the initial prompt
research "vibe coding"
Then write a prompt to create a browser based Tetris game with three.js which is fully playable, keep rows cleared and scores and using the same tetris shapes and rules. Just give me the prompt.

# Cursor + Claude 3.7 + Composer
## Initial prompt
Create a fully playable, browser-based Tetris game using Three.js. The game should include classic Tetris gameplay mechanics:

Implement standard Tetris shapes (Tetrominoes: I, O, T, S, Z, J, and L) that randomly appear and can be rotated and moved horizontally as they fall.
Rows should clear automatically when fully occupied by blocks, and blocks above cleared rows should move downward appropriately.
Keep track of and visibly display the player's score, increasing points each time a row is cleared. The scoring should follow classic Tetris scoring rules (more points for multiple-row clears).
Provide simple keyboard controls for moving, rotating, and accelerating block descent (left/right arrows for horizontal movement, up arrow for rotation, down arrow for faster descent).
Include a game-over condition triggered when new pieces can no longer enter the playfield.
Render the game in 3D using Three.js with clean, minimal visuals and clear separation between the blocks and the playing field.
Ensure the game runs smoothly in modern browsers without requiring external libraries beyond Three.js itself.

[A bunch of files were created]

## Debugging steps
- add a simple web server to run this locally [it used node.js]
- I see an empty screen, something is not right [A bunch of changes I did not look at]
- I got an error and pasted it right back:```
main.js:15 Error starting game: ReferenceError: THREE is not defined
    at TetrisGame.initScene (game.js:42:26)
    at new TetrisGame (game.js:14:14)
    at main.js:10:22``` [It did a bunch of stuff...]
- Still error, I decided to be helpful and blurted: maybe install three with npm install? [It moved a lot of files and created folders, I did not look at anything and kept vibing]
- getting this in npm run build: `/Users/wein/code/vibe-tetris/src/main.js:1
import * as THREE from 'three';
^
ParseError: 'import' and 'export' may appear only with 'sourceType: module'` [It did something]
- Finally, we are getting somewhere, I see a game but it does not start. I post this to Claude: `Error: game.start is not a function`. [Apparently, the thing did not implement any game logic, just placeholders, now it writes a lot of code which I of course did not look at]
- We are getting somewhere, I post the following: `few issues:
the pieces are floating up and not down.
not the entire board is visible
when a line is complete it is not registered` [Claude is blabering at me, I just click apply all and keep vibing]
- Me: a line now makes the whole board disappear, not that line only. Still the playable area is not fully visible [Blah Blah apply all]
- I realize I can post a screenshot of the error, so with this text `lines now work fine, but the playable area is still wrong. It is only playable on the top left part, and not fully visable` I also take a browser screenshot and post it. [The effer: I see the issue now (fix fix fix)]
- perfect. however, now when I complete a line, everything jumps to the center like so: (another screenshot) [Mensch tracht Claude lacht]
## It works! (12 minutes)
[Demo GIF](demo.gif)

