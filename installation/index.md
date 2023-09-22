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
Round,Type,Scope,Variable,Previous,Current,Probability
0,INIT,@__run,simple_l_active_0,,false,
0,INIT,@__run,simple_l_vault_value_0,,30,
0,TRIGGER,@__run,simple_l_fn,,,
0,CHANGE,@simple_l_fn,simple_l_vault_value_1,,58,
```

## Fault Command Line

| Flag | Meaning | Options |
| :--- | :------ | :------ |
| `-f` | **Required** path to the `.fsystem` or `.fspec` file |  |
| `-m` | Mode to run Fault in. This determines what Fault outputs and allows you to do things like stop the compiler and have it return just the SMT | - `ast` Returns Fault AST <br> - `ir` Returns LLVM IR representation of the model <br>- `smt` Returns the generated SMT <br>- `check` (default) Returns solution from the solver. |
| `-i` | Input format. Allows you to start the compiler from a midpoint by inputting LLVM IR or SMT. Useful in debugging |- `fspec` (default) Fault files fspec/fsystem <br>-`ll` LLVM IR<br> -`smt2` SMT-Lib2 formatted rules.|
| `-format` | How to display the output returned by the solver | -`log` Event log style format <br>-`static` Variable are assumed to be static rules with no feedback loops <br> -`smt` No format or filtering, passes the results from the solver directly <br> -`legacy` State changes organized by variable. <br>- `visualize` Returns solution from the solver formatted in Mermaid.js visualizations.
| `-c` | Completeness. This runs a reachability check on the state chart before compiling the model. Makes sure that there are no states that are defined but unreachable under any conditions.| `true` or `false` |