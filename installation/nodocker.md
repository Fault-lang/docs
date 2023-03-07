---
layout: default
title: Running Without Docker
parent: Installation
nav_order: 2
---
# Running Without Docker
Fault runs in a Docker container because the actual execution of a model in Fault is done by a 3rd party solver which has to be built on your machine first.

But if you prefer to download and build the solver yourself, the Fault compiler is just a Go binary and can easily be run without Docker at all.

## Configuring the Solver
The solver is configured via environmental variables. The Docker container will set these up automatically so to run Fault without Docker you need to set them yourself. Following will configure Fault to use Z3 as its solver (the default)

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