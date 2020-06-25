ObjC.import('Foundation')


// The default install location, but allow overriding via module exports.
const DEFAULT_YABAI_PATH = '/usr/local/bin/yabai'
const DRY_RUN=isDryRun()

function isDryRun() {
    const env = ObjC.unwrap($.NSProcessInfo.processInfo.environment)
    const val = env["YABAI_DRY_RUN"]
    return val && ObjC.unwrap(val) === "true"
}

// Runs yabai with the given array of arguments, returns the result of stdout.
// You can optionally have it parse stdout as JSON by passing `true` as the 2nd argument.
//
// If yabai returns a non-zero status code, an error is thrown with the result
// of stderr, otherwise 
function runYabai(args, parse, dry_run) {
    if (dry_run) {
	console.log("yabai", args.join(" "))
	return
    }
    var stdout = $.NSPipe.pipe
    var stderr = $.NSPipe.pipe
    var task = $.NSTask.alloc.init

    task.launchPath = module.exports.yabaiPath
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

// Takes an NSPipe and returns a string
function readPipe(pipe) {
    var file = pipe.fileHandleForReading  // NSFileHandle
    var data = file.readDataToEndOfFile  // NSData
    file.closeFile

    data = $.NSString.alloc.initWithDataEncoding(data, $.NSUTF8StringEncoding)
    return ObjC.unwrap(data)
}


function queryDisplays() {
    return runYabai(["-m", "query", "--displays"], true)
}
function querySpaces() {
    return runYabai(["-m", "query", "--spaces"], true)
}

function spaceDestroy(index) {
    runYabai(["-m", "space", index, "--destroy"], false, DRY_RUN)
}

function spaceLabel(index, label) {
    runYabai(["-m", "space", index, "--label", label], false, DRY_RUN)
}

// Creates a space after the index of an existing space.
// I don't believe this places the space directly after this index,
// but instead places the space after the provided index, but before
// the first space on the next display.

// Ex:
// Assume have displays D1 and D2, with spaces D1-S1, D1-S2, and D2-S3.
// Calling spaceCreate(1) would make a new space after D1-S2 but before D2-S3.
function spaceCreate(index) {
    runYabai(["-m", "space", index, "--create"], false, DRY_RUN)
}

function windowAssignSpace(windowID, space) {
    runYabai(["-m", "window", windowID, "--space", space], false, DRY_RUN)
}

module.exports = {
    yabaiPath: DEFAULT_YABAI_PATH,
    queryDisplays: queryDisplays,
    querySpaces: querySpaces,
    spaceDestroy: spaceDestroy,
    spaceLabel: spaceLabel,
    spaceCreate: spaceCreate,
    windowAssignSpace: windowAssignSpace,
}
