ObjC.import("stdlib")


function runTestCase([fileName, testName, testFn]) {
    log = console.log
    capture = []
    console.log = function(...args) {
	capture.push(args)
    }
    try {
	testFn()
	log(`PASS: ${fileName}\t${testName}`)
	console.log = log
	return 0
    } catch(e) {
	console.log = log
	console.log(`FAIL: ${fileName}\t${testName}`)
	console.log(`\t${e}`)
	capture.forEach(line => {
	    line.unshift("\t>")
	    console.log.apply(null, line)
	})
	// Insert new line
	console.log("")
	return 1
    }
}

function run(files) {
    const testCases = files.
    	  map(file => [file, require(file)]).
    	  map(tests => {
	      return Object.entries(tests[1]).map(([key, value]) => [tests[0], key, value])
	  }).
    	  flat()

    const failed = testCases.
	  map(t => runTestCase(t)).
	  reduce((result, failCount) => failCount + result)

    const total = testCases.length
    const passed = total - failed
    log(`\nRan: ${total}, Passed: ${passed}, Failed: ${failed}`)

    if (failed !== 0) {
	$.exit(1)
    }
}

module.exports = run
