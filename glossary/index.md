---
title: Glossary
---

# Glossary

All Fault keywords, operators, builtins, and types — alphabetical order.

One-liners cover items whose meaning is self-evident from the name. Entries with non-obvious behavior include a short example.

---

## `!`
Logical NOT. Negates a boolean expression in assertions, assumptions, and state conditions.

---

## `&&`
Logical AND. Combines boolean expressions in assertions and assumptions.

---

## `<-`
Increment operator. Adds the right-hand value to a stock field. Only valid inside flow functions.

```
p.instances <- 1;   // p.instances = p.instances + 1
```

---

## `->`
Decrement operator. Subtracts the right-hand value from a stock field. Only valid inside flow functions.

```
p.instances -> 1;   // p.instances = p.instances - 1
```

---

## `=` (in flow functions)
Overwrite operator. Resets a stock field to the given value, discarding the previous value.

```
s.active = true;    // overwrite, not increment
```

Not to be confused with `==` (equality comparison) used in assertions.

---

## `||`
Logical OR. In state functions, signals a non-deterministic choice — the solver picks whichever branch satisfies the constraints. In assertions and assumptions, standard boolean OR.

See also: [`choose`](#choose).

---

## `::` (characteristic access)
Accesses an aggregate property of a [`multiple`](#multiple) flow set. Currently only `count` is supported.

```
run init { l = multiple faucet; } {
    l.in;
};
assume l::count < 5;
```

`l::count` is the number of flow instances the solver created for `l`.

---

## `__` (synthesis slot) {#synthesis-slot}
A placeholder in the run block for program synthesis. The solver picks which flow function to call at this step. Each slot is resolved independently.

```
run init { inst = new ops; } {
    __;
    __;
    inst.deposit;   // explicit step can be mixed in
    __;
};
```

Use `assume` (not `assert`) to express the synthesis goal. See [Program Synthesis](../model-types/program-synthesis).

---

## `advance()`
Transitions a component to the named state. Can target the current component (`this`) or another component by name.

```
advance(this.idle)          // transition self to idle
advance(replica.promoting)  // transition another component
```

`advance()` is only valid inside state functions in a `.fsystem` file.

---

## `always`
Temporal qualifier. The assertion must hold at every step of the model.

```
assert buffer.size >= 0 always;
```

---

## `assert`
Declares an invariant Fault should try to *violate*. The solver looks for a counterexample — a scenario where the expression is false. If it finds one, that trace is the result.

```
assert pool.instances > 0;
assert queue.size < queue.capacity always;
```

See [Assertions](../invariants/assertions).

---

## `assume`
Restricts the solver to scenarios where the expression is true. In synthesis mode, `assume` expresses the goal the solver must satisfy.

```
assume resources.blocks >= 0;          // axiom: solver only explores valid states
assume wallet.balance > 100 eventually; // synthesis goal: find ops that reach this
```

See [Assumptions](../invariants/assumptions).

---

## `available`
Temporal qualifier for `unfunc`. Asserts that a function's `requires` precondition is satisfiable from the initial state.

```
assume process available;
```

Use this to guarantee the solver can actually select the function, not just that it is defined. See [`unfunc`](#unfunc).

---

## `bool()`
Declares a stock field as an explicit boolean solvable — the solver picks `true` or `false`.

```
def s = stock{
    flag: bool(),
};
```

---

## `choose`
Makes a non-deterministic exclusive-or choice explicit. `choose A || B || C` ensures exactly one branch is taken — the solver cannot take multiple branches simultaneously.

```
idle: sfunc{
    choose advance(this.active) || advance(this.expired);
},
```

`choose` is optional — `||` already implies non-deterministic choice — but makes intent clear. Not valid inside `assert` or `assume`. See [Special Syntax](../language-reference/special_syntax).

---

## `component`
Declares a state machine with named states.

```
component breaker = states{
    closed: sfunc{ ... },
    open:   sfunc{ ... },
};
```

Only valid in `.fsystem` files. See [Components](../language-reference/components).

---

## `const`
Declares a constant value. If no value is given, the constant is an unknown — the solver picks its value.

```
const maxRetries = 5;
const threshold;          // unknown — solver picks
const (
    x = 10
    y                     // unknown
);
```

---

## `def`
Defines a named stock or flow.

```
def pool = stock{ ... };
def control = flow{ ... };
```

---

## `emits`
Clause inside an [`unfunc`](#unfunc) that declares an effect on a stock field. Supports `=`, `<-`, and `->` assignment forms.

```
process: unfunc{
    requires st.active,
    emits st.processed = true,
    emits st.count <- 1,
},
```

---

## `eventually`
Temporal qualifier. The assertion must hold in at least one step.

```
assert replica.active eventually;
```

---

## `eventually-always`
Temporal qualifier. The assertion must eventually become true and then stay true for the remainder of the model.

```
assert pool.instances > 0 eventually-always;
```

---

## `exclude`
Removes an inherited field when using [`extends`](#extends) in a stock definition.

```
def derived = stock{
    extends base,
    exclude limit,
};
```

---

## `extends`
Inherits all fields from another stock definition.

```
def extended = stock{
    extends base,
    extra: 5,
};
```

To inherit from an imported spec, qualify the name with the import alias: `extends myimport.stockname`. See [Stocks](../language-reference/stocks).

---

## `false`
Boolean literal.

---

## `float()`
Constrains a stock field to the float domain. The solver picks any floating-point value.

```
def s = stock{
    reading: float(),
};
```

---

## `flow`
Defines a set of functions that change stocks. Flows are instantiated with `new` in the run block or in a `.fsystem` global.

```
def ops = flow{
    st: new myStock,
    doThing: func{ ... },
};
```

See [Flows](../language-reference/flows).

---

## `for` *(removed)*
Previously used to set the number of verification rounds (`for 2 run{}`). Removed in June 2026. Use a run block with the desired number of explicit steps instead.

---

## `func`
Declares an imperative function inside a `flow{}` definition. Flow functions contain arithmetic expressions and stock mutations (`<-`, `->`, `=`).

```
refill: func{
    b.tokens <- 1;
},
```

For state bodies inside a `component`, use [`sfunc`](#sfunc) instead. See also: [`unfunc`](#unfunc) for the declarative alternative.

---

## `global`
Declares a globally-scoped flow instance in a `.fsystem` file.

```
global record = new cache.record;
```

---

## `import`
Imports a `.fspec` file into a `.fsystem` file. Only one level of imports is allowed — specs cannot import other specs.

```
import("cache.fspec");
import(cache "cache.fspec");   // aliased import
```

---

## `int()`
Constrains a stock field to the integer domain. The solver picks any integer value.

```
def s = stock{
    offset: int(),
};
```

---

## `leave()`
Exits the current state or a named state. The opposite of `advance()`.

```
leave();              // exit current state
leave(this.active);   // exit the named state
```

---

## `multiple`
Creates an unbounded set of flow instances. The solver decides how many instances to use.

```
run init { l = multiple faucet; } {
    l.in;
};
```

Only valid for flows. Use [`::count`](#-characteristic-access) to constrain how many instances the solver may create.

---

## `natural(n)`
Constrains a stock field to a natural number starting from `n` — a non-negative integer.

```
def q = stock{
    size: natural(0),
};
```

---

## `new`
Instantiates a stock or flow.

```
cluster = new control;     // instantiate a flow
p: new pool,               // initialize a stock inside a flow
```

---

## `nft N`
Temporal qualifier. The assertion must hold no fewer than `N` times across all rounds.

```
assert checkpoint.reached nft 2;
```

---

## `nmt N`
Temporal qualifier. The assertion must hold no more than `N` times across all rounds.

```
assert error.triggered nmt 1;
```

---

## `now`
The current round index. Used to reference a stock's value at a previous round.

```
p.value <- p.value[now-1];   // add previous round's value
b.a <- b.a[0] - 2;           // reference initial value
```

---

## `param()`
Marks a stock field as a template parameter for use with `-m template` mode and `fault render`. The compiler generates a `.params.json` file; `fault render` substitutes concrete values at model-check time.

```
def limits = stock{
    threshold: param(),
};
```

See [Data Types](../data-types).

---

## `requires`
Clause inside an [`unfunc`](#unfunc) that declares a precondition. The solver will only select this function when the precondition holds.

```
process: unfunc{
    requires queue.pending > 0,
    emits queue.pending -> 1,
},
```

---

## `run`
Declares the execution block. The `init` section instantiates flows and sets up initial conditions; the body lists the steps to verify.

```
run init {
    inst = new myFlow;
    inst.stock = otherStock;   // optional swap
} {
    inst.funcA;
    inst.funcB | inst.funcC;   // concurrent
    __;                        // synthesis slot
};
```

Each line in the body is one round. The number of rounds determines verification depth.

---

## `sfunc` {#sfunc}
Declares a state body inside a `component`. State functions may contain `advance()`, `stay()`, `leave()`, flow triggers, and stock conditionals. They may **not** contain stock mutations (`<-`, `->`, `=`).

```
component breaker = states{
    closed: sfunc{
        advance(this.open) || stay();
    },
};
```

Replaces the old `func` keyword for state bodies (breaking change, 2026-08-17). Flow functions still use [`func`](#func).

---

## `spec`
Declares the name of a `.fspec` file. Must be the first statement.

```
spec cache;
```

---

## `start` *(removed)*
Previously used to declare the initial state of each component in a `.fsystem` file. Removed in June 2026. Use a `run` block instead.

---

## `stay()`
Remains in the current state. A no-op that makes intent explicit.

```
idle: sfunc{
    stay();
},
```

Omitting `stay()` when no other transition is possible is equivalent but less readable.

---

## `states`
Declares the body of a [`component`](#component) as a map of named state functions.

```
component breaker = states{
    closed: sfunc{ ... },
    open:   sfunc{ ... },
};
```

---

## `stock`
Defines a named reservoir of values — the state the model tracks over time.

```
def pool = stock{
    instances: 0,
    loading: 0,
};
```

See [Stocks](../language-reference/stocks).

---

## `system`
Declares the name of a `.fsystem` file. Must be the first statement.

```
system dbCluster;
```

---

## `this`
Self-reference inside a component state function. Used to target the current component in `advance()` and `leave()`.

```
advance(this.idle);
leave(this.active);
```

---

## `true`
Boolean literal.

---

## `uncertain(mean, sigma)`
Declares a stock field as a normally-distributed uncertain value. The solver assigns values drawn from the distribution and annotates results with probabilities.

```
def sensor = stock{
    reading: uncertain(1, 0.5),   // mean=1, sigma=0.5
};
```

Results include probability annotations: `1.500000 (0.483941)`. See [Data Types](../data-types).

---

## `unfunc` {#unfunc}
A declarative alternative to `func` that uses `requires`/`emits` clauses instead of imperative steps. Designed for use with program synthesis.

```
def ops = flow{
    q: new queue,
    process: unfunc{
        requires q.pending > 0,
        emits q.pending -> 1,
        emits q.done <- 1,
    },
};
```

See [Flows](../language-reference/flows) and [Program Synthesis](../model-types/program-synthesis).

---

## `unknown()`
Declares a stock field or constant whose value the solver picks freely. Equivalent to declaring a field with no assigned value.

```
def s = stock{
    blocks: unknown(),
    table,              // implicit unknown
};
```

Use unknowns when you want the solver to find interesting starting conditions rather than testing from a fixed baseline. See [Data Types](../data-types).

---

## `when / then`
Conditional invariant form. `when A then B` asserts that B must be true whenever A is true.

```
assert when state.accessGranted then state.authenticated;
assume when queue.full then queue.size >= queue.capacity always;
```

Valid with both `assert` and `assume`. Accepts temporal qualifiers. See [Assertions](../invariants/assertions).

---

## `whole()`
Constrains a stock field to a non-negative integer. The solver picks any whole number.

```
def t = stock{
    ticks: whole(),
};
```

Similar to `natural(0)` but signals that the starting value is unconstrained.
