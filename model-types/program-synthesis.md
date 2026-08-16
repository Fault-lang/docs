---
title: Program Synthesis
---

# Program Synthesis

Program synthesis inverts the normal modeling question. Instead of asking *"does this sequence of operations violate a property?"*, you ask *"what sequence of operations satisfies this property?"*

You define a goal using `assume`, leave some steps unspecified using `__` (synthesis slots), and let the solver figure out which operations to call and in what order.

**Use program synthesis when:**
- You want the solver to find a sequence of operations that achieves a target state
- You are exploring what workflows are even possible given your model's constraints
- You want to verify that a goal is achievable at all (or find that it isn't)

---

## The `__` Synthesis Slot

A `__` in the run block is a placeholder. The solver picks which flow function to call at that step. Each slot is independent — the solver can choose a different function for each `__`.

```
run init {
    inst = new myFlow;
} {
    __;
    __;
    __;
};
```

You can mix explicit steps with synthesis slots:

```
run init {
    inst = new account;
} {
    inst.deposit;   // always deposit first
    __;             // solver picks what happens next
    __;
};
```

---

## Goals: `assume` Instead of `assert`

In a normal model, `assert` asks the solver to find a counterexample. In synthesis mode, you use `assume` to express the goal — the solver finds a scenario *where the assumption holds*.

```
assume counter.value > 10 eventually;
```

This tells the solver: fill in the `__` slots with operations such that `counter.value` eventually exceeds 10.

::: warning
Do not use `assert` as a synthesis goal. `assert` looks for violations. `assume` restricts the solution space to scenarios where the condition holds — which is what synthesis needs.
:::

---

## Worked Example: Finding a Deposit Sequence

A bank account has `deposit`, `withdraw`, and `bonus` operations. We want to find a sequence of five operations that results in a balance over 100, starting from 50.

### The Spec

```
spec account;

def wallet = stock{
    balance: 50,
};

def ops = flow{
    w: new wallet,

    deposit: func{
        w.balance <- 20;
    },

    withdraw: func{
        if w.balance > 10 {
            w.balance -> 10;
        }
    },

    bonus: func{
        if w.balance > 50 {
            w.balance <- 5;
        }
    },
};

assume wallet.balance > 100 eventually;
assume wallet.balance >= 0 always;

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

The solver will find a sequence of five operations — chosen from `deposit`, `withdraw`, and `bonus` — that results in a balance above 100 while keeping it non-negative throughout.

### Reading the Output

The result trace shows which function was chosen at each step and the stock values after each round. For example:

```
Round 1: acct.deposit    — balance: 70
Round 2: acct.deposit    — balance: 90
Round 3: acct.bonus      — (guard fails, no change)
Round 4: acct.deposit    — balance: 110
Round 5: acct.withdraw   — balance: 100
```

The solver found a valid path. If no path exists (the goal is unreachable in the given number of steps), the solver returns `unsat`.

---

## `unfunc`: Declarative Functions

`unfunc` is a declarative alternative to `func` for use with synthesis. Instead of imperative steps, you declare what a function *requires* and what it *emits*.

```
def ops = flow{
    w: new wallet,

    deposit: unfunc{
        emits w.balance <- 20,
    },

    bonus: unfunc{
        requires w.balance > 50,
        emits w.balance <- 5,
    },
};
```

`requires` declares a precondition. The solver will only select this function when the precondition holds. `emits` declares the effect.

The `available` temporal qualifier pairs with `unfunc` to assert that a function starts in an available state:

```
assume bonus available;
```

This tells the solver the `bonus` function is available from the start (i.e., its precondition is satisfiable from the initial state).

---

## Complete Example with `unfunc`

```
spec taskScheduler;

def queue = stock{
    pending: 3,
    done: 0,
};

def scheduler = flow{
    q: new queue,

    submit: unfunc{
        emits q.pending <- 1,
    },

    process: unfunc{
        requires q.pending > 0,
        emits q.pending -> 1,
        emits q.done <- 1,
    },
};

assume queue.done >= 5 eventually;
assume queue.pending >= 0 always;

run init {
    s = new scheduler;
} {
    __;
    __;
    __;
    __;
    __;
    __;
    __;
    __;
};
```

The solver finds a sequence of `submit` and `process` calls that drains enough tasks to satisfy `queue.done >= 5` while never going negative on `pending`.

---

## Key Concepts

- **[Flows](../language-reference/flows)** — flow and func syntax
- **[Invariants: Assumptions](../invariants/assumptions)** — using `assume` as synthesis goals
- **[Glossary: `__`](../glossary#synthesis-slot)** — synthesis slot reference
- **[Glossary: `unfunc`](../glossary#unfunc)** — declarative function reference
