

exports.Foo = function(a) {
    console.log("capture this")
}

exports.Bar = function(a) {
    console.log("heres some stuff")
    console.log("more logs")
    console.log("oh this is where the bug is")
    throw "fuck we suck"
}
