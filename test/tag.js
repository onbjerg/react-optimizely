import test from 'ava'
import { tag } from '../src'
import { mockOptimizelyWindow } from './util'

test('tag: works with 1 object', (t) => {
  global.window = mockOptimizelyWindow({
    push: ([method, ...args]) => {
      t.is(method, 'customTag')
      t.is(args[0].foo, 'bar')
      t.is(args[0].bar, 'baz')
    }
  })
  t.is(tag({ foo: 'bar', 'bar': 'baz' }))
})

test('activate: works with multiple objects', (t) => {
  global.window = mockOptimizelyWindow({
    push: ([method, ...args]) => {
      t.is(method, 'customTag')
      t.is(args[0].foo, 'bar')
      t.is(args[0].bar, 'baz')
    }
  })
  t.is(tag({ foo: 'bar' }, { 'bar': 'baz' }))
})
