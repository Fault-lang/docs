---
title: Stock-Flow Models
---

# Stock-Flow Models

A stock-flow model is the right choice when you want to reason about **resources that accumulate and drain over time** — queues, pools, budgets, rate limits, memory, tokens. The core question is: *can the values of these resources reach a bad state?*

Stock-flow models live in a single `.fspec` file. There is no state machine — just stocks, flows, assertions, and a run block that specifies the sequence of operations to verify.

**Use stock-flow models when:**
- You have numeric quantities that change over time
- You want to find overflow, underflow, starvation, or exhaustion scenarios
- You want to check that concurrent operations don't corrupt shared state

---

## Worked Example: Token Bucket Rate Limiter

A token bucket rate limiter refills at a fixed rate and consumes one token per accepted request. We want to verify two properties:

1. The bucket never goes negative (no over-consumption)
2. The bucket never exceeds capacity (no over-refill)

### Defining the Stocks

Stocks represent the quantities we want to track. Here the bucket has a `tokens` count and a fixed `capacity`.

```
spec tokenBucket;

def bucket = stock{
    tokens: 10,
    capacity: 10,
};
```

`tokens: 10` sets the starting value. The Fault compiler treats all numbers as reals internally, so integers and floats are interchangeable.

### Defining the Flows

Flows define operations that change stock values. The `<-` operator increments, `->` decrements.

```
def limiter = flow{
    b: new bucket,

    refill: func{
        if b.tokens < b.capacity {
            b.tokens <- 1;
        }
    },

    consume: func{
        if b.tokens > 0 {
            b.tokens -> 1;
        }
    },
};
```

The guard conditions (`if b.tokens > 0`) constrain when each function can execute. Fault will still explore scenarios where the guard doesn't hold — the function just becomes a no-op in that path.

### Writing the Assertions

```
assert bucket.tokens >= 0;
assert bucket.tokens <= bucket.capacity;
```

`assert` tells the solver to find a counterexample — a scenario where these properties are violated. If it finds one, the trace shows exactly which sequence of operations caused it.

### The Run Block

The `run` block instantiates the flow and specifies the sequence of operations to verify. The `|` operator means the two functions can execute in either order — Fault explores both.

```
run init {
    rl = new limiter;
} {
    rl.refill | rl.consume;
    rl.refill | rl.consume;
    rl.refill | rl.consume;
    rl.refill | rl.consume;
    rl.refill | rl.consume;
};
```

Five rounds, each with a non-deterministic choice of whether to refill or consume first. Fault checks that both assertions hold across all possible orderings.

### Complete Model

```
spec tokenBucket;

def bucket = stock{
    tokens: 10,
    capacity: 10,
};

def limiter = flow{
    b: new bucket,

    refill: func{
        if b.tokens < b.capacity {
            b.tokens <- 1;
        }
    },

    consume: func{
        if b.tokens > 0 {
            b.tokens -> 1;
        }
    },
};

assert bucket.tokens >= 0;
assert bucket.tokens <= bucket.capacity;

run init {
    rl = new limiter;
} {
    rl.refill | rl.consume;
    rl.refill | rl.consume;
    rl.refill | rl.consume;
    rl.refill | rl.consume;
    rl.refill | rl.consume;
};
```

---

## Making It More Interesting

### Unknown starting values

Replace fixed values with `unknown()` to let the solver pick starting conditions:

```
def bucket = stock{
    tokens,           // solver picks any starting value
    capacity: 10,
};
```

This will immediately surface the underflow case if the guard conditions are insufficient.

### Testing concurrent producers and consumers

```
run init {
    rl = new limiter;
} {
    rl.consume | rl.consume;
    rl.refill;
    rl.consume | rl.consume;
    rl.refill;
};
```

Two simultaneous consumers each round — does the guard prevent the bucket from going negative even when two consumers race?

---

## Key Concepts

- **[Stocks](../language-reference/stocks)** — reservoirs of resources
- **[Flows](../language-reference/flows)** — operations that change stocks
- **[Data Types](../data-types/)** — numeric, boolean, unknown, uncertain, and more
- **[Invariants](../invariants/)** — assertions and temporal qualifiers
