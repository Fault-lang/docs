---
layout: default
title: Custom Solvers
parent: Installation
nav_order: 3
---
# Custom Solver

In theory Fault can use [any solver](https://en.wikipedia.org/wiki/Satisfiability_modulo_theories#Solvers) that accepts SMT-Lib version 2. In practice though there are inconsistencies in the format some solvers return as results that will probably trip Fault up.

Nevertheless you're welcome to try to submit PRs to add more solver support

To change out the solver you need to change two environmental variables. `SOLVERCMD` is the command for the solver. `SOLVERARG` is whatever argument the the solver takes to read SMT from Stdin (which is how Fault will deliver it). By default these values are

```
export SOLVERCMD="z3"
export SOLVERARG="-in"
```

But if you wanted to switch to Yices they would be:

```
export SOLVERCMD="yices-smt2"
export SOLVERARG="--interactive"
```

This is easiest if you're [running Fault without Docker](nodocker.html)


