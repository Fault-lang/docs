---
layout: default
title: Flows
parent: Basic Concepts
nav_order: 5
---
# Flows

Flows are rates of change to the stocks in the model. In our REPL model we are looking at two behaviors: how the orchestrator spins up and shuts down instances and how the cache manages its resources (memory and storage).

When writing a spec you first need to decide either what behavior you want to understand the mechanics of or what behavior you want to prove is impossible. With the orchestrator we want to assert that containers get stood up correctly. Our stocks are a pool of active instances and a pool of loaded images. So we'll define our flows based on how we think those pools will change given the state of the orchestrator.

```
def control = flow{
    p: new pool,
    add: func{
        if p.loading > 0{
            p.loading -> 1;
            p.instances <- 1;
        }
    },
    remove: func{
        p.instances -> 1;
    },
    boot: func{
        p.loading <- 1;
    },
};
```

First we initialize a copy of our defined stock `p: new pool' Since Fault functions do not take arguments we can only access values that either are part of the flow or are defined as constants.

This means we tend to group functions that change the them stock together in the same flow object.

## Changing the Stock Value
Flow functions don't return values. They are _designed_ for side effects, which will certainly annoy some but reflects how systems typically behave. The same activity might affect multiple things at once.

Instead flow's change stock by sending them values.


| Operator | Example | Explanation |
| :----- | :----- | :------|
| `=` | `example.stock = 10;` | Resets the value of the stock to some other value. |
| `->` |  `example.stock -> 10;` | Decrements the stock by the right side value |
| `<-` |`example.stock <- 10;` | Increments the stock by the right side value|

## Swapping the initial stock for another

When you initialize a flow in the run block or the state chart it will automatically create unique instances of the stocks attached to it, but you can swap these out for other instances of the same stock immediately after initialization.

```
for 2 init {
    pool2  = new pool;
    cluster = new control;
    cluster.p = pool2;
} run {}
```
Assignments elsewhere in the model will temporarily overwrite the value of one variable with the current state of the another.

## Concurrent Flows
When calling a flow from the state chart or from the run block it is possible to tell Fault the these functions are running concurrently using a pipe `|` operator. You can see an example of this in `cache.fspec`

```
for 5 init{
    r = new record;
} run {
    r.store | r.release;
};
```

Here's what Fault does in this case: it generates two sets of rules, one where store runs and then release runs and another where release runs and then store runs. It then generates an or statement that asks the model checker to pick between those scenarios.

If there are more than two flows being called it will generate a set of rules for every possible combinations of orders the flows could happen in.

This allows Fault to check for race conditions.