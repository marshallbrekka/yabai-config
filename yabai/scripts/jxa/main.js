const util      = require("util.js")
const yabai     = require("yabai.js")
const labelPkg  = require("label.js")
const spacesPkg = require("spaces.js")
const statePkg  = require("state.js")

function ensureSpaces(dryRun) {
    let displays = yabai.queryDisplays()
    let spaces = yabai.querySpaces()

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


// This should very likely be called under the following events/conditions
// Events:
//   application_launched
//   window_created
//
// External Conditions
//   window assigned to space (there is no event for this, but we cause this ourselves)
//
// Why not the events `application_terminated` and `window_destroyed`?
// There are some "windows" that get created that we really don't care about.
// This includes things like the autocomplete windows that pop up in Messages
// as you type.
// We can filter out the windows in the lighter weight bash scripts before invoking
// the JS side, but on destroy we can't get information on the destroyed window
// to know that we shouldn't startup the JS side of things.
//
// So why is this safe to ignore the destroy events?
// Tracking state is primarily used for moving existing windows
// back to their original displays when that display is plugged in.
// When that operation takes place it will grab a current state of the world
// and only operate on the existing windows from that snapshot.
// The state files that are persisted are only used to lookup where
// an existing window may have previously been.
// Any windows that don't exist anymore will be ignored anyway, as they
// won't be present in the snapshot that is taken right at the start of the
// ensureSpaces operation.
function updateState() {
    let oldState = statePkg.loadState()
    let displays = yabai.queryDisplays()
    let spaces = yabai.querySpaces()
    statePkg.saveState(oldState, displays, spaces)
}


module.exports = run
function run(argv) {
    switch (argv[0]) {
    case 'ensure-spaces':
	ensureSpaces(false)
	break;

    case 'update-state':
	updateState()
	break;

    default:
	console.log(`must specify a command:
  update-state: will update and persist the current display/space state
  ensure-spaces: will update spaces and windows for the current display count`)
    }
}
