// Shows how you can load an exported CCDC asset and apply the coefficients to create an
// image for any point in time.

var temporalSegmentation = require('users/wiell/temporalSegmentation:temporalSegmentation') // Load module

var segmentsImage = ee.Image('users/wiell/CCDCExamples/segments') // Load CCDC asset
Map.centerObject(segmentsImage)

var segments = temporalSegmentation.Segments(segmentsImage) // Create temporal segments

 // Find segment closest to provided date. Second argument is the strategy to use when there isn't a segment for the date
 // Strategies:
 // mask (default) - Mask out image at pixels without segment
 // closest - Picks segment closest to date
 // previous - Picks first segment before date
 // next - Picks first segment after date
var segment = segments.findByDate('2018-01-01', 'closest')


var fit = segment.fit({ // Use the selected segment's model to fit a value at the specified date
  date: '2018-01-01', // The date to fit. Defaults to date provided with finding segment.
  harmonics: 3, // The number of harmonics from the model to use. Defaults to all 3. 0 would be a linear fit.
  extrapolateMaxDays: 0 // The max number of days before/after a segment a fit will be provided for. Defaults to 0
})
var fitDefault = segment.fit() // Fit with defaults. Should like exactly like the above image.
var fitStart = segment.startFit(3) // Fits start of the segment using three harmonics (default)
var fitMiddle = segment.middleFit(3) // Fits the middle of the segment using three harmonics (default)
var fitEnd = segment.endFit(3) // Fits the end of the segment using three harmonics (default)
var fitT = segment.fit({
  t: segment.toImage('tStart') // Specify an ee.Image of t instead of date
})
var extrapolate = segment.fit({
  extrapolateMaxFraction: 0.25 // The max fraction of the segment length to extrapolate a value outside of segment.
})
var interpolate = segments.interpolate('2018-01-01', 3) // Interpolate between previous/next segment
var mean = segment.mean(3) // Calculate mean of 3rd order hamonic model


var visParams =  {bands: 'swir2,nir,red', min: [0, 500, 200], max: [1800, 6000, 3500]}

Map.addLayer(fit, visParams, 'Fit')
Map.addLayer(fitDefault, visParams, 'Fit with default options')
Map.addLayer(fitStart, visParams, 'Fit start of segment')
Map.addLayer(fitMiddle, visParams, 'Fit middle of segment')
Map.addLayer(fitEnd, visParams, 'Fit end of segment')
Map.addLayer(fitT, visParams, 'Fit t')
Map.addLayer(extrapolate, visParams, 'Extrapolate')
Map.addLayer(interpolate, visParams, 'Interpolate')
Map.addLayer(mean, visParams, 'Segment mean')
