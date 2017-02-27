import test from 'ava'
import { getVariant } from '../src'
import { mockOptimizelyWindow } from './util'

test('getVariant: returns null without Optimizely API', (t) => {
  t.is(getVariant('Experiment A'), null)
})

test('getVariant: returns null with non-unique experiment name', (t) => {
  global.window = mockOptimizelyWindow({
    allExperiments: {
      'A': {
        name: 'Experiment A'
      },
      'B': {
        name: 'Experiment A'
      }
    }
  })
  t.is(getVariant('Experiment A'), null)
})

test('getVariant: returns null with non-enabled experiment', (t) => {
  global.window = mockOptimizelyWindow({
    allExperiments: {
      'A': {
        name: 'Experiment A',
        enabled: false
      }
    }
  })
  t.is(getVariant('Experiment A'), null)
})

test('getVariant: returns null with non-activated experiment', (t) => {
  global.window = mockOptimizelyWindow({
    allExperiments: {
      'A': {
        name: 'Experiment A',
        enabled: true
      }
    },
    push: () => null
  })
  t.is(getVariant('Experiment A'), null)
})

test('getVariant: returns active variant with activated, enabled and unique experiment name', (t) => {
  global.window = mockOptimizelyWindow({
    allExperiments: {
      'A': {
        name: 'Experiment A',
        enabled: true
      }
    },
    variationMap: {
      'A': {
        'name': 'Variant A',
        'code': 'JSCODE'
      }
    },
    activeExperiments: ['A'],
    push: () => null
  })
  t.deepEqual(getVariant('Experiment A'), {
    name: 'Variant A',
    code: 'JSCODE'
  })
})
