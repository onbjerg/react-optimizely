import test from 'ava'
import { track } from '../src'
import { mockOptimizelyWindow } from './util'

test('tag: without metadata', (t) => {
  global.window = mockOptimizelyWindow({
    push: ([method, ...args]) => {
      t.is(method, 'trackEvent')
      t.is(args[0], 'my-event')
      t.deepEqual(args[1], {})
    }
  })
  t.is(track('my-event'))
})

test('tag: with revenue', (t) => {
  global.window = mockOptimizelyWindow({
    push: ([method, ...args]) => {
      t.is(method, 'trackEvent')
      t.is(args[0], 'my-event')
      t.deepEqual(args[1], { revenue: 1.00 })
    }
  })
  t.is(track('my-event', 1.00))
})
