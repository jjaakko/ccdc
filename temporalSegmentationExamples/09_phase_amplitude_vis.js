// Shows how the phase and amplitude can be visualized

var temporalSegmentation = require('users/wiell/temporalSegmentation:temporalSegmentation') // Load module

var segmentsImage = ee.Image('users/wiell/CCDCExamples/segments') // Load CCDC asset
Map.centerObject(segmentsImage)

var segments = temporalSegmentation.Segments(segmentsImage) // Create temporal segments
var segment = segments.find().last()

addHarmonicLayer(segment, 1, 25000)
addHarmonicLayer(segment, 2, 5000)
addHarmonicLayer(segment, 3, 2000)

function addHarmonicLayer(segment, harmonic, maxAmplitude) {
  var phase = segment.phase(harmonic)
    .unitScale(-Math.PI, Math.PI)
  var amplitude = segment.amplitude(harmonic)
    .unitScale(0, maxAmplitude)
  var rmse = segment.toImage('.*_rmse')
    .multiply(-1)  // Looks better inversed
    .unitScale(-6000, 0)
  
  var image = ee.Image([phase, amplitude, rmse]).select('ndfi_.*')
    .hsvToRgb()
  Map.addLayer(image, null, 'harmonic ' + harmonic)
}  
  