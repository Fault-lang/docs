---
title: Claude
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

The run block defines the sequence of steps to verify. Each line is one round. Use `|` to test concurrent execution. Instantiate your flows in the `init` section.

```
run init {
    r = new record;
} {
    r.store | r.release;
    r.store | r.release;
    r.store | r.release;
    r.store | r.release;
    r.store | r.release;
};
```

The number of steps should be enough for interesting state to accumulate. Start with 3–5 and increase if the failure you're looking for requires more steps to manifest.

### Step 6 — Add a state machine (if needed)

If your system has distinct operating modes (idle, processing, error, etc.), add a `.fsystem` and import your `.fspec` files into it. The state machine defines *which* flows get triggered and *when*.

---

## Syntax Quick Reference

### Operators

| Op | Meaning | Where |
|----|---------|-------|
| `<-` | Increment stock | flow functions only |
| `->` | Decrement stock | flow functions only |
| `=` | Overwrite stock value | flow functions only |
| `\|\|` | Non-deterministic choice | state functions |
| `\|` | Concurrent execution | run block |
| `::count` | Count instances of a `multiple` flow | `assume l::count < 5` |
| `when A then B` | Conditional invariant (A implies B) | `assert`/`assume` only |
| `advance(this.state)` | Transition to state | state functions |
| `advance(other.state)` | Cross-component transition | state functions |
| `stay()` | Remain in current state | state functions |
| `leave()` | Exit current state | state functions |

### Data Types

| Type | Example | Notes |
|------|---------|-------|
| numeric | `blocks: 0` | All numbers become reals internally |
| boolean | `active: true` | |
| unknown | `blocks` or `blocks: unknown()` | Solver picks any value |
| uncertain | `blocks: uncertain(1, 0.5)` | Normal dist, mean + sigma; returns probabilities |
| string | `s = "description"` | Treated as a boolean in logic expressions |
| `int()` | `offset: int()` | Solver picks any integer |
| `float()` | `reading: float()` | Solver picks any float |
| `bool()` | `flag: bool()` | Solver picks true or false |
| `natural(n)` | `size: natural(0)` | Non-negative integer starting from n |
| `whole()` | `ticks: whole()` | Non-negative integer, unconstrained start |
| `param()` | `threshold: param()` | Template parameter — filled in by `fault render` |

### Temporal Qualifiers for Assertions

```
assert x > 0;                    // must hold at some point (default)
assert x > 0 always;             // must hold at every step
assert x > 0 eventually;         // must hold at least once
assert x > 0 eventually-always;  // must hold once, then keep holding
assert x > 0 nmt 3;              // must hold no more than 3 times
assert x > 0 nft 2;              // must hold no fewer than 2 times
assume myFunc available;         // unfunc precondition is satisfiable from initial state
```

### State Functions

State functions use a restricted body — only state steps are valid, not arbitrary expressions:

```
component foo = states{
    idle: sfunc{
        advance(this.active) || advance(this.expired);
    },
    active: sfunc{
        someFlow.method;
        if someFlow.stock.value > 5 {
            advance(this.idle);
        }
    },
    expired: sfunc{
        stay();
    },
};
```

States can be referenced as booleans in conditions: `if !foo.expired { ... }`

### Stock Inheritance

A stock can inherit all fields from another using `extends`. Use `exclude` to drop specific fields.

```
def base = stock{
    value: 0,
    limit: 100,
};

def extended = stock{
    extends base,        // inherits value and limit
    extra: 5,
};

def minimal = stock{
    extends base,
    exclude limit,       // inherits value only
};
```

---

### Declarative Functions: `unfunc`

`unfunc` replaces `func` when you want to declare preconditions and effects rather than write imperative steps. Used with program synthesis.

```
def ops = flow{
    q: new queue,
    process: unfunc{
        requires q.pending > 0,    // precondition
        emits q.pending -> 1,      // effect: decrement
        emits q.done <- 1,         // effect: increment
    },
};
```

`requires` — solver only selects this function when the condition holds.
`emits` — declares an effect. Supports `=`, `<-`, `->`.

---

### Program Synthesis

Use `__` (synthesis slots) in the run block and `assume` (not `assert`) as goals. The solver fills each slot with a function call that satisfies the goal.

```
// Goal: find ops that reach balance > 100
assume wallet.balance > 100 eventually;

run init {
    acct = new ops;
} {
    __;
    __;
    __;
    __;
    __;
};
```

Key rules:
- `__` slots are independent — the solver may pick a different function for each
- Use `assume` for synthesis goals, never `assert` (assert looks for violations, assume restricts to satisfying solutions)
- Mix explicit steps and `__` freely: `acct.deposit; __; __;`
- If the goal is unreachable in the given number of steps, the solver returns `unsat` — add more `__` slots

---

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
# Full model check (requires SOLVERCMD and SOLVERARG env vars or ~/.faultrc)
fault -f model.fspec

# Generate SMT only (no solver required — good for checking syntax)
fault -f model.fspec -m smt --output smt

# Type-check without compiling
fault lint -f model.fspec

# Check reachability — are all states reachable from start?
fault -f model.fsystem --complete

# Inspect the AST (useful for debugging parse issues)
fault -f model.fspec -m ast

# JSON output (result to stdout, warnings to stderr)
fault -f model.fspec --format json
```

Required environment for model checking:
```bash
export SOLVERCMD="z3"
export SOLVERARG="-in"
```

Without these set, Fault returns an error in model mode. Use `-m smt` with `--output smt` to inspect generated SMT without a solver.

---

## Common Mistakes

**Assertions that are too easy to satisfy**
If the solver immediately finds a violation at step 0, your initial stock values may already violate the assertion. Start stocks at values that represent normal operation.

**Assertions that are impossible to violate**
If the model returns no result (unsat), either the assertion is vacuously true given your model, or you need more steps in the run block, more concurrent flows, or weaker assumptions.

**Forgetting that `|` generates all orderings**
`a.fn | b.fn | c.fn` generates 6 permutations. Three concurrent flows is usually enough — more than that makes the SMT very large.

**Mixing up `<-` and `->`**
`<-` is increment (stock receives). `->` is decrement (stock releases). Think of the arrow as showing direction of flow into or out of the stock.

**State functions that do nothing**
`stay()` is optional but make state bodies non-empty — the compiler rejects empty function/state blocks.

**Variable names with underscores**
Not supported. Use camelCase.

**Using `assert` as a synthesis goal**
In synthesis mode, `assert` looks for violations — it will immediately find a counterexample at the initial state if the condition isn't trivially satisfied. Use `assume` to express what you want the solver to find. `assert` is for safety properties; `assume` is for synthesis goals.

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

run init {
    w = new ops;
} {
    w.enqueue | w.dequeue;
    w.enqueue | w.dequeue;
    w.enqueue | w.dequeue;
    w.enqueue | w.dequeue;
    w.enqueue | w.dequeue;
    w.enqueue | w.dequeue;
    w.enqueue | w.dequeue;
    w.enqueue | w.dequeue;
};
```

This asks: can concurrent enqueue/dequeue operations push the queue past capacity or below zero? The `|` operator makes Fault try both orderings each round.
