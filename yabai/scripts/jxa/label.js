function spaceLabel(display, spaceNumber) {
    return `d:${display.uuid}:${spaceNumber}`
}

function labelConforms(label) {
    return label.startsWith("d:")
}

function parseSpaceLabel(label) {
    let components = label.split(":")
    return [components[1], parseInt(components[2], 10)]
}

module.exports = {
    create: spaceLabel,
    parse: parseSpaceLabel,
    conforms: labelConforms,
}
