const labelPkg  = require("label.js")
const yabai     = require("yabai.js")
const spacesPkg = require("spaces.js")
const util      = require("util.js")

function ensureSpaces(displays, spaces, dryRun) {
    const spacesObj = Object.fromEntries(spaces.map(s => [s.index, s]))
    // Ensure the displays in reverse index order (largest to smallest).
    // There are some space operations that need to be done using the space index,
    // and if we add spaces in the middle index, it pushes the higher index
    // numbers up, so if we do modifications from the end backwards, it avoids
    // the issue.
    const displayActions = displays.
	  sort((a, b) => util.sortCompare(a.index, b.index)).
	  map(display => spacesPkg.actionsForDisplay(display, spacesObj)).
	  reverse()

    console.log("Actions", JSON.stringify(displayActions))
    if (dryRun) {
	return
    }

    displayActions.forEach(actions => spacesPkg.applyActions(actions))
}

module.exports = run
function run(argv) {
    let displays = yabai.queryDisplays()
    let spaces = yabai.querySpaces()
    ensureSpaces(displays, spaces, false)
}
