// Shows how you can see changes from one point in time to another, using classified segments.

var temporalSegmentation = require('users/wiell/temporalSegmentation:temporalSegmentation') // Load module

var segmentsImage = ee.Image('users/wiell/CCDCExamples/segments') // Load CCDC asset
var classificationImage = ee.Image('users/wiell/CCDCExamples/classification') // Load segment classes asset
Map.centerObject(segmentsImage)

var segments = temporalSegmentation.Segments(segmentsImage) // Create temporal segments
var classification = temporalSegmentation.Classification(classificationImage, segments) // Segments with the land cover type

var from = classification.findByDate('2005-01-01', 'closest')
var to = classification.findByDate('2015-01-01', 'closest')

var change = to.fit().subtract(from.fit()).select('ndfi')
var fromForest = from.toImage('type').eq(0)
var toForest = to.toImage('type').eq(0)

var deforestation = fromForest.and(toForest.not())
var reforestation = fromForest.not().and(toForest)
var degradation = fromForest.and(toForest)
  .and(change.lt(-1000))
var regeneration = fromForest.and(toForest)
  .and(change.gt(1000))
  
var changeTypes = ee.Image([deforestation, reforestation, degradation, regeneration])
  .selfMask() // Mask 0's
  .multiply(ee.Image([1, 2, 3, 4])) // Assign values to the classes
  .reduce(ee.Reducer.firstNonNull()) // Pick first class
  .unmask(0) // Pixels without class get 0
  .updateMask(classificationImage.mask())
  
Map.addLayer(change, {min: -13000, max: 13000, palette: 'red,orange,white,green,blue'}, 'change', false)  
Map.addLayer(from.toImage('type'), {min: 0, max: 1, palette: 'green,red'}, 'from type', false)  
Map.addLayer(to.toImage('type'), {min: 0, max: 1, palette: 'green,red'}, 'to type', false)  
Map.addLayer(changeTypes, {min: 0, max: 4, palette: 'white,red,green,orange,lightgreen'}, 'change types')  
