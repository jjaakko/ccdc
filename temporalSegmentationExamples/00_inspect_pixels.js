// Click on the map to inspect the CCDC results for a single pixel (in the console).

// Tweak the collection creation as you want (add additional bands or use Sentinel 1?).
// You might need to update the CCDC configuration to pick up missed breaks.
// Look at ee.Algorithms.TemporalSegmentation.Ccdc() in the EE docs.
// Change config -> rerun -> change config -> rerun, until you're happy
// Then continue to the next example script, which exports the CCDC product as an asset.

var temporalSegmentation = require('users/wiell/temporalSegmentation:temporalSegmentation')

Map.style().set('cursor', 'crosshair')
Map.onClick(chartPoint)
Map.setOptions('HYBRID')

Map.centerObject(ee.Geometry.Point([-59.01369, -9.03734]), 12)

function chartPoint(latLon) {
  var point = ee.Geometry.Point([latLon.lon, latLon.lat])
  
  var collection = createLandsatCollection({
    region: point,
    start: '1982-01-01',
    end: '2020-01-01', 
    mapImage: function(image) { return image.addBands(toNdfi(image)) }
  })
  
  var ccdc = ee.Algorithms.TemporalSegmentation.Ccdc({
    collection: collection,
    breakpointBands: ["ndfi"]
  })
  
  temporalSegmentation.chartPoint({
    image: ccdc,
    point: point,
    bandName: 'ndfi',
    // If you don't plot the raw collection, this will be faster.
    // Just comment it out if you want
    collection: collection,
    callback: function (chart) {
      print(chart)
    }
  })  
}

/////////////////////////////////////////////////
// Utility functions to create ImageCollection //
/////////////////////////////////////////////////
function toNdfi(image) {
  var gv = [500, 900, 400, 6100, 3000, 1000]
  var shade = [0, 0, 0, 0, 0, 0]
  var npv = [1400, 1700, 2200, 3000, 5500, 3000]
  var soil = [2000, 3000, 3400, 5800, 6000, 5800]
  var cloud = [9000, 9600, 8000, 7800, 7200, 6500]
  var unmixed = image
    .select(['blue', 'green', 'red', 'nir', 'swir1', 'swir2'])
    .unmix({
      endmembers: [gv, shade, npv, soil, cloud],
      sumToOne: true,
      nonNegative: true
    })
    .rename(['gv', 'shade', 'npv', 'soil', 'cloud'])
  return unmixed
    .expression(
      '((i.gv / (1 - i.shade)) - (i.npv + i.soil)) / ((i.gv / (1 - i.shade)) + i.npv + i.soil)',
      {i: unmixed}
    ) 
    .multiply(10000)
    .rename('ndfi')
}

function createLandsatCollection(params) {
  var defaultParams = {
    region: Map.getBounds(true), 
    start: '1982-01-01', 
    end: formatDate(new Date()), 
    mapImage: function (image) { return image }
  }
  params = mergeObjects([defaultParams, params])
  
  var filter = ee.Filter.and(
      ee.Filter.bounds(params.region),
      ee.Filter.date(params.start, params.end  )
  )
  var l4 = ee.ImageCollection('LANDSAT/LT04/C01/T1_SR')
    .merge(ee.ImageCollection('LANDSAT/LT04/C01/T2_SR'))
    .filter(filter)
    .select(
      ['B1', 'B2', 'B3', 'B4', 'B5', 'B7', 'pixel_qa'], 
      ['blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'pixel_qa']
    )
  var l5 = ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
    .merge(ee.ImageCollection('LANDSAT/LT05/C01/T2_SR'))
    .filter(filter)
    .select(
      ['B1', 'B2', 'B3', 'B4', 'B5', 'B7', 'pixel_qa'], 
      ['blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'pixel_qa']
    )
  var l7 = ee.ImageCollection('LANDSAT/LE07/C01/T1_SR')
    .merge(ee.ImageCollection('LANDSAT/LE07/C01/T2_SR'))
    .filter(filter)
    .select(
      ['B1', 'B2', 'B3', 'B4', 'B5', 'B7', 'pixel_qa'], 
      ['blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'pixel_qa']
    )
  var l8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
    .merge(ee.ImageCollection('LANDSAT/LC08/C01/T2_SR'))
    .filter(filter)
    .select(
      ['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'pixel_qa'], 
      ['blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'pixel_qa']
    )

  return l4.merge(l5).merge(l7).merge(l8)
    .map(mapImage)
    .sort('system:time_start')
  
  function mapImage(image) {
    return excludeBand('pixel_qa',
      mask(
        params.mapImage(image)
      ).clip(params.region)
    )
  }
  
  function mask(image) {
    var free = image.select('pixel_qa').bitwiseAnd(2)
    var water = image.select('pixel_qa').bitwiseAnd(4)
    return image
      .updateMask(free.or(water))
  }
  
  function excludeBand(bandName, image) {
    var bandNames = image.bandNames()
    var bandIndexes = ee.List.sequence(0, bandNames.size().subtract(1))
      .filter(
        ee.Filter.neq('item', bandNames.indexOf(bandName))
      )
    return image.select(bandIndexes)
  }

  function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear()
  
    if (month.length < 2) 
        month = '0' + month
    if (day.length < 2) 
        day = '0' + day
  
    return [year, month, day].join('-')
  }

  function mergeObjects(objects) {
    return objects.reduce(function (acc, o) {
      for (var a in o) { acc[a] = o[a] }
      return acc
      }, {})
  }
}  
