ObjC.import('Foundation')

// TODO put this in dynamic location based on user
const path = "/tmp/yabai_state.json"
const fm = $.NSFileManager.defaultManager

function saveState(oldState, displays, spaces) {
    oldState[displays.length] = {
	displays: displays,
	spaces: spaces,
    }
    const serialized = JSON.stringify({
	display_counts: oldState,
	last_update: new Date().toJSON()
    }, null, 2)
    const data = ObjC.wrap(serialized).dataUsingEncoding($.NSUTF8StringEncoding)
    fm.createFileAtPathContentsAttributes(ObjC.wrap(path), data, $())
}

function loadState() {
    // If there are no file attrs, then we know that the
    // state file does not exist
    const fileAttrs = fm.attributesOfItemAtPathError(path, null)
    if (ObjC.unwrap(fileAttrs) === undefined) {
	return []
    }

    const data = fm.contentsAtPath(path)
    const jsonString = $.NSString.alloc.initWithDataEncoding(data, $.NSUTF8StringEncoding)
    return JSON.parse(ObjC.unwrap(jsonString)).display_counts || []
}

exports.saveState = saveState
exports.loadState = loadState
