import test from 'ava'
import { variate } from '../src'

test('variate: returns default if no variant was specified', (t) => {
  t.is(variate({
    'Variant A': 'Stuff A',
    default: 'Default stuff'
  }), 'Default stuff')
})

test('variate: returns default the variant is not in the map', (t) => {
  t.is(variate({
    'Variant A': 'Stuff A',
    default: 'Default stuff'
  }, {
    name: 'Variant B'
  }), 'Default stuff')
})

test('variate: returns variant result based on the variant name', (t) => {
  t.is(variate({
    'Variant A': 'Stuff A',
    default: 'Default stuff'
  }, {
    name: 'Variant A'
  }), 'Stuff A')
})

test('variate: variant results can be functions', (t) => {
  t.is(variate({
    'Variant A': () => 'Stuff A',
    default: 'Default stuff'
  }, {
    name: 'Variant A'
  }), 'Stuff A')
})
