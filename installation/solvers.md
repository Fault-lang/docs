---
title: Custom Solvers
---
# Custom Solver

In theory Fault can use [any solver](https://en.wikipedia.org/wiki/Satisfiability_modulo_theories#Solvers) that accepts SMT-Lib version 2. In practice though there are inconsistencies in the format some solvers return as results that will probably trip Fault up.

Nevertheless you're welcome to try to submit PRs to add more solver support

To change out the solver, update `SOLVERCMD` (the solver command) and `SOLVERARG` (the argument it takes to read SMT from stdin). The easiest way is with `fault config`:

```bash
# Switch to Yices
fault config --solvercmd=yices-smt2 --solverarg=--interactive

# Switch back to Z3
fault config --solvercmd=z3 --solverarg=-in
```

This writes to `~/.faultrc` so the change persists. You can also set them as environment variables directly:

```
export SOLVERCMD="yices-smt2"
export SOLVERARG="--interactive"
```

