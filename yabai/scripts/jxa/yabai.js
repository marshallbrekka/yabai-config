ObjC.import('Foundation')

function runYabai(args, parse) {
    var stdout = $.NSPipe.pipe
    var stderr = $.NSPipe.pipe
    var task = $.NSTask.alloc.init

    task.launchPath = '/usr/local/bin/yabai'
    task.arguments = args.map(a => a.toString())
    task.standardOutput = stdout
    task.standardError = stderr
    // var err = $.NSError.alloc.init

    var ran = task.launchAndReturnError(null) // TODO, can we pass NSError somehow?
    if (!ran) {
	throw "Failed to start yabai task"
    }
    task.waitUntilExit

    out = readPipe(stdout)
    err = readPipe(stderr)

    if (task.terminationStatus !== 0) {
	throw err
    }
    if (parse === true) {
	return JSON.parse(out)
    }
    return out
}

function runYabai2(args, parse) {
    console.log("yabai", JSON.stringify(args))
    return runYabai(args, parse)
}

function readPipe(pipe) {
    var file = pipe.fileHandleForReading  // NSFileHandle
    var data = file.readDataToEndOfFile  // NSData
    file.closeFile

    // Call -[[NSString alloc] initWithData:encoding:]
    data = $.NSString.alloc.initWithDataEncoding(data, $.NSUTF8StringEncoding)
    return ObjC.unwrap(data)
}


function queryDisplays() {
    runYabai2(["-m", "query", "--displays"], true)
}
function querySpaces() {
    runYabai2(["-m", "query", "--spaces"], true)
}

function spaceDestroy(index) {
    runYabai2(["-m", "space", index, "--destroy"])
}

function spaceLabel(index, label) {
    runYabai2(["-m", "space", index, "--label", label])
}

function spaceCreate(index, label) {
    runYabai2(["-m", "space", index, "--create"])
}

function windowAssignSpace(windowID, space) {
    runYabai2(["-m", "window", windowID, "--space", space])
}

module.exports = {
    queryDisplays: queryDisplays,
    querySpaces: querySpaces,
    spaceDestroy: spaceDestroy,
    spaceLabel: spaceLabel,
    spaceCreate: spaceCreate,
    windowAssignSpace: windowAssignSpace,
}
