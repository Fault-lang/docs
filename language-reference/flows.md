---
title: Flows
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

First we initialize a copy of our defined stock `p: new pool`. Since Fault functions do not take arguments we can only access values that either are part of the flow or are defined as constants.

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
run init {
    pool2  = new pool;
    cluster = new control;
    cluster.p = pool2;
} {}
```
Assignments elsewhere in the model will temporarily overwrite the value of one variable with the current state of the another.

## Assertions and Assumptions

You can constrain stock values using `assert` and `assume`. Both take an invariant expression and an optional temporal qualifier.

```
assert pool.instances > 0;
assume resources.blocks >= 0;
```

**Temporal qualifiers:**

| Qualifier | Meaning |
|-----------|---------|
| `always` | Must hold in every step |
| `eventually` | Must hold in at least one step |
| `eventually-always` | Must eventually hold and continue to hold |
| `nmt <n>` | Must hold no more than `n` times |
| `nft <n>` | Must hold no fewer than `n` times |

`assert` tells the solver to find a counterexample. `assume` restricts the solution space — the solver will only explore scenarios where the assumption holds.

## Concurrent Flows
When calling a flow from the state chart or from the run block it is possible to tell Fault the these functions are running concurrently using a pipe `|` operator. You can see an example of this in `cache.fspec`

```
run init{
    r = new record;
} {
    r.store | r.release;
    r.store | r.release;
    r.store | r.release;
    r.store | r.release;
    r.store | r.release;
};
```

Here's what Fault does in this case: it generates two sets of rules, one where store runs and then release runs and another where release runs and then store runs. It then generates an or statement that asks the model checker to pick between those scenarios.

If there are more than two flows being called it will generate a set of rules for every possible combinations of orders the flows could happen in.

This allows Fault to check for race conditions.

## Declarative Functions: `unfunc`

`unfunc` is a declarative alternative to `func`. Instead of imperative steps, you declare what a function *requires* (precondition) and what it *emits* (effects).

```
def ops = flow{
    st: new state,

    activate: unfunc{
        emits st.active = true,
    },

    process: unfunc{
        requires st.active,
        emits st.processed = true,
        emits st.active = false,
    },
};
```

`requires` — the condition that must hold for the function to be selected. The solver will only choose this function when the precondition is satisfiable.

`emits` — declares an effect on a stock field. Multiple `emits` clauses are allowed. Supports all assignment forms:

| Form | Meaning |
|------|---------|
| `emits st.x = val` | Set field to value |
| `emits st.x <- expr` | Increment field |
| `emits st.x -> expr` | Decrement field |

`unfunc` is primarily used with [program synthesis](../model-types/program-synthesis) — the solver fills `__` slots by choosing among available `unfunc` definitions.

### `available`

The `available` temporal qualifier asserts that a function's precondition is satisfiable from the initial state:

```
assume process available;
```

Use this when you want to guarantee the solver can actually select a function, not just that it exists.
