---
layout: default
title: Building from Source
parent: Installation
nav_order: 2
---
# Building from Source
If you prefer to download and build the solver yourself, the Fault compiler is just a Go binary and can easily built to run on multiple platforms.

## Download Fault
You can [download Fault from GitHub](https://github.com/Fault-lang/Fault) directly or clone the repo via git

```
git clone https://github.com/Fault-lang/Fault
```

## Configuring the Solver
The solver is configured via environmental variables. Without these values, Fault will default to generating SMT of the model only. The following will configure Fault to use Z3 as its solver (the default)

```
export SOLVERCMD="z3"
export SOLVERARG="-in"
```

`SOLVERCMD` is the command for the solver. `SOLVERARG` is whatever argument the the solver takes to read SMT from Stdin.

## Building

You can either run Fault directly from its directory

```
go run main.go -f=[path to file]
```

Or you can build it and move the binary into `/usr/local/bin` or an equivilant.