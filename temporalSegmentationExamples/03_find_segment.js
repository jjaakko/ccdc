// Shows how you can pick a specific segment of interest.

// Many of these examples are contrived, chosen to show how the API works.

var temporalSegmentation = require('users/wiell/temporalSegmentation:temporalSegmentation') // Load module

var segmentsImage = ee.Image('users/wiell/CCDCExamples/segments') // Load CCDC asset
Map.centerObject(segmentsImage)

var segments = temporalSegmentation.Segments(segmentsImage, 0, 10) // Create temporal segments
    
var largestLossSegmentImage = segments.find()
  .min('ndfi_magnitude') // Pick the segment with the smallest value in ndfi_magnitude
  .toImage() // Turn segment into image

var lastSegmentImage = segments.find()
  .last() // Finds the last segment
  .toImage('tStart') // Select the tStart band when turning segment into image

var firstBreakSegment = segments.find()
  .updateMask('i.tBreak > 0') // Exclude segments without a break
  .first() // Pick the first segment that is left
  
var maxDurationSegment = segments.find()
  .addBands('i.tEnd - i.tStart', 'duration') // Add a band to the segments, named 'duration'
  .max('duration') // Picks the segment with the max value in the 'duration' band

var longestDurationPositiveTrendSegment = segments.find()
  .addBands('i.tEnd - i.tStart', 'duration')
  .updateMask(function (segment, image) { 
    var ndfiCoefs = segment.coefs('ndfi') // Get an image of the coefs for the 'ndfi' band
    return ndfiCoefs.select(1).gt(0) // Include only segments where the trend > 0
  })
  .max('duration')
 
var highestAmplitudeSegment = segments.find()
  .addBands(function (segment) { 
    return segment.amplitude() // Calculate the 1st order harmonic amplitude
      .select('ndfi_amplitude')
  })
  .updateMask('i.ndfi_magnitude < 0')
  .max('ndfi_amplitude')


Map.addLayer(largestLossSegmentImage, {
  bands: 'tBreak',
  min: segments.toT('1990-01-01'),
  max: segments.toT('2019-11-01'),
  palette: 'violet,indigo,blue,green,yellow,orange,red'
}, 'Date of largest loss')

Map.addLayer(lastSegmentImage, {
  min: segments.toT('1990-01-01'),
  max: segments.toT('2019-11-01'),
  palette: 'violet,indigo,blue,green,yellow,orange,red'
}, 'Start date of last segment')

Map.addLayer(firstBreakSegment.toImage('tBreak'), {
  min: segments.toT('1990-01-01'),
  max: segments.toT('2019-11-01'),
  palette: 'violet,indigo,blue,green,yellow,orange,red'
}, 'Date of first break')

Map.addLayer(maxDurationSegment.toImage('duration'), {
  min: 800,
  max: 13000,
  palette: 'violet,indigo,blue,green,yellow,orange,red'
}, 'Duration of logest segment')
   
Map.addLayer(longestDurationPositiveTrendSegment.toImage('duration'), {
  min: 800,
  max: 13000,
  palette: 'violet,indigo,blue,green,yellow,orange,red'
}, 'Duration of longest segment with positive trend')

Map.addLayer(highestAmplitudeSegment.toImage('ndfi_amplitude'), {
  min: 0, 
  max: 5000,
  palette: 'blue,green,yellow,orange,red'
}, 'Highest amplitude of segment with loss')
