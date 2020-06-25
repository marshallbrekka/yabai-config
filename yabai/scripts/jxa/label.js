function spaceLabel(displayUUID, spaceNumber) {
    return `d:${displayUUID}:${spaceNumber}`
}

// Returns true if the label matches the format we expect.
// You should check if the label conforms before calling parseSpaceLabel
function labelConforms(label) {
    return label.startsWith("d:")
}

// Parses an existing label and returns a tuple of the display UUID, and the space number.
function parseSpaceLabel(label) {
    let components = label.split(":")
    return [components[1], parseInt(components[2], 10)]
}

module.exports = {
    create: spaceLabel,
    parse: parseSpaceLabel,
    conforms: labelConforms,
}
