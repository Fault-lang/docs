---
title: Functions
---

# Functions

Fault has three kinds of functions: `func`, `sfunc`, and `unfunc`. Each belongs to a different context and expresses a different kind of behavior.

| Keyword | Where it lives | What it expresses |
|---------|---------------|-------------------|
| `func` | `flow{}` in `.fspec` files | Imperative stock mutations |
| `sfunc` | `component` states in `.fsystem` files | State transitions |
| `unfunc` | `flow{}` in `.fspec` files | Declarative preconditions and effects |

## `func`

The standard function. Used inside `flow{}` definitions to describe how a flow changes stocks. The body contains arithmetic expressions and stock mutations using `<-`, `->`, and `=`.

```
def control = flow{
    p: new pool,

    add: func{
        if p.loading > 0 {
            p.loading -> 1;
            p.instances <- 1;
        }
    },

    remove: func{
        p.instances -> 1;
    },
};
```

## `sfunc`

State functions live inside `component` definitions and describe what happens when a component is in a particular state. The body may contain `advance()`, `stay()`, `leave()`, flow triggers, and stock conditionals. It may **not** directly mutate stocks — that is the job of flows.

```
component replCache = states{
    idle: sfunc{
        advance(this.lookupRecord) || advance(this.expired);
    },
    lookupRecord: sfunc{
        record.lookup;
        advance(this.returnRecord) || advance(this.createRecord);
    },
    returnRecord: sfunc{
        record.release;
        advance(this.idle);
    },
};
```

See [States](states) for the full set of operations available inside `sfunc` bodies.

## `unfunc`

Short for "unimplemented function." A declarative alternative to `func`. Instead of imperative steps, you declare what a function *requires* (its precondition) and what it *emits* (its effects). The solver uses these clauses to determine when a function can be selected and what it does when it is.

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

`requires` — the condition that must hold for the function to be selected. Optional; omit it if the function has no precondition.

`emits` — an effect on a stock field. Multiple `emits` clauses are allowed per function. Supports all assignment forms: `= val`, `<- expr`, `-> expr`.

`unfunc` is the primary building block for [program synthesis](../model-types/program-synthesis), where the solver fills `__` slots by choosing among available functions. Use `assume f available;` to assert that a function's precondition is reachable from the initial state, not just that it is defined.
