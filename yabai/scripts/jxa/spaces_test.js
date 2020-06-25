const spaces = require("spaces.js")
const util   = require("test_util.js")

exports.actionsForDisplay_NoChanges = function() {
    spaces.MAX_SPACES = 1
    const display = {
	"id":69734208,
	"uuid":"3D60DDC2",
	"index":1,
	"spaces":[1, 2],
    }
    const spacesObj = {
	1: {
	    "id":1,
	    "label":"d:3D60DDC2:1",
	    "index":1,
	    "display":1,
	    "windows":[],
	    "native-fullscreen":0,
	},
	2: {
	    "id":12,
	    "label":"",
	    "index":2,
	    "display":1,
	    "windows":[],
	    "native-fullscreen":1,
	}
    }

    const result = spaces.actionsForDisplay(display, spacesObj)
    if (result.destroy.length !== 0) {
	throw `Unexpected destroy actions ${result.destroy}`
    }
    if (result.create.length !== 0) {
	throw `Unexpected create actions ${result.create}`
    }
    if (result.label.length !== 0) {
	throw `Unexpected label actions ${result.label}`
    }
    if (result.windows.length !== 0) {
	throw `Unexpected windows actions ${result.windows}`
    }
}

exports.actionsForDisplay_LabelExisting = function() {
    spaces.MAX_SPACES = 1
    const display = {
	"id":69734208,
	"uuid":"3D60DDC2",
	"index":1,
	"spaces":[1, 2]
    }
    const spacesObj = {
	1: {
	    "id":1,
	    "label":"d:not_expected:1",
	    "index":1,
	    "display":1,
	    "windows":[],
	    "native-fullscreen":0,
	},
	2: {
	    "id":12,
	    "label":"",
	    "index":2,
	    "display":1,
	    "windows":[],
	    "native-fullscreen":1,
	}
    }

    const result = spaces.actionsForDisplay(display, spacesObj)
    if (result.destroy.length !== 0) {
	throw `Unexpected destroy actions ${result.destroy}`
    }
    if (result.create.length !== 0) {
	throw `Unexpected create actions ${result.create}`
    }
    if (result.windows.length !== 0) {
	throw `Unexpected windows actions ${result.windows}`
    }
    const expected = [[1, "d:3D60DDC2:1"]]
    if (result.label.length != expected.length ||
	result.label[0][0] != expected[0][0] ||
       result.label[0][1] != expected[0][1]) {
	throw `Expected label action ${JSON.stringify(expected)}\n\tbut got ${JSON.stringify(result.label)}`
    }
}

exports.actionsForDisplay_CreateSpaces = function() {
    spaces.MAX_SPACES = 3
    const display = {
	"id":69734208,
	"uuid":"3D60DDC2",
	"index":1,
	"spaces":[1, 2]
    }
    const spacesObj = {
	1: {
	    "id":1,
	    "label":"d:bad:1",
	    "index":1,
	    "display":1,
	    "windows":[],
	    "native-fullscreen":0,
	},
	2: {
	    "id":12,
	    "label":"",
	    "index":2,
	    "display":1,
	    "windows":[],
	    "native-fullscreen":1,
	}
    }

    const result = spaces.actionsForDisplay(display, spacesObj)
    if (result.destroy.length !== 0) {
	throw `Unexpected destroy actions ${result.destroy}`
    }
    if (result.windows.length !== 0) {
	throw `Unexpected windows actions ${result.windows}`
    }

    const expectedCreate = [2, 3]
    const expectedLabels = [
	[1, "d:3D60DDC2:1"],
	[3, "d:3D60DDC2:2"],
	[4, "d:3D60DDC2:3"],
    ]

    if (!util.deepCompare(result.create, expectedCreate)) {
	throw `Unexpected create ${JSON.stringify(expectedCreate)} but got ${JSON.stringify(result.create)}`
    }

    if (!util.deepCompare(result.label, expectedLabels)) {
	throw `Expected label action ${JSON.stringify(expectedLabels)}\n\tbut got ${JSON.stringify(result.label)}`
    }
}

exports.actionsForDisplay_DestroySpaces = function() {
    spaces.MAX_SPACES = 2
    const display = {
	"id":69734208,
	"uuid":"3D60DDC2",
	"index":1,
	"spaces":[1, 2, 3, 4, 5]
    }
    const spacesObj = {
	1: {
	    "id":1,
	    "label":"d:3D60DDC2:1",
	    "index":1,
	    "display":1,
	    "windows":[],
	    "native-fullscreen":0,
	},
	2: {
	    "id":3,
	    "label":"d:3D60DDC2:2",
	    "index":2,
	    "display":1,
	    "windows":[],
	    "native-fullscreen":0,
	},
	3: {
	    "id":8,
	    "label":"d:bad:1",
	    "index":3,
	    "display":1,
	    "windows":[10, 11],
	    "native-fullscreen":0,
	},
	4: {
	    "id":9,
	    "label":"d:bad:2",
	    "index":4,
	    "display":1,
	    "windows":[],
	    "native-fullscreen":0,
	},
	5: {
	    "id":9,
	    "label":"d:worse:2",
	    "index":5,
	    "display":1,
	    "windows":[12],
	    "native-fullscreen":0,
	},
    }

    const result = spaces.actionsForDisplay(display, spacesObj)
    if (result.create.length !== 0) {
	throw `Unexpected create actions ${result.create}`
    }
    if (result.label.length !== 0) {
	throw `Unexpected label actions ${result.label}`
    }

    const expectedDestroy = [5, 4, 3]
    const expectedWindows = [
	[10, "d:3D60DDC2:1"],
	[11, "d:3D60DDC2:1"],
	[12, "d:3D60DDC2:2"],
    ]

    if (!util.deepCompare(result.destroy, expectedDestroy)) {
	throw `Unexpected destroy ${JSON.stringify(expectedDestroy)} but got ${JSON.stringify(result.destroy)}`
    }

    if (!util.deepCompare(result.windows, expectedWindows)) {
	throw `Expected windows ${JSON.stringify(expectedWindows)}\n\tbut got ${JSON.stringify(result.windows)}`
    }
}

exports.displayAssignments = function() {
    const oldDisplays = [
	{
	    "id":123,
	    "uuid":"ABC",
	    "index":1,
	    "frame":{
		"x":0.0,
	    }
	},
	{
	    "id":456,
	    "uuid":"DEF",
	    "index":2,
	    "frame":{
		"x":-895,
	    }
	},
	{
	    "id":789,
	    "uuid":"GHI",
	    "index":3,
	    "frame":{
		"x":209,
	    }
	},
    ]
    const currentDisplays = [
	{
	    "id":987,
	    "uuid":"AAA",
	    "index":1,
	    "frame":{
		"x":0,
	    }
	},
	{
	    "id":654,
	    "uuid":"BBB",
	    "index":2,
	    "frame":{
		"x":-800,
	    }
	},
	{
	    "id":321,
	    "uuid":"CCC",
	    "index":3,
	    "frame":{
		"x":-300,
	    }
	},
    ]
    const expected = {
	"ABC":"CCC",
	"DEF":"BBB",
	"GHI":"AAA",
    }
    const result = spaces._tests.displayAssignments(oldDisplays, currentDisplays)

    if (!util.deepCompare(expected, result)) {
	throw `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(result)}`
    }
}

exports.windowAssignments = function() {
    const displayMappings = {
	"ABC":"CCC",
	"DEF":"BBB",
    }
    const prevSpaces = [
	{
	    "id":1,
	    "label":"d:ABC:1",
	    "index":1,
	    "display":1,
	    "windows":[1,2,3],
	    "native-fullscreen":0,
	},
	{
	    "id":2,
	    "label":"d:DEF:2",
	    "index":2,
	    "display":2,
	    "windows":[5],
	    "native-fullscreen":0,
	}
    ]
    const newSpaces = [
	{
	    "id":1,
	    "label":"d:CCC:1",
	    "index":1,
	    "display":1,
	    // Window 1 is already on the correct space, so shouldn't be in the response.
	    // Window 4 doesn't exist in old state, we won't do anything with it.
	    // Window 5 should be assigned to d:BBB:2.
	    "windows":[1, 4, 5],
	    "native-fullscreen":0,
	},
	{
	    "id":2,
	    "label":"d:BBB:2",
	    "index":2,
	    "display":2,
	    // Windows 2 and 3 should be assigned to d:CCC:1.
	    "windows":[2,3],
	    "native-fullscreen":0,
	}
    ]
    const expected = [
	[5, "d:BBB:2"],
	[2, "d:CCC:1"],
	[3, "d:CCC:1"],
    ]
    const result = spaces._tests.windowAssignments(displayMappings, prevSpaces, newSpaces)

    if (!util.deepCompare(expected, result)) {
	throw `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(result)}`
    }
}
