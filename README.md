# `react-optimizely` [![NPM](https://img.shields.io/npm/v/react-optimizely.svg?style=flat)](https://www.npmjs.org/package/react-optimizely) [![travis-ci](https://travis-ci.org/onbjerg/react-optimizely.svg?branch=master)](https://travis-ci.org/onbjerg/react-optimizely) [![Greenkeeper](https://badges.greenkeeper.io/onbjerg/react-optimizely.svg)](https://greenkeeper.io/)

React helpers for A/B testing with [Optimizely](https://optimizely.com).

**Quick Start Example**

```js
import React from 'react'
import optimizely, { variate } from 'react-optimizely'

class MyComponent extends React.Component {
  render () {
    return variate({
      'Variant A': () => <div>Variant A</div>,
      'Variant B': () => <div>Variant B for {this.props.optimizely.experiment.name}</div>,
      default: () => <div>No variant</div>
    }, this.props.optimizely.variant)
  }
}

export default optimizely('Experiment A')(MyComponent)
```

---

## Installation

```sh
npm install --save react-optimizely
```

Or even better

```sh
yarn add react-optimizely
```

## API

#### optimizely

Wraps a React component and injects props with information about an experiment and it's current variant.

The props injected are ``experiment``, ``variant`` and ``isActivated``.

If the experiment does not exist, then ``experiment`` and ``variant`` is ``null`` and ``isActivated`` is ``false``. Otherwise ``experiment`` is an object.

If the experiment is not enabled or not activated, then ``variant`` is ``null`` and ``isActivated`` it false.

**Parameters**

-   `experimentName` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the experiment, as it is in Optimizely.

**Examples**

```js
import React from 'react'
import optimizely from 'react-optimizely'

class MyComponent extends React.Component {
  render () {
    const {
      experiment,
      variant,
      isActivated
    } = this.props.optimizely

    const result = []
    if (experiment) {
      result.push(<div>Experiment: {experiment.name} ({isActivated ? 'Activated' : 'Not activated' })</div>)
    }
    if (variant) {
      result.push(<div>Variant: {variant.name}, {variant.code}</div>)
    }

    return result
  }
}

export default optimizely('Experiment A')(MyComponent)
```

Returns a **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** that takes a React component to wrap, that returns the wrapped component.

#### variate

Helper function to render different results based on the current variant.

Takes an object whose keys are variant names and whose values are the result for the given variant. The value can be of any type. If the value is a function, then ``variate`` returns the result of the given function.

The value for the special key ``default`` is returned if the current variant does not exist in the map, or if the variant was not specified (i.e. the experiment is not activated or not found).

**Parameters**

-   `variantToResultMap` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** An object whose keys are variant names and whose values are the result for the given variant.
-   `variant` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** The current variant for the experiment

**Examples**

```js
import React from 'react'
import optimizely, { variate } from 'react-optimizely'

class MyComponent extends React.Component {
  render () {
    return variate({
      'Variant A': () => <div>Variant A</div>,
      'Variant B': () => <div>Variant B for {this.props.optimizely.experiment.name}</div>,
      default: () => <div>No variant</div>
    }, this.props.optimizely.variant)
  }
}

export default optimizely('Experiment A')(MyComponent)
```

```js
import React from 'react'
import optimizely, { variate } from 'react-optimizely'

class MyComponent extends React.Component {
  render () {
    return <div>{variate({
      'Variant A': 'Hello, world',
      'Variant B': 'Hello, internet',
      default: 'Hello'
    }, this.props.optimizely.variant)}</div>
  }
}

export default optimizely('Experiment A')(MyComponent)
```

#### activate

Activates an experiment for the given visitor.

Note that the experiment is **not** activated if: the experiment doesn't exist, the experiment is not enabled or if the experiment name is not unique.

**Parameters**

- `experimentName` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The experiments name

**Examples**

```js
import React from 'react'
import { activate } from 'react-optimizely'

class MyComponent extends React.Component {
  activateExperiment () {
    activate('Experiment B')
  }
  render () {
    return <button onClick={this.activateExperiment>Activate experiment</button>
  }
}

export default MyComponent
```

Returns true if the experiment was activated and false otherwise.

#### getVariant

Gets the current variant for an experiment.

Note that the function returns null if the experiment is not activated, enabled or if it does not exist.

**Parameters**

- `experimentName` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The experiments name

**Examples**

```js
import React from 'react'
import { getVariant } from 'react-optimizely'

class MyComponent extends React.Component {
  currentVariantNameForExperiment (experimentName) {
    let variant = getVariant(experimentName)
    if (!variant) return null
    return variant.name
  }
  render () {
    return [
      <div>Activated variants</div>,
      <div>Experiment A: {this.currentVariantNameForExperiment('Experiment A')}</div>,
      <div>Experiment B: {this.currentVariantNameForExperiment('Experiment B')}</div>,
      <div>Experiment C: {this.currentVariantNameForExperiment('Experiment C')}</div>
    ]
  }
}

export default MyComponent
```

Returns the variant (as described on the Optimizely JS API reference) or null.

#### tag

Add custom tags to the current session.

**Parameters**

- `rawTags` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)**... A variadic number of objects whose keys are tag names and values are tag values

**Examples**

```js
import React from 'react'
import { tag } from 'react-optimizely'

class MyComponent extends React.Component {
  onPurchase () {
    tag({ purchased: true, purchasedAt: Date.now }, { foo: 'bar' })
  }
  render () {
    return <button onClick={this.onPurchase}>Purchase</button>
  }
}

export default MyComponent
```

Returns undefined.

#### track

Track an event.

**Parameters**

- `event`  **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The event name
- ``revenue`` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** **Optional**: The amount of revenue generated from this event (in cents)

**Examples**

```js
import React from 'react'
import { track } from 'react-optimizely'

class MyComponent extends React.Component {
  onPurchase () {
    track('purchase', 495) // $4.95 in revenue
  }
  render () {
    return <button onClick={this.onPurchase}>Purchase</button>
  }
}

export default MyComponent
```

Returns undefined.
