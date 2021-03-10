/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var forest = /* color: #98ff00 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-59.15203032276088, -9.052200980266182]),
            {
              "type": 0,
              "date": "2015-01-01",
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([-59.15233073017055, -9.052190385053247]),
            {
              "type": 0,
              "date": "2015-01-01",
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([-59.152631137580215, -9.052169194626472]),
            {
              "type": 0,
              "date": "2015-01-01",
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([-59.18920168574226, -9.081308029858654]),
            {
              "type": 0,
              "date": "2015-01-01",
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([-59.18896565134895, -9.081308029858654]),
            {
              "type": 0,
              "date": "2015-01-01",
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([-59.18866524393928, -9.081297435504647]),
            {
              "type": 0,
              "date": "2015-01-01",
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([-59.188419207304094, -9.081285740530099]),
            {
              "type": 0,
              "date": "2015-01-01",
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([-59.079273456252054, -9.04489867449368]),
            {
              "type": 0,
              "date": "2015-01-01",
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([-59.07928418508811, -9.044681468157874]),
            {
              "type": 0,
              "date": "2015-01-01",
              "system:index": "8"
            })]),
    other = /* color: #8b0000 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-59.129639241904556, -9.050036901547639]),
            {
              "type": 1,
              "date": "2015-01-01",
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([-59.12941125413829, -9.050021008632513]),
            {
              "type": 1,
              "date": "2015-01-01",
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([-59.12911352893764, -9.050036901547639]),
            {
              "type": 1,
              "date": "2015-01-01",
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([-59.10378884633144, -9.057835459377918]),
            {
              "type": 1,
              "date": "2015-01-01",
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([-59.10407316048702, -9.057830161854525]),
            {
              "type": 1,
              "date": "2015-01-01",
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([-59.10433065255245, -9.05785664947072]),
            {
              "type": 1,
              "date": "2015-01-01",
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([-59.10459887345394, -9.057830161854525]),
            {
              "type": 1,
              "date": "2015-01-01",
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([-59.00002652587955, -9.11334971215542]),
            {
              "type": 1,
              "date": "2015-01-01",
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([-59.0000533479697, -9.113630437283097]),
            {
              "type": 1,
              "date": "2015-01-01",
              "system:index": "8"
            }),
        ee.Feature(
            ee.Geometry.Point([-59.0003242510802, -9.113625140584627]),
            {
              "type": 1,
              "date": "2015-01-01",
              "system:index": "9"
            }),
        ee.Feature(
            ee.Geometry.Point([-59.07578658453269, -9.046016490392635]),
            {
              "type": 1,
              "date": "2015-01-01",
              "system:index": "10"
            }),
        ee.Feature(
            ee.Geometry.Point([-59.07442938677116, -9.045995299602195]),
            {
              "type": 1,
              "date": "2015-01-01",
              "system:index": "11"
            })]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var temporalSegmentation = require('users/wiell/temporalSegmentation:temporalSegmentation')

var segmentsImage = ee.Image('users/wiell/CCDCExamples/segments')
Map.centerObject(segmentsImage)

var segments = temporalSegmentation.Segments(segmentsImage)
var referenceData = forest.merge(other)
var trainingData = sample(segments, referenceData, 30)
print('trainingData', trainingData)
var classifier = ee.Classifier.smileRandomForest(20)
  .train(trainingData, 'type')
classify(classifier, '2018-01-01', 30)


function segmentToImage(segment) {
  var image = segment.toImage() 
  var rmse = image.select('.*_rmse')
  var ndfiCoefs = segment.coefs('ndfi')
  var fit = segment.fit({strategy: 'closest'})
  var normalizedDifferences = segments.combinePairwise(fit, normalizedDifference, '_nd')
  var densityObs = image.expression('i.numObs / (i.tEnd - i.tStart)', {i: image})
    .rename('densityObs')
  return ee.Image([rmse, ndfiCoefs, fit, normalizedDifferences, densityObs])
}


function normalizedDifference(img1, img2) {
  return img1.expression('(img1 - img2) / (img1 + img2)', {
    img1: img1, 
    img2: img2
  })
}


function sample(segments, referenceData, resolution) {
  var trainingData = referenceData.map(sampleFeature).flatten()
  var bandOrder = trainingData.first().propertyNames().slice(1)
  return trainingData.set('band_order', bandOrder)
  
  function sampleFeature(feature) {
    var segment = segments.findByDate(ee.Date(feature.get('date')), 'closest')
    return segmentToImage(segment)
      .sample({
        region: feature.geometry(),
        scale: resolution,
        numPixels: 1
      })
      .map(
        function (sample) {
          return ee.Feature(sample)
            .copyProperties({
              source: ee.Feature(feature), 
              exclude: ['date']
            })
        }
      )
  }
}


function classify(classifier, date, resolution) {
  var image = segmentToImage(segments.findByDate(date, 'closest'))
  var classification = image
    .classify(classifier.setOutputMode('CLASSIFICATION'))
  var description = 'classification-' + date
  Export.image.toAsset({
    image: classification,
    description: description,
    scale: resolution,
    maxPixels: 1e13
  })
  
  Map.addLayer(image, {bands: 'swir2,nir,red', min: [0, 500, 200], max: [1800, 6000, 3500]}, 'image', false)
  Map.addLayer(classification, {min: 0, max: 1, palette: 'green,red'}, 'classification', true)
}
