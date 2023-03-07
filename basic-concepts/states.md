---
layout: default
title: States
parent: Basic Concepts
nav_order: 3
---
# States
Once we have components with states we need to define what happens when a component is in that state, how it transitions out and to which state it transitions. In Fault this means a few different things:

1. State triggers a flow
1. State looks up a stock value
1. State advances to another state
1. Nothing happens

In other words, we use the state functions in Fault to define **Mealy** or **Moore** transitions. If you are a little rusty on state machines the 30 second summary is:

| :---- | :----------------|
| **Moore Machines** | State -> State |
| **Meaky Machines** | State + input -> State |

Let's look at the `idle` state in our cache as an example

```
idle: func{
        advance(this.expired) || advance(this.lookupRecord);
    },
```

From an idle state our cache does nothing and it can either advance out of the idle state by expiring records or when a request comes in, handling that request.

Notice there is no logic around which one of those paths the model should take. The `||` operator here tells Fault to choose whichever option makes sense in that scenario, which is something solvers are really good at doing. If we have asserts defined Fault will chose whichever path will result in a failure case. Since both paths are possible we don't need to simulate sending requests or define how often our regular job expiring records runs.

The `idle` function for our container manager, however, looks different

```
idle: func{
        stay();
    },
```

`stay()` means what you think it does. Do nothing. That's because what triggers a state change out of idle for the container manager is the behavior of the cache. Without the cache the container manager will stay idle forever.

```
createRecord:func{
    advance(containerMng.pullContainer);
    },
```

`advance()` can change the state of either the component it is in (notice the `this` keyword in our first example) or other components defined in the system.

## Timing of Advancement
`advance()` and `stay()` can go anywhere in the state function but convention is to put them at the end. Fault will transition the state but not execute the new state until the next loop.

State machines tend to be loops by definition. So if Fault _didn't_ wait until the next interation of the run block to execute the state the machine is advancing into the model would likely run forever.

## Omitting Stay
Strictly speaking `stay()` isn't actually necessary. If you omit it and there are no options to transition out of the current state, you've effectively accomplished the same thing.

But it can be nice to use `stay()` just to make sure the behavior is clear to any non-compilers reading the model. My preference is to omit stay when the state function body is already complex but to include in simple ones.

## Interacting with Stocks and Flows
You can build an entire model just with components and states! Those are Moore Machines and they are good for things like reachability analysis where your primary concern is _can I get to that state from this state?_ and you are less concerned with the exact details of how, just that there is a path available.

Mealy Machines, on the other hand, factor input into the decision whether to transition from one state to another. Perhaps a component can only transition from state A to state B if a value X is set to true.

This is where we bring in `.fspec` files. We need to be able to define under what conditions value X is set to true in order to define the state transition.

In Fault this means representing this value as a stock and having the state machine trigger flows that alter the value of that stock.

### Importing Stocks and Flows
First thing we need to do to specify our state transitions with stocks and flows is import them.

```
import(
        "cache.fspec"
        "orchestrator.fspec"
    );

global record = new cache.record;
global manager = new orchestrator.control;
```

Most of the time it is only necessary to initialize a new instance of the flow, as flows will automatically import and initialize any stocks they are connected to.

### Triggering Flows
For this model we've decided we want to consider how resource utilization affects the behavior of the state machine. So whenever a request comes in, that request is going to change our stocks of resources somehow. Therefore our components being in particular states will trigger flows.

```
lookupRecord: func{
        record.lookup;
        advance(this.returnRecord) || advance(this.createRecord);
    },
    returnRecord: func{
        record.release;
        advance(this.idle);
    },
```

### Consulting Stocks
While we don't see it in this model, we may want to use a stocks value to determine whether a certain state transition happens or not. We can use stocks in various conditionals. For example we may want to only create a container if we have space to create a record for it in our cache

```
createRecord:func{
     if record.machine.block < 5 {
         advance(containerMng.pullContainer);
     }
    },
```

## States as Booleans
States are written and executed as functions, but they can also be referenced as booleans in other states and even other components.

For example if I want to know if the container manager is currently shutting down a container before I try to expire old records from my cache, I can do this

```
expired: func{
        if !containerMng.shutdownContainer{
            record.expire;
            advance(this.idle);
            }
    },
```

If the `shutdownContainer` state is active `containerMng.shutdownContainer` will evaluate to true. If it's inactive it will evaluate to false.