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
    let count = 0
    let removed = 0
    display.spaces.map(spaceIndex => {
	let space = spacesObj[spaceIndex]
	if (count >= MAX_SPACES) {
	    console.log(`Destroying space ${spaceIndex} in display ${display.index}`)
	    yabai.spaceDestroy(spaceIndex-removed)
	    removed++
	} else {
	    count++
	    let label = labelPkg.create(display, count)
	    console.log(`Labeling space ${spaceIndex} in display ${display.index} as ${label})`)
	    yabai.spaceLabel(spaceIndex,label)
	}
    })

    console.log("Done managing existing spaces, checking if we need to add more")
    let lastSpaceIndex = display.spaces[display.spaces.length - 1]
    while (count < MAX_SPACES) {
	count++
	let label = labelPkg.create(display, count)
	console.log(`Adding space ${count} after ${lastSpaceIndex} in display ${display.index} as ${label})`)
	yabai.spaceCreate(lastSpaceIndex)
	lastSpaceIndex++
	yabai.spaceLabel(lastSpaceIndex, label)
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
