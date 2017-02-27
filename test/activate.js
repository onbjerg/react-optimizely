import test from 'ava'
import { activate } from '../src'
import { mockOptimizelyWindow } from './util'

test('activate: fails without Optimizely API', (t) => {
  t.is(activate('Experiment A'), false)
})

test('activate: fails with non-unique experiment name', (t) => {
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
  t.is(activate('Experiment A'), false)
})

test('activate: fails with non-enabled experiment', (t) => {
  global.window = mockOptimizelyWindow({
    allExperiments: {
      'A': {
        name: 'Experiment A',
        enabled: false
      }
    }
  })
  t.is(activate('Experiment A'), false)
})

test('activate: works with non-activated experiment', (t) => {
  global.window = mockOptimizelyWindow({
    allExperiments: {
      'A': {
        name: 'Experiment A',
        enabled: true
      },
      'B': {
        name: 'Experiment B',
        enabled: true
      }
    },
    push: ([method, ...args]) => {
      if (method === 'activate') {
        window.optimizely.activeExperiments = window.optimizely.activeExperiments || []
        window.optimizely.activeExperiments.push(args[0])
      }
    }
  })
  t.is(activate('Experiment A'), true)
  t.is(activate('Experiment B'), true)
})

test('activate: works with activated experiment', (t) => {
  global.window = mockOptimizelyWindow({
    allExperiments: {
      'A': {
        name: 'Experiment A',
        enabled: true
      },
      'B': {
        name: 'Experiment B',
        enabled: true
      }
    },
    activeExperiments: ['A', 'B'],
    push: ([method, ...args]) => {
      if (method === 'activate') {
        window.optimizely.activeExperiments = window.optimizely.activeExperiments || []
        window.optimizely.activeExperiments.push(args[0])
      }
    }
  })
  t.is(activate('Experiment A'), true)
  t.is(activate('Experiment B'), true)
})
