---
layout: default
title: Claude
parent: Generating Fault from LLMs
nav_order: 2
---

# CLAUDE.md — How to Write Fault Models

Fault is a modeling language for finding failures in system designs. This file teaches you how to think about and write Fault models effectively.

## The Core Mindset

**A Fault model that finds no failures is a bad model.**

Fault is not a proof system. It does not verify that your system is correct. It looks for scenarios where your assertions are violated. If it finds none, your assertions are too weak or your model is too simple. Keep tightening the model until it finds something interesting.

Assertions are written as things you *want* to be true. Fault negates them and asks the solver to find a counterexample. If the solver finds one, that's a result, not a failure.

---

## Choosing Your File Structure

| Situation | Use |
|-----------|-----|
| Modeling a single process (how does this thing change over time?) | One `.fspec` file |
| Modeling multiple interacting components with distinct states | One `.fsystem` + one or more `.fspec` files |

Start with `.fspec` only. Add a `.fsystem` when you need to reason about *which mode* a component is in, not just *what values* it holds.

---

## Designing a Model: The Process

### Step 1 — Identify what can go wrong

Before writing any code, ask: what failure modes am I trying to find? What invariants would be violated if the system broke? Write these down as plain English first.

Examples:
- "The cache should never hold more than N records"
- "The container manager should always eventually have an active instance"
- "Two flows shouldn't be able to corrupt shared state if run concurrently"

### Step 2 — Define your stocks

Stocks are reservoirs — things that accumulate and drain. Every variable you care about tracking over time is a stock.

```
def resources = stock{
    blocks: 0,
    table: 0,
};
```

Start with concrete numeric values. Switch to `unknown()` when you want the solver to find interesting starting conditions rather than testing from a fixed baseline.

### Step 3 — Define your flows

Flows are the operations that change stocks. Group functions that affect the same stock together in one flow.

```
def record = flow{
    machine: new resources,
    lookup: func{
        machine.blocks <- 1;
    },
    release: func{
        machine.blocks -> 1;
    },
};
```

`<-` increments, `->` decrements. Flows have no return values — they are side effects by design.

### Step 4 — Write your assertions

Assertions should reflect the invariants you identified in step 1. Write them in terms of your stocks.

```
assert resources.blocks < 4;
assert pool.instances > 0 eventually-always;
```

If you're not sure what to assert, ask: what would have to be true for this system to be working correctly? Assert that. Fault will try to find a case where it isn't.

### Step 5 — Write your run block

The run block defines what happens each round. Use `|` to test concurrent execution.

```
for 5 init {
    r = new record;
} run {
    r.store | r.release;
};
```

The number of rounds should be enough for interesting state to accumulate. Start with 3–5 and increase if the failure you're looking for requires more steps to manifest.

### Step 6 — Add a state machine (if needed)

If your system has distinct operating modes (idle, processing, error, etc.), add a `.fsystem` and import your `.fspec` files into it. The state machine defines *which* flows get triggered and *when*.

---

## Syntax Quick Reference

### Operators

| Op | Meaning | Where |
|----|---------|-------|
| `<-` | Increment stock | flow functions only |
| `->` | Decrement stock | flow functions only |
| `\|\|` | Non-deterministic choice | state functions |
| `\|` | Concurrent execution | run block |
| `advance(this.state)` | Transition to state | state functions |
| `advance(other.state)` | Cross-component transition | state functions |
| `stay()` | Remain in current state | state functions |
| `leave()` | Exit current state | state functions |

### Data Types

| Type | Example | Notes |
|------|---------|-------|
| numeric | `blocks: 0` | All numbers become reals internally |
| boolean | `active: true` | |
| unknown | `blocks` or `blocks: unknown()` | Solver picks the value |
| uncertain | `blocks: uncertain(1, 0.5)` | Normal dist, mean + sigma; returns probabilities |
| string | `s = "description"` | Treated as a boolean in logic expressions |

### Temporal Qualifiers for Assertions

```
assert x > 0;                    // must hold at some point (default)
assert x > 0 always;             // must hold at every step
assert x > 0 eventually;         // must hold at least once
assert x > 0 eventually-always;  // must hold once, then keep holding
assert x > 0 nmt 3;              // must hold no more than 3 times
assert x > 0 nft 2;              // must hold no fewer than 2 times
```

### State Functions

State functions use a restricted body — only state steps are valid, not arbitrary expressions:

```
component foo = states{
    idle: func{
        advance(this.active) || advance(this.expired);
    },
    active: func{
        someFlow.method;
        if someFlow.stock.value > 5 {
            advance(this.idle);
        }
    },
    expired: func{
        stay();
    },
};
```

States can be referenced as booleans in conditions: `if !foo.expired { ... }`

### Imports (fsystem only)

```
import(
    "cache.fspec"
    "orchestrator.fspec"
);

global record = new cache.record;
global manager = new orchestrator.control;
```

Only `.fsystem` files can import. One level only — specs cannot import other specs.

---

## Running Fault

```bash
# Generate SMT only (no solver required — good for checking syntax)
fault -f model.fspec -m smt

# Full model check (requires SOLVERCMD and SOLVERARG env vars)
fault -f model.fspec

# Check reachability — are all states reachable from start?
fault -f model.fsystem -complete

# Inspect the AST (useful for debugging parse issues)
fault -f model.fspec -m ast
```

Required environment for model checking:
```bash
export SOLVERCMD="z3"
export SOLVERARG="-in"
```

Without these set, Fault falls back to SMT output automatically.

---

## Common Mistakes

**Assertions that are too easy to satisfy**
If the solver immediately finds a violation at step 0, your initial stock values may already violate the assertion. Start stocks at values that represent normal operation.

**Assertions that are impossible to violate**
If the model returns no result (unsat), either the assertion is vacuously true given your model, or you need more rounds, more concurrent flows, or weaker assumptions.

**Forgetting that `|` generates all orderings**
`a.fn | b.fn | c.fn` generates 6 permutations. Three concurrent flows is usually enough — more than that makes the SMT very large.

**Mixing up `<-` and `->`**
`<-` is increment (stock receives). `->` is decrement (stock releases). Think of the arrow as showing direction of flow into or out of the stock.

**State functions that do nothing**
`stay()` is optional but make state bodies non-empty — the compiler rejects empty function/state blocks.

**Variable names with underscores**
Not supported. Use camelCase.

**Assuming imported spec run blocks execute**
When a `.fspec` is imported into a `.fsystem`, its run block is ignored. Only its stock/flow definitions and assertions carry over. Define your run block in the `.fsystem` or in the standalone `.fspec`.

---

## A Complete Minimal Example

```
spec queue;

def buffer = stock{
    size: 0,
    capacity: 10,
};

def ops = flow{
    q: new buffer,
    enqueue: func{
        q.size <- 1;
    },
    dequeue: func{
        q.size -> 1;
    },
};

assert buffer.size < buffer.capacity;
assert buffer.size >= 0;

for 8 init {
    w = new ops;
} run {
    w.enqueue | w.dequeue;
};
```

This asks: can concurrent enqueue/dequeue operations push the queue past capacity or below zero? The `|` operator makes Fault try both orderings each round.
