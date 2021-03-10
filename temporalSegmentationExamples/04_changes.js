// Shows how you can see the change from one point in time to another.

var temporalSegmentation = require('users/wiell/temporalSegmentation:temporalSegmentation') // Load module

var segmentsImage = ee.Image('users/wiell/CCDCExamples/segments') // Load CCDC asset
Map.centerObject(segmentsImage)

var segments = temporalSegmentation.Segments(segmentsImage) // Create temporal segments
var fromDate = '2005-01-01'
var toDate = '2015-01-01'


// Example 1: Calculate change in linear model from start to end of the reporting period
// This doesn't require breaks to have been detected. It will find changes based on trend
// even if the reporting period is in a single segment.
// It only considers the start and end of the reporting period. 
// A loss followed by regrowth is not considered change.
var from = segments.findByDate(fromDate).fit({harmonics: 0})
var to = segments.findByDate(toDate)
  .fit({harmonics: 0})
var change = to.subtract(from) // Difference in linear fit from start to end of range
  .select('ndfi')
  .int16()
  .clip(segmentsImage.geometry())


// Example 2: Finds largest break magnitude in reporting range
// This do require a break to have been detected, so it might miss subtle changes.
var largestBreakMagnitude = segments.find()
  .updateMask('i.tBreak >= from and i.tBreak < to', {
      from: segments.toT(fromDate), 
      to: segments.toT(toDate)
  })
  .addBands('abs(i.ndfi_magnitude)', 'absMagnitude')
  .max('absMagnitude')
  .toImage('ndfi_magnitude')
  .unmask(0)
  .clip(segmentsImage.geometry())


// Example 3: Calculates largest change from start of reporting peroid.
// Like example 1, but will consider the changes during the reporting period.
var tFrom = segments.toT(fromDate)
var tTo = segments.toT(toDate)
var largestChange = segments.find()
  .updateMask('i.tEnd >= from and i.tStart <= to', { // Segment must be in reporting period
      from: segments.toT(fromDate), 
      to: segments.toT(toDate)
  })
  .addBands(function (segment) {
     // Constrain dates by reporting period
    var tStart = segment.toImage('tStart').max(tFrom)
    var tEnd = segment.toImage('tEnd').min(tTo)
    // Change from start of reporting period to segment start/end
    var changeToStart = segment.fit({t: tStart, harmonics: 0}).subtract(from).select('ndfi')
    var changeToEnd = segment.fit({t: tEnd, harmonics: 0}).subtract(from).select('ndfi')
    // Change for segment is the largest absolute change for start and end of segment
    var change = changeToStart.where(
      changeToStart.abs().lt(changeToEnd.abs()),
      changeToEnd
    )
    return change
      .int16()
      .rename('change')
  })
  .addBands('abs(i.change)', 'absChange')
  .max('absChange')
  .toImage('change')
  .unmask(0) // Give masked pixels 0 change
  .clip(segmentsImage.geometry())


// Example 4: Calculates largest loss from start of reporting peroid
// Like example 3, but only considers loss.
var tFrom = segments.toT(fromDate)
var tTo = segments.toT(toDate)
var largestLoss = segments.find()
  .updateMask('i.tEnd >= from and i.tStart <= to', {
      from: segments.toT(fromDate), 
      to: segments.toT(toDate)
  })
  .addBands(function (segment) {
    var tStart = segment.toImage('tStart').max(tFrom)
    var tEnd = segment.toImage('tEnd').min(tTo)
    var changeToStart = segment.fit({t: tStart, harmonics: 0}).subtract(from).select('ndfi')
    var changeToEnd = segment.fit({t: tEnd, harmonics:0}).subtract(from).select('ndfi')
    var change = changeToStart.min(changeToEnd)
    return change
      .int16()
      .rename('change')
  })
  .updateMask('i.change < 0')
  .min('change')
  .toImage('change')
  .unmask(0).clip(segmentsImage.geometry())


var visParams = {min: -10000, max: 10000, palette: 'red,orange,white,green,blue'}
Map.addLayer(change, visParams, 'change')
Map.addLayer(largestBreakMagnitude, visParams, 'largest break magnitude', true)
Map.addLayer(largestChange, visParams, 'largest change')
Map.addLayer(largestLoss, visParams, 'largest loss')
