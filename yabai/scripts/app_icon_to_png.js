// https://github.com/JXA-Cookbook/JXA-Cookbook/issues/46

ObjC.import('AppKit');
var apps = ObjC.unwrap($.NSWorkspace.sharedWorkspace.runningApplications)
var finder = apps.filter(function(a) { return ObjC.unwrap(a.localizedName) == "Finder" })[0]
var imageRep = imageRep = $.NSBitmapImageRep(finder.icon.TIFFRepresentation)
// Not these were for JPEG, need to figure out what kind of props actually matter for PNG.
// Maybe size can be specified here?
var imageProps = $.NSDictionary.dictionaryWithObjectForKey(
    $.NSNumber.numberWithFloat(1.0),
    $.NSImageCompressionFactor)

// Can specify Nil (as $()) for imageProps. ... ex: ($.NSPNGFileType, $())
var imageData = imageRep.representationUsingTypeProperties($.NSPNGFileType, imageProps);
// Write out the file
imageData.writeToFileAtomically('./finder_icon.png', false);

// Or save it to base64
var image_as_base64 = imageData.base64EncodedStringWithOptions(0);

// Also how to resize NSImage (these icons are quite large)
// https://stackoverflow.com/questions/11949250/how-to-resize-nsimage
