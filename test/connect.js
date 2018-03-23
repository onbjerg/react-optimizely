import React from 'react'
import test from 'ava'
import { createRenderer } from 'react-test-render'
import connect from '../src'
import { mockOptimizelyWindow } from './util'

const TestComponent = ({ optimizely: {
  experiment, variant, isActive }
}) => <div />

test('connect: non-existing experiment', (t) => {
  global.window = mockOptimizelyWindow()

  const renderer = createRenderer(
    connect('Experiment A')(TestComponent)
  )
  let frame = renderer.render()

  t.is(typeof frame.props.optimizely, 'object')
  t.is(frame.props.optimizely.experiment, null)
  t.is(frame.props.optimizely.variant, null)
  t.is(frame.props.optimizely.isActive, false)
})

test('connect: non-enabled experiment', (t) => {
  global.window = mockOptimizelyWindow({
    allExperiments: {
      'A': {
        name: 'Experiment A',
        enabled: false
      }
    }
  })

  const renderer = createRenderer(
    connect('Experiment A')(TestComponent)
  )
  let frame = renderer.render()

  t.is(typeof frame.props.optimizely, 'object')
  t.deepEqual(frame.props.optimizely.experiment, {
    name: 'Experiment A',
    enabled: false
  })
  t.is(frame.props.optimizely.variant, null)
  t.is(frame.props.optimizely.isActive, false)
})

test('connect: non-activated experiment', (t) => {
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
    push: ([method, ...args]) => {
      if (method === 'activate') {
        window.optimizely.activeExperiments = window.optimizely.activeExperiments || []
        window.optimizely.activeExperiments.push(args[0])
      }
    }
  })

  const renderer = createRenderer(
    connect('Experiment A')(TestComponent)
  )
  let frame = renderer.render()

  t.is(typeof frame.props.optimizely, 'object')
  t.deepEqual(frame.props.optimizely.experiment, {
    name: 'Experiment A',
    enabled: true
  })
  t.deepEqual(frame.props.optimizely.variant, {
    'name': 'Variant A',
    'code': 'JSCODE'
  })
  t.is(frame.props.optimizely.isActive, true)
})

test('connect: activated and experiment', (t) => {
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
    push: ([method, ...args]) => {
      if (method === 'activate') {
        window.optimizely.activeExperiments = window.optimizely.activeExperiments || []
        window.optimizely.activeExperiments.push(args[0])
      }
    }
  })

  const renderer = createRenderer(
    connect('Experiment A')(TestComponent)
  )
  let frame = renderer.render()

  t.is(typeof frame.props.optimizely, 'object')
  t.deepEqual(frame.props.optimizely.experiment, {
    name: 'Experiment A',
    enabled: true
  })
  t.deepEqual(frame.props.optimizely.variant, {
    'name': 'Variant A',
    'code': 'JSCODE'
  })
  t.is(frame.props.optimizely.isActive, true)
})

test('connect: props pass-through', (t) => {
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
    push: ([method, ...args]) => {
      if (method === 'activate') {
        window.optimizely.activeExperiments = window.optimizely.activeExperiments || []
        window.optimizely.activeExperiments.push(args[0])
      }
    }
  })

  const renderer = createRenderer(
    connect('Experiment A')(TestComponent)
  )
  let frame = renderer.render({ other: 'props' })

  t.is(frame.props.other, 'props')
})
