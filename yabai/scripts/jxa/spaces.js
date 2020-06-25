const labelPkg = require("label.js")
const yabai    = require("yabai.js")
const util     = require("util.js")

exports.MAX_SPACES = 10

exports.actionsForDisplay = actionsForDisplay
function actionsForDisplay(display, spacesObj) {
    const MAX_SPACES = exports.MAX_SPACES

    // Expand the displays space indices into space objects.
    // Filter out any fullscreen spaces (those are not managed by us).
    // Sort by the display index in ascending order (at least initially).
    const spaces = display.spaces.
	  map(index => spacesObj[index]).
	  filter(space => space['native-fullscreen'] === 0).
	  sort((a, b) => util.sortCompare(a.index, b.index))

    // The return arrays
    let destroy = [], create = [], label = [], windows = []

    // Array of pre-existing spaces that require a label update
    // Ex: [[9, 'd:<uuid>:9'], [10, 'd:<uuid>:10']]
    label = spaces.
	slice(0, Math.min(spaces.length, MAX_SPACES)).
	filter((space, index) => space.label !== labelPkg.create(display.uuid, index + 1)).
	map((space, index) => [space.index, labelPkg.create(display.uuid, index + 1)])

    // If we have too many, populate `destroy` and `windows` with
    // spaces that should be removed, and windows that should be assigned to a new space
    if (spaces.length > MAX_SPACES) {
	const spacesToDestroy = spaces.slice(MAX_SPACES)

	// Populate destroy with a reversed order (by index) list of spaces to
	// remove. Ex: [13, 12, 11]
	destroy = spacesToDestroy.map(space => space.index).reverse()

	// Populate with array if windows to assign to other spaces
	// Ex: [[757, "d:<uuid>:3"], [989, "d:<uuid>:6"]]
	//
	// We can't do anything useful with spaces that have no windows
	// or have a label that doesn't conform to our system, so just ignore
	// those and let macOS do what it does when the space is destroyed.
	windows = spacesToDestroy.
	    filter(space => space.windows.length > 0 && labelPkg.conforms(space.label)).
	    map(space => {
		const [displayUUID, spaceNumber] = labelPkg.parse(space.label)
		const label = labelPkg.create(display.uuid, spaceNumber)
		return space.windows.map(windowId => [windowId, label])
	    }).
	    flat()
    }

    // If we have too few spaces, then populate `create` and append to `label`
    // with spaces that should be created, and subsequently labeled.
    if (spaces.length < MAX_SPACES) {
	const createCount = MAX_SPACES - spaces.length
	// Get the last space index (could be a fullscreen one) so we can
	// determine what the future space indicies will be as we add them
	let lastIndex = display.spaces.slice().sort().reverse()[0]

	// For each new space, we need to also label it based on the
	// expected index it will be.
	for (let i = 1; i <= createCount; i++) {
	    let nextIndex = lastIndex + 1
	    create.push(lastIndex)
	    label.push([nextIndex, labelPkg.create(display.uuid, spaces.length + i)])
	    lastIndex = nextIndex
	}
    }

    return {
	create: create,
	destroy: destroy,
	label: label,
	windows: windows,
    }
}

exports.applyActions = applyActions
// Applies the actions that resulted from `actionsForDisplay`.
// The order in which the actions are applied is incredibly important
// as many operations rely on a space or display index, and the indexes can change
// as spaces are added/removed.
//
// Order should be
// 1. Apply window assignment changes
// 2. Destroy spaces (actions should already be ordered from high to low index)
// 3. Create new spaces (actions should already be ordered from low to high index)
// 4. Apply labels
function applyActions(actions) {
    actions.windows.forEach(([id, space]) => yabai.windowAssignSpace(id, space))
    actions.destroy.forEach(spaceIndex => yabai.spaceDestroy(spaceIndex))
    actions.create.forEach(afterIndex => yabai.spaceCreate(afterIndex))
    actions.label.forEach(([spaceIndex, label]) => yabai.spaceLabel(spaceIndex, label))
}


// Given two arrays of display objects (must be equal in length)
// returns an object where the keys are the old display UUIDs,
// and the value is the new display UUID that it should point to.
function displayAssignments(oldDisplays, currentDisplays) {
    const sortedCurrent = currentDisplays.slice(0)
    const sortedOld = oldDisplays.slice(0)
    sortedCurrent.sort((a, b) => util.sortCompare(a.frame.x, b.frame.x))
    sortedOld.sort((a, b) => util.sortCompare(a.frame.x, b.frame.x))

    return Object.fromEntries(sortedOld.map((oldDisplay, index) => {
	return [oldDisplay.uuid, sortedCurrent[index].uuid]
    }))
}

function windowAssignments(displayMappings, prevSpaces, newSpaces) {
    const prevWindows = Object.fromEntries(
	prevSpaces.flatMap(space => {
	    return space.windows.map(windowID => [windowID, space.label])
	})
    )

    // Return window assignments [[windowID, spaceLabel]]
    return newSpaces.
	flatMap(space => space.windows.map(windowID => [windowID, space.label])).
	map(([windowID, currentSpaceLabel]) => {
	    const prevSpaceLabel = prevWindows[windowID]
	    if (!prevSpaceLabel) {
		console.log("did not find prev space label for window", windowID)
		return
	    }
	    const [prevUUID, number] = labelPkg.parse(prevSpaceLabel)
	    const newUUID = displayMappings[prevUUID]
	    const newSpaceLabel = labelPkg.create(newUUID, number)
	    if (newSpaceLabel === currentSpaceLabel) {
		console.log("current and new label are space", windowID, newSpaceLabel)
		return
	    }
	    return [windowID, newSpaceLabel]
	}).
	filter(assignment => assignment)
}

exports._tests = {
    displayAssignments: displayAssignments,
    windowAssignments: windowAssignments,
}

exports.stateToWindowAssignments = stateToWindowAssignments
function stateToWindowAssignments(state, displays, spaces) {
    console.log("prior state", JSON.stringify(state))
    const prev = state[displays.length]

    // If there is no prior state for the given number of displays just return
    if (!prev) {
	console.log("no prior state found, exiting")
	return []
    }

    const displayMappings = displayAssignments(prev.displays, displays)
    console.log("using display assignments", JSON.stringify(displayMappings))
    return windowAssignments(displayMappings, prev.spaces, spaces)
}
