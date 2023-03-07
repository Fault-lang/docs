---
layout: default
title: Invariants
nav_order: 5
has_children: true
---
# Invariants

Invariants shape how the solver looks for a viable solution. They are statements that are either assumed to be true or that we want the solver to disprove.

## Temporal Logic
Fault has a couple of temporal logic operators that create SMT rules to test conditions across time. Fault is not as good at temporal logic as other languages specifically designed for it (TLA+ comes to mind), but it can handle some basic reasoning.

| Operator | Definition | Use |
| :------- | :--------- | :-- |
| `eventually` | At some point in the model runtime this assertion will be true | `assert x eventually;` |
| `always` | This assertion is always true (technically the default for all assertions) | `assert x always;`|
| `eventually-always` | When this assertion becomes true it will stay true for the rest of the model runtime| `assert x eventually-always;` |
| `nmt n` | This assertion is true no more than n times | `assert x nmt 2;`|
| `nft n` | This assertion is true no fewer than n times | `assert x nft 2;`|