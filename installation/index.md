---
layout: default
title: Installation
nav_order: 2
has_children: true
---
# Installation
Fault can be built for source if you like, but the best way to install Fault is by [downloading the correct release for your machine](https://github.com/Fault-lang/Fault/releases).

Once installed the model checker of Fault needs access to a SMT solver, otherwise Fault will default to generating SMT of models only. Microsoft's Z3 is the recommended solver at this time and [can be downloaded here](https://github.com/Z3Prover/z3/releases)

Then in order for Fault to find your solver you need to set two configuration variables

```
export SOLVERCMD="z3"
export SOLVERARG="-in"
```

`SOLVERCMD` is the command for the solver. `SOLVERARG` is whatever argument the the solver takes to read SMT from Stdin.

**That's it!** You should be able to run Fault now

```
> fault -f=../path/to/my/model.fsystem
~~~~~~~~~~
  Fault found the following scenario
~~~~~~~~~~
fizz_buzz_bash
-> 4.875000 -> 3.875000 -> 3.875000 -> 3.875000 -> 2.875000 -> 2.875000 -> 2.875000 -> 1.875000 -> 1.875000 -> 1.875000 -> 0.875000 -> 0.875000 -> 0.875000 -> 0.125000 -> 0.125000

fizz_foo
-> 0.500000

fizz_bar
-> 2.000000
```

## Fault Command Line

| Flag | Meaning | Options |
| :--- | :------ | :------ |
| `-f` | **Required** path to the `.fsystem` or `.fspec` file |  |
| `-m` | Mode to run Fault in. This determines what Fault outputs and allows you to do things like stop the compiler and have it return just the SMT | - `ast` Returns Fault AST <br> - `ir` Returns LLVM IR representation of the model <br>- `smt` Returns the generated SMT <br>- `check` (default) Returns solution from the solver <br>- `visualize` Returns solution from the solver formatted in Mermaid.js visualizations. |
| `-i` | Input format. Allows you to start the compiler from a midpoint by inputting LLVM IR or SMT. Useful in debugging |- `fspec` (default) Fault files fspec/fsystem <br>-`ll` LLVM IR<br> -`smt2` SMT-Lib2 formatted rules.|
| `-c` | Completeness. This runs a reachability check on the state chart before compiling the model. Makes sure that there are no states that are defined but unreachable under any conditions.| `true` or `false` |