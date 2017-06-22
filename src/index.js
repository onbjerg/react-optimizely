import React from 'react'

/**
 * Check if we're running in a browser.
 *
 * @return {!boolean}
 */
const isBrowser = () =>
  typeof window !== 'undefined'

/**
 * Check if the Optimizely API is present.
 *
 * @return {!boolean}
 */
const isOptimizelyLoaded = () =>
  isBrowser() && window['optimizely']

/**
 * Shorthand helper to get a given key from `window['optimizely']`
 *
 * @param  {?string} [key=null]
 *         An optional key to get on the Optimizely client
 * @return {*}
 *         Returns the key from the Optimizely client, or the Optimizely client itself
 */
const optimizely = (key = null) => {
  if (!isOptimizelyLoaded()) {
    throw Error('Optimizely JS API not found.')
  }

  return key
    ? window['optimizely'][key]
    : window['optimizely']
}

/**
 * Get all registered Optimizely experiments.
 *
 * @return {Object.<string, Object>}
 *         A hash-map-like object in the form `<id, experiment>`
 */
export const getAllExperiments = () =>
  (isOptimizelyLoaded() ? optimizely('allExperiments') || {} : {})

/**
 * Get the activated experiments for the current visitor.
 *
 * @return {string[]}
 *         An array containing the IDs of the activated experiments.
 */
export const getActiveExperiments = () =>
  (isOptimizelyLoaded() ? optimizely('activeExperiments') || [] : [])

/**
 * Get all registered Optimizely variations.
 *
 * @return {Object.<string, Object>}
 *         A hash-map-like object in the form `<id, experiment>`
 */
export const getAllVariations = () =>
  (isOptimizelyLoaded() ? optimizely('allVariations') || {} : {})

/**
 * Get the variation map.
 *
 * @return {Object}
 *         This is a hash table whose keys are the experiment ids of
 *         experiments running for the visitor (including inactive
 *         experiments for which the user has been bucketed), and whose
 *         values are the variation indexes for those experiments.
 */
export const getVariationMap = () =>
  (isOptimizelyLoaded() ? optimizely('variationMap') || {} : {})

/**
 * Get the variation map.
 *
 * @return {Object}
 *         This is a hash table whose keys are the experiment ids of
 *         experiments running for the visitor (including inactive
 *         experiments for which the user has been bucketed), and whose
 *         values are the variation names for those experiments.
 */
export const getVariationNamesMap = () =>
  (isOptimizelyLoaded() ? optimizely('variationNamesMap') || {} : {})

/**
 * Get the variation Ids map.
 *
 * @return {Object}
 *         This is a hash table whose keys are the experiment ids of
 *         experiments running for the visitor (including inactive
 *         experiments for which the user has been bucketed), and whose
 *         values are the variation names for those experiments.
 */
export const getVariationIdsMap = () =>
  (isOptimizelyLoaded() ? optimizely('variationIdsMap') || {} : {})

/**
 * Trigger an API call through the Optimizely client.
 *
 * @param  {!string} method
 *         The method to call (i.e. `trackEvent`)
 * @param  {...*} [args]
 *         A variable number of arguments to pass to the call.
 * @return {undefined}
 */
export const call = (method, ...args) => {
  window['optimizely'] = window['optimizely'] || []
  try {
    window['optimizely'].push([method, ...args])
  } catch (err) {
    console.error(`react-optimizely`, err)
  }
}

/**
 * Activate an experiment by ID for the current user.
 *
 * @param  {!string} experimentId
 * @return {undefined}
 */
export const activateExperiment = (experimentId) => {
  call('activate', experimentId)
}

/**
 * Get the possible experiment IDs for a given experiment name.
 *
 * @param  {!string} experimentName
 * @return {string[]}
 */
export const getPossibleIds = (experimentName) => {
  let allExperiments = getAllExperiments()
  return Object.keys(allExperiments).filter((key) => {
    return allExperiments[key].name === experimentName
  })
}

/**
 * Get an experiment's ID from their name.
 *
 * @param  {!string} experimentName
 * @return {?string}
 *         The ID of the experiment or `null` if the
 *         experiment was not found.
 */
export const getExperimentId = (experimentName) => {
  let id = getPossibleIds(experimentName).pop()
  return id || null
}

/**
 * Get an experiment by their ID.
 *
 * @param  {!string} experimentId
 * @return {?Object}
 *         The experiment or `null` if it was not found.
 */
export const getExperimentById = (experimentId) => {
  const allExperiments = getAllExperiments()
  const experiment = allExperiments[experimentId]

  return experiment || null
}

/**
 * Get an experiment by name.
 *
 * @param  {!string} experimentName
 * @return {?Object}
 *         The experiment or `null` if it was not found.
 */
export const getExperimentByName = (experimentName) => {
  return getExperimentById(getExperimentId(experimentName))
}

/**
 * Check if an experiment is enabled.
 *
 * Please note that this flag does _not_ constitute
 * whether or not the experiment is **active**.
 *
 * @param  {!string}  experimentName
 * @return {!boolean}
 */
export const isEnabled = (experimentName) => {
  let experiment = getExperimentByName(experimentName)
  return (experiment && experiment.enabled)
}

/**
 * Check if an experiment's name is unique.
 *
 * @param  {!string} experimentName
 * @return {!boolean}
 *         Returns `false` if the experiment name could resolve
 *         to more than 1 experiment ID.
 */
export const isNameUnique = (experimentName) => {
  return getPossibleIds(experimentName).length <= 1
}

/**
 * Check whether or not an experiment is active.
 *
 * @param  {!string} experimentName
 * @return {!boolean}
 */
export const isActive = (experimentName) => {
  const experimentId = getExperimentId(experimentName)
  const activateExperiments = getActiveExperiments()

  return activateExperiments
    .filter((id) => id === experimentId).length > 0
}

/**
 * Activate an experiment.
 *
 * @param  {!string} experimentName
 *         The name of the experiment to activate.
 * @return {!boolean}
 *         Returns `true` if the experiment is active, `false` otherwise
 */
export const activate = (experimentName) => {
  // Can't activate experiments that are unidentifiable
  // by name, or experiments that are disabled
  if (isOptimizelyLoaded() &&
    !isNameUnique(experimentName) ||
    !isEnabled(experimentName)) {
    return false
  }

  const experimentId = getExperimentId(experimentName)
  // Activate the experiment if it is not already
  if (!isActive(experimentName) && experimentId) {
    activateExperiment(experimentId)
  }

  return isActive(experimentName)
}

/**
 * Get the current variant for the current user and a given experiment.
 *
 * @param  {!string} experimentName The experiment name
 * @return {?Object}
 *         The current variant, or `null` if the experiment is
 *         not activated, not enabled or the experiment name
 *         could not be resolved to a singular experiment ID.
 */
export const getVariant = (experimentName) => {
  const variationIdsMap = getVariationIdsMap()
  if (isOptimizelyLoaded() &&
    isNameUnique(experimentName) &&
    isEnabled(experimentName) &&
    isActive(experimentName)) {
    return variationIdsMap[getExperimentId(experimentName)]
  }

  return null
}

/**
 * Add custom tags to this session.
 *
 * @param  {...Object} rawTags
 *         A variable number of tags as key-value pairs,
 *         e.g. ``{ user: 1 }, { foo: 'bar', bar: 'baz' }``
 * @return {undefined}
 */
export const tag = (...rawTags) => {
  let tags = {}
  rawTags.forEach((tag) => {
    if (typeof tag !== 'object') throw Error(`Expected tag to be an object, got ${typeof tag}`)
    tags = Object.assign(tags, tag)
  })

  call('customTag', tags)
}

/**
 * Track a custom event.
 *
 * @param  {!string} event
 *         The event to track.
 * @param  {?number} [revenue=null]
 *         An optional amount of revenue for this event (in cents)
 * @return {undefined}
 */
export const track = (event, revenue = null) => {
  let metadata = {}
  if (revenue !== null) {
    metadata.revenue = revenue
  }

  call('trackEvent', event, metadata)
}

/**
 * A helper to variate between different results based on
 * the current experiment variant.
 *
 * @param  {object} variantToResultMap
 *         An object whose keys are variant names and values
 *         are the results for the given variant. The values
 *         can either be strings or functions.
 * @return {*}
 *         The result for the given variant, or the default
 *         result if a result for the current variant was
 *         not found.
 */
export const variate = (variantToResultMap, variant) => {
  let result = variantToResultMap['default']
  if (variant !== undefined &&
    variantToResultMap.hasOwnProperty(variant.name)) {
    result = variantToResultMap[variant.name]
  }

  if (typeof result === 'function') {
    return result()
  }
  return result
}

/**
 * Wrap a React component in an Optimizely experiment.
 *
 * The wrapped component is passed a prop, `optimizely`,
 * that is an object with three keys:
 *
 * - `experiment` (?object): The Optimizely experiment
 * - `variant` (?object): The current experiment variant
 * - `isActive` (!boolean): Whether or not the experiment is active
 *
 * If the experiment could not be activated (see {@link activate}),
 * then `isActive` is set to `false` and both the `experiment`
 * and `variant` props are nulled.
 *
 * @param  {!string} experimentName
 *         The experiment name
 * @return {Function}
 *         A function to wrap your component in.
 */
export default (experimentName) =>
  /**
   * @param  {React.Component} Component
   *         The component to wrap
   * @return {Function}
   *         The wrapped component
   */
  (Component) =>
    class withExperiment extends React.Component {

      render () {
        const {props} = this

        // Activate the experiment
        const isActive = activate(experimentName)

        // Get experiment and variant information
        const experiment = getExperimentByName(experimentName)
        const variationsForExperiment = getVariant(experimentName)

        if (variationsForExperiment && variationsForExperiment.length) {
          const variant = getAllVariations()[variationsForExperiment[0]]

          return <Component optimizely={{ experiment, variant, isActive }} {...props} />
        } else {
          return <Component
            optimizely={{ experiment, variant: null, isActive }} {...props} />
        }
      }
    }
