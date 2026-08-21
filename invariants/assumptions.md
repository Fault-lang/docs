---
title: Assumptions
---
# Assumptions
Assumptions follow essentially the same [rules as assertions](assertions) except they are _not_ negated. This means we can use assumptions to tell the solver to ignore certain potential solutions.

In this sense an assumption in Fault is basically an [axiom](https://en.wikipedia.org/wiki/Axiom#Logical_axioms). The model must assume that the assumption is always true. If our purpose is formalization or verification, these assumptions are supposed to have been proven correct in another earlier model. In simulation we can take the fact for granted and just use assumptions to eliminate a whole set of potential solutions we do not care about.

## Syntax

```
assume x > 0;
assume resources.table <= 4;
assume when queue.full then queue.size >= queue.capacity;
```

Assumptions accept the same temporal qualifiers as assertions (`always`, `eventually`, `eventually-always`, `nmt`, `nft`), and support `when/then` syntax. See [Assertions](assertions) for the full reference.

## Constraining the Solution Space

Where an assertion asks Fault to find a scenario where something goes wrong, an assumption rules out scenarios you don't want the solver to consider. For example, if your model includes a stock that physically can't go below zero, you can assume that rather than assert it:

```
assume pool.instances >= 0;
```

Without this, the solver might explore states where `instances` goes negative — technically satisfying the formula but not meaningful in your system. Assumptions prune those branches away.

## Assumptions in Program Synthesis

Assumptions play an additional role in [program synthesis](../model-types/program-synthesis). When the solver is filling `__` slots by choosing among `unfunc` definitions, assumptions constrain which solutions are valid. Use `assume f available;` to guarantee that a function's precondition is reachable from the initial state — not just that it is defined.

```
assume process available;
```

This tells the solver it must find a sequence where `process` can actually be called, not just one where it happens to appear.
