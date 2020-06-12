const labelPkg = require("./label.js")
const yabai    = require("./yabai.js");

const MAX_SPACES = 10

function sortCompare(a, b) {
    if (a < b) {
	return -1
    }
    if (a > b) {
	return 1
    }
    return 0
}

function mergeDownSpacesForDisplay(display, spacesObj) {
    return display.spaces.
	map(spaceIndex => spacesObj[spaceIndex]).
	filter(space => space.windows.length > 0 && labelPkg.conforms(space.label)).
	map(space => {
	    const [displayUUID, spaceNumber] = labelPkg.parse(space.label)
	    if (displayUUID === display.uuid) {
		return null
	    }
	    const label = labelPkg.create(display, spaceNumber)
	    return space.windows.map(windowId => [windowId, label])
	}).
	filter(v => v !== null).
	flat()
}

function mergeDownSpaces(displays, spaces) {
    const spacesObj = Object.fromEntries(spaces.map(s => [s.index, s]))

    return displays.map(display => mergeDownSpacesForDisplay(display, spacesObj)).flat()
}

function spacesToRemoveFromDisplay(display, spacesObj) {
    return display.spaces.
	map(spaceIndex => spacesObj[spaceIndex]).
	filter(space => {
	    if (!labelPkg.conforms(space.label)) {
		return false
	    }
	    let [displayUUID, spaceNumber] = labelPkg.parse(space.label)
	    return display.uuid != displayUUID
	}).
	map(space => space.index)
}

function spacesToRemove(displays, spaces) {
    const spacesObj = Object.fromEntries(spaces.map(s => [s.index, s]))

    return displays.
	map(display => spacesToRemoveFromDisplay(display, spacesObj)).
	flat().
	sort().
	reverse()
}


function ensureSpacesForDisplay(display, spacesObj) {
    // Expand the displays space indices into space objects.
    // Filter out any fullscreen spaces (those are not managed by us).
    // Sort by the display index in ascending order (at least initially).
    const spaces = display.spaces.
	  map(index => spacesObj[index]).
	  filter(space => space['native-fullscreen'] === 0).
	  sort((a, b) => sortCompare(a.index, b.index))

    // The return arrays
    let destroy = [], create = [], label = [], windows = []

    // Array of pre-existing spaces that require a label update
    // Ex: [[9, 'd:<uuid>:9'], [10, 'd:<uuid>:10']]
    label = spaces.
	slice(0, Math.min(spaces.length, MAX_SPACES)).
	filter(space => space.label !== labelPkg.create(display, space.index)).
	map(space => [space.index, labelPkg.create(display, space.index)])

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
		const label = labelPkg.create(display, spaceNumber)
		return space.windows.map(windowId => [windowId, label])
	    }).
	    flat()
    }

    // If we have too few spaces, then populate `create` and append to `label`
    // with spaces that should be created, and subsequently labeled.
    if (spaces.length < MAX_SPACES) {
	create = MAX_SPACES - spaces.length
	// Get the last space index (could be a fullscreen one) so we can
	// determine what the future space indicies will be as we add them
	let lastIndex = display.spaces.slice().sort().reverse()[0]

	// For each new space, we need to also label it based on the
	// expected index it will be.
	for (let i = 0; i < create; i++) {
	    let nextIndex = lastIndex + 1
	    create.push([lastIndex])
	    label.push([nextIndex, labelPkg.create(display, nextIndex)])
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

function ensureSpaces(displays, spaces) {
    const spacesObj = Object.fromEntries(spaces.map(s => [s.index, s]))
    // Ensure the displays in reverse index order (largest to smallest).
    // There are some space operations that need to be done using the space index,
    // and if we add spaces in the middle index, it pushes the higher index
    // numbers up, so if we do modifications from the end backwards, it avoids
    // the issue.
    displays.
	sort((a, b) => sortCompare(a.index, b.index)).
	reverse().
	forEach(display => ensureSpacesForDisplay(display, spacesObj))
}


function run(argv) {
    let displays = yabai.queryDisplays()
    let spaces = yabai.querySpaces()
    console.log("got spaces")

    let windowAssignments = mergeDownSpaces(displays, spaces)
    console.log("merge down")
    let spacesRemove = spacesToRemove(displays, spaces)
    console.log("to remove")

    console.log(JSON.stringify(windowAssignments))
    console.log(JSON.stringify(spacesRemove))

    windowAssignments.map(window => yabai.windowAssignSpace(window[0], window[1]))
    ensureSpaces(displays, spaces)

    // windowAssignments.map(window => runYabai(["-m", "window", window[0], "--space", window[1]]))  
    // spacesRemove.map(space => runYabai(["-m", "space", space, "--destroy"]))
    // stdin = $.NSFileHandle.fileHandleWithStandardInput
    // var data = stdin.readDataToEndOfFile  // NSData
    // data = $.NSString.alloc.initWithDataEncoding(data, $.NSUTF8StringEncoding)
    // var lines = ObjC.unwrap(data)
    // stdin.closeFile
    // console.log(lines)
    // console.log()
    // console.log(runYabai(["-m", "query", "--foo"]))
    // return lines;
}


module.exports = run
