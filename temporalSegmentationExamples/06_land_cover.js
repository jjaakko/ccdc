// Shows how you can load the exported classification and render a land cover map for any point in time.

var temporalSegmentation = require('users/wiell/temporalSegmentation:temporalSegmentation') // Load module

var segmentsImage = ee.Image('users/wiell/CCDCExamples/segments') // Load CCDC asset
var classificationImage = ee.Image('users/wiell/CCDCExamples/classification') // Load segment classes asset
Map.centerObject(segmentsImage)

var segments = temporalSegmentation.Segments(segmentsImage) // Create temporal segments
var classification = temporalSegmentation.Classification(classificationImage, segments) // Segments with the land cover type

var landCover = classification // This works
  .findByDate('2015-01-01', 'closest') // Find segment closest to date
  .toImage('type') // Get the image for the segment and select the type in one go

Map.addLayer(landCover, {min: 0, max: 1, palette: 'green,red'}, 'land cover')
