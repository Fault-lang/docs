---
title: Functions
---

# Functions

Fault has three kinds of functions: `func`, `sfunc`, and `unfunc`. Because Fault is a specification language and not a programming language, functions aren't about executing instruction but rather defining how the logic might branch out to different scenarios if that function were executed.

| Keyword | Where it lives | What it expresses |
|---------|---------------|-------------------|
| `func` | `flow{}` in `.fspec` files | A stock value is changed somehow |
| `sfunc` | `component` states in `.fsystem` files | The state machine transitions |
| `unfunc` | `flow{}` in `.fspec` files | Tbe preconditions and effects of a black box function |

## `func`

The standard function. Used inside `flow{}` definitions to describe how a flow changes stocks. See [Flows](flows) for syntax and examples.

## `sfunc`

State functions live inside `component` definitions and describe what happens when a component is in a particular state. The body may contain `advance()`, `stay()`, `leave()`, flow triggers, and stock conditionals. It may **not** directly mutate stocks — that is the job of flows. See [States](states) for syntax and examples.

## `unfunc`

Short for "unimplemented function." A declarative alternative to `func` that uses `requires` and `emits` clauses instead of imperative steps. The solver uses these clauses to determine when a function can be selected and what it does when it is. `unfunc` is the primary building block for [program synthesis](../model-types/program-synthesis). See [Flows](flows#declarative-functions-unfunc) for syntax and examples.
