// Shows how you can pick a specific transition from one segment to another.

var temporalSegmentation = require('users/wiell/temporalSegmentation:temporalSegmentation') // Load module

var segmentsImage = ee.Image('users/wiell/CCDCExamples/segments') // Load CCDC asset
var classificationImage = ee.Image('users/wiell/CCDCExamples/classification') // Load segment classes asset
Map.centerObject(segmentsImage)

var segments = temporalSegmentation.Segments(segmentsImage) // Create temporal segments
var classification = temporalSegmentation.Classification(classificationImage, segments) // Segments with the land cover type

// Creates segments where each segment is a transition from one segment to another
// It will contain all bands as regular segment prefixed with from_ and to_
var transitions = classification
  .filterDate('2005-01-01', '2015-01-01') // Drop segments outside of these dates
  .transitions() 


var deforestation = transitions.find()
  .updateMask('i.from_type == 0 and i.to_type != 0')
  .first() // First non-masked transition
  .toImage(0).mask() // Mask of the first band (0 - not deforestation, 1 - deforestation)
  
var reforestation = transitions.find()
  .updateMask('i.from_type != 0 and i.to_type == 0')  
  .first().toImage(0).mask()

var degradation = transitions.find()
  .updateMask('i.from_type == 0 and i.to_type == 0 and i.from_ndfi_magnitude < -1000')
  .first().toImage(0).mask()

var regeneration = transitions.find()
  .updateMask('i.from_type == 0 and i.to_type == 0 and i.from_ndfi_magnitude > 1000')
  .first().toImage(0).mask()
  
  
var changeTypes = ee.Image([deforestation, reforestation, degradation, regeneration])
  .selfMask() // Mask 0's
  .multiply(ee.Image([1, 2, 3, 4])) // Assign values to the classes
  .reduce(ee.Reducer.firstNonNull()) // Pick first class
  .unmask(0) // Pixels without class get 0
  .updateMask(classificationImage.mask()) // Mask out pixels outside of classification

Map.addLayer(deforestation, {min: 0, max: 1, palette: 'green, red'}, 'deforestation', false)  
Map.addLayer(degradation, {min: 0, max: 1, palette: 'green, red'}, 'degradation', false)  
Map.addLayer(changeTypes, {min: 0, max: 4, palette: 'white,red,green,orange,lightgreen'}, 'change types')  
