var temporalSegmentation = {
  Segments: Segments,
  Segment: Segment,
  Classification: Classification,
  chartPoint: chartPoint
}

/**
 * Wraps a CCDC segments image, to simplify analysis.
 * 
 * segmentsImage: An ee.Image returned by ee.Algorithms.TemporalSegmentation.Ccdc()
 * 
 * dateFormat (default = 0): The date format used in the segmentsImage.
 *    0 = jDays, 1 = fractional years, 2 = unix time in milliseconds
 * 
 * maxSegments (default = 50): The maximum number of segments to allow for a pixel.
 * 
 */
function Segments(segmentsImage, dateFormat, maxSegments) {
  return {
    /**
     * Filters out segments outside of the specified date range. 
     * 
     * fromDate: Start of date range (inclusive). 
     *    Expects an ee.Date or anything that can be used to construct an ee.Date
     * 
     * toDate: End of date range (exclusive).
     *    Expects an ee.Date or anything that can be used to construct an ee.Date
     * 
     * Returns a new Segments instance.
     */
    filterDate: function (fromDate, toDate) {},
    
    /**
     * Creates pairs of segments, where the bands are named from_.* and to_.*.
     * It also includes tStart (from_tStart), tEnd (to_tEnd), and tBreak (from_tBreak).
     * 
     * Returns a new Segments.
     */
    transitions: function () {},
    
    /**
     * Create an intermediate object used to find a specific segment.
     * 
     * Returns a Find.
     */
    find: function () {},
    
    /**
     * Finds a segment for the specified date. If there is no segment for that date, 
     * the strategy argument decides what to do.
     * 
     * date: Date to find segment for.
     *    Expects an ee.Date or anything that can be used to construct an ee.Date
     * 
     * strategy (default = mask): If there isn't a segment for specified date, the specified strategy is applied
     *    mask - mask pixels
     *    closest - pick the closest segment
     *    previous - pick the first segment before the date
     *    next - pick the first segment after the date
     * 
     * Returns a Segment instance with default date set to the specified date.
     */
    findByDate: function (date, strategy) {},
        
    /**
     * Returns the first Segment with default date set to the middle of the segment.
     */
    first: function () {},
    
    /**
     * Returns the last Segment with default date set to the middle of the segment.
     */
    last: function () {},
    
    /**
     * Finds the segment with the min value in provided band name with default date set to the middle of the segment.
     * 
     * bandName: The band name to select Segment based on.
     * 
     * Returns a Segment with default date set to the middle of the segment.
     */
    min: function (bandName) {},
    
    /**
     * Finds the segment with the max value in provided band name.
     * 
     * bandName: The band name to select Segment based on.
     * 
     * Returns a Segment with default date set to the middle of the segment.
     */    
    max: function (bandName) {},

    /**
     * Fit a value for the provided date, using as many harmonics as specified.
     * 
     * If there is a segment for the date, use the model of the segment.
     * If the date fall between two segments, create a new model by interpolating 
     * the model of the surrounding segments. The linear component becomes the line from
     * the end of the previous segment to the start of the next segment, using only the linear coefs.
     * The harmonic coefs becomes an average of the surrounding segments, weighted by how close 
     * the date is to each segment.
     * If the date falls outside of a segment and doesn't have a segment both before and after,
     * it is masked.
     * 
     * date: The date to fit.
     * 
     * harmonics (default = 3): The number of harmonics to use in the fit.
     *    Must be betweeen 0 and 3, where 0 makes a linear fit, and 3 uses all three harmonics.
     * 
     * Returns an ee.Image with the fitted value and the intercept, slope, phase, amplitude, and RMSE for every fitted band.
     */ 
    interpolate: function (date, harmonics) {},
    
    /**
     * Samples the segments.
     * 
     * features: A ee.FeatureCollection of regions to sample over. Each feature
     *    must contain a 'date' property, used to select which segment to sample.
     * 
     * mapSegment: A function that receives a Segment and returns an ee.Image.
     *    The returned image is the image that will get sampled.
     * 
     * scale: The scale in meters to sample in. 
     * 
     * Returns an ee.FeatureCollection.
     */
    sample: function (features, mapSegment, scale) {},
    
    /**
     * Classifies the segments.
     * 
     * classifier: The classifier to use.
     * 
     * mapSegment: A function that receives a Segment and returns an ee.Image.
     *    The returned image is the image that will get classified.
     * 
     * bandName (default = type): Name of the classification band.
     * 
     * Returns a new Segments with a classification band.
     */
    classify: function (classifier, mapSegment, bandName) {},
    
    /**
     * Returns an ee.Image with the number of segments.
     */
    count: function () {},
    
    /**
     * Extracts the segments image provided when constructing the Segments.
     * 
     * selector (optional): The selector to apply to the image. 
     *    This is just a convenience, so 
     *      segments.toImage().select('myBand') 
     *    becomes
     *      segments.toImage('myBand').
     * 
     * Returns an ee.Image.
     */
    toImage: function (selector) {},
    
    /**
     * Converts the Segments to an ee.ImageCollection.
     * The collection will contain maxSegments number of images (specified when
     * constructing the Segments.
     * 
     * Returns ee.ImageCollection
     */
    toCollection: function () {},
    
    /**
     * Exports the segments image specified when constructing the segments, to an
     * EE asset. 
     * 
     * exportArgs: Provide the same arguments as in Export.image.toAsset, except
     *    image - it will get ignored
     *    pyramidingPolicy - defaults to 'sample'
     */
    toAsset: function (exportArgs) {},
    
    /**
     * Returns the dateFormat of the segments.
     */
    dateFormat: function () {},
    
    /**
     * Converts provided date to the date format specified when constructing the segments.
     * 
     * Returns an ee.Number if date is an ee.Date, otherwise a JavaScript number.
     */
    toT: function (date) {},
    
    /**
     * Converts provided date in the date format specified when constructing the segments to a date.
     * 
     * Returns an ee.Date.
     */ 
    fromT: function (t) {},
    
    /**
     * Combines the bands of an image pairwise using the provided algorithm.
     * The resulting image will be named by this pattern: bandA_bandB_suffix.
     * 
     * image: The ee.Image to combine the bands for.
     * 
     * algorithm: A function that receives a pair of bands and returns a new ee.Image.
     * 
     * suffix: The suffix to give the resulting image band names.
     * 
     * Returns an ee.Image.
     */
    combinePairwise: function (image, algorithm, suffix) {}
  }
}


/**
 * Wraps a single CCDC segment image, to simplify analysis.
 * 
 * segmentImage: An axis-0 slice of the ee.Image returned by ee.Algorithms.TemporalSegmentation.Ccdc()
 * 
 * dateFormat: The date format used in the segmentsImage: 
 *    0 = jDays, 1 = fractional years, 2 = unix time in milliseconds
 * 
 * defaultDate: Date to use when fitting and not specifying a date.
 */
function Segment(segmentImage, dateFormat, defaultDate) {
  return {
    /**
     * Fit a value using the segment's model.
     * 
     * options: An object with the below keys.
     *    t (optional): The date to fit, in the dateFormat used when constructing the Segment 
     *        as a number or ee.Image.
     * 
     *    date (default = defaultDate): The date to fit, as an ee.Date, JavaScript Date or unix millis.
     *        Overrides t if both are specified.
     * 
     *    harmonics (default = 3): The number of harmonics to use in the fit.
     *        Must be betweeen 0 and 3, where 0 makes a linear fit, and 3 uses all three harmonics.
     * 
     *    strategy: The strategy to use when date are outside of sequence. 
     *        If 'closest', first or last date of segment will be used,
     *        otherwise, pixel will be masked or extrapolated, depending on 
     *        extrapolateMaxDays and extrapolateMaxFraction options.
     * 
     *    extrapolateMaxDays (default = 0): The max days to extrapolate.
     * 
     *    extrapolateMaxFraction (default = 0): The max fraction of the segment's duration to extrapolate.
     *        Overrides extrapolateMaxDays if both are specified.
     * 
     * Returns an ee.Image.
     */
    fit: function (options) {},
    
    /**
     * Fit the start of the segment.
     * 
     *  harmonics (default = 3): The number of harmonics to use in the fit.
     *      Must be betweeen 0 and 3, where 0 makes a linear fit, and 3 uses all three harmonics.
     * 
     * Returns an ee.Image.
     */
    startFit: function (harmonics) {},
    
    /**
     * Fit the middle of the segment.
     * 
     *  harmonics (default = 3): The number of harmonics to use in the fit.
     *      Must be betweeen 0 and 3, where 0 makes a linear fit, and 3 uses all three harmonics.
     * 
     * Returns an ee.Image.
     */
    middleFit: function (harmonics) {},
    
    /**
     * Fit the end of the segment.
     * 
     *  harmonics (default = 3): The number of harmonics to use in the fit.
     *      Must be betweeen 0 and 3, where 0 makes a linear fit, and 3 uses all three harmonics.
     * 
     * Returns an ee.Image.
     */
    endFit: function (harmonics) {},
    
    /**
     * Calculates the mean of the segment.
     * 
     *  harmonics (default = 3): The number of harmonics to use in the calculation.
     *      Must be betweeen 0 and 3.
     * 
     * Returns an ee.Image.
     */
    mean: function (harmonics) {},
    
    /**
     * Returns an image with the coefs for the specified band name.
     * 
     * bandName: The band name to get the coefs for.
     * 
     * Returns an eight band ee.Image with band names bandName_coefs_n, where n goes from 0 to 7.
     */
    coefs: function (bandName) {},

    /**
     * Extract the intercept from the segment coefs.
     * 
     * Returns an ee.Image.
     */
    intercept: function () {},
    
    /**
     * Extract the slope from the segment coefs.
     * 
     * Returns an ee.Image.
     */
    slope: function () {},

    /**
     * Converts the coefs or provided harmonic to phase.
     * 
     * harmonic (default = 1): The harmonic to get the phase for.
     * 
     * Returns an ee.Image.
     */
    phase: function (harmonic) {},
    
    /**
     * Converts the coefs or provided harmonic to amplitude.
     * 
     * harmonic (default = 1): The harmonic to get the amplitude for.
     * 
     * Returns an ee.Image.
     */
    amplitude: function (harmonic) {},
    
    /**
     * Extracts the segment image provided when constructing the Segment.
     * 
     * selector (optional): The selector to apply to the image. 
     *    This is just a convenience, so 
     *      segment.toImage().select('myBand') 
     *    becomes
     *      segment.toImage('myBand').
     * 
     * Returns an ee.Image.
     */
    toImage: function (selector) {},
    
    /**
     * Returns the dateFormat of the segments.
     */
    dateFormat: function () {},
    
    /**
     * Converts provided date to the date format specified when constructing the segments.
     * 
     * Returns an ee.Number if date is an ee.Date, otherwise a JavaScript number.
     */
    toT: function (date) {},
    
    /**
     * Converts provided date in the date format specified when constructing the segments to a date.
     * 
     * Returns an ee.Date.
     */ 
    fromT: function (t) {}
  }
}


/**
 * The classification of a Segments instance.
 * Note that toAsset() will only export the classificationsImage to EE asset.
 * 
 * classificationsImage: An array image with segment types.
 * 
 * segments: The Segments instance that was classified.
 * 
 * Returns a Segments instance with an additional 'type' band for each segment.
 */
function Classification(classificationsImage, segments) {
  return Segments
}


/**
 * An intermediate object used to find a specific segment.
 */
function Find() {
  return {    
    /**
     * Adds bands to each segment.
     * 
     * expressionOrCallback: An expression to create bands to add to the image. 
     * Segment image is available as 'i' in the expression.
     *    Alternatively, a function that receives a segment and returns an ee.Image for that segment can be provided.
     * 
     * rename (optional): Rename bands to add with specified names.
     * 
     * overwrite (optional): Specifies whether existing bands with same names should be overwritten or not
     * 
     * Returns a new Segments instance.
     */
    addBands: function (expressionOrCallback, rename, overwrite) {},
    
    /**
     * Updates the mask for each segment.
     * 
     * expressionOrCallback: An expression to create a mask. Segment image is available as 'i' in the expression.
     *    Alternatively, a function that receives a segment and returns an ee.Image for that segment can be provided.
     * 
     * expressionArgs (optional): A map of input images available by name in the expression.
     * 
     * Returns a new Segments instance.
     */
    updateMask: function (expressionOrCallback, expressionArgs) {},
        
    /**
     * Returns the first Segment with default date set to the middle of the segment.
     */
    first: function () {},
    
    /**
     * Returns the last Segment with default date set to the middle of the segment.
     */
    last: function () {},
    
    /**
     * Finds the segment with the min value in provided band name with default date set to the middle of the segment.
     * 
     * bandName: The band name to select Segment based on.
     * 
     * Returns a Segment with default date set to the middle of the segment.
     */
    min: function (bandName) {},
    
    /**
     * Finds the segment with the max value in provided band name.
     * 
     * bandName: The band name to select Segment based on.
     * 
     * Returns a Segment with default date set to the middle of the segment.
     */    
    max: function (bandName) {},
  }
}
/**
 * Prints a chart of the segment models and optionally raw pixel values, to the console, for a point.
 * 
 * options: An object with the below keys.
 *    image: The ee.Algorithms.TemporalSegmentation.Ccdc image to extract the models from.
 *    point: The ee.Geometry to extract the models and raw pixel values from.
 *    bandName: The band name to use.
 *    collection (optional): The ee.ImageCollection containing the raw time-series.
 *    callback (optional): Function recieving the chart. If unspecified, chart is simply printed. 
 */
function chartPoint(options) {}
