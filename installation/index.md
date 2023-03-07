---
layout: default
title: Installation
nav_order: 2
has_children: true
---
# Installation
By default Fault runs in a Docker container, so if your machine can run Docker you should be able to run Fault.

## Dependencies

| Dependency | OS Support|
| :---- | :---- |
| Make | On Linux distributions make is available through the standard package manager. On Mac OS this requires installing XCode Command Line Tools. On Windows machines you can get make from chocolatey but honestly probably better to just concat the Dockerfiles yourself.|
| Docker | Lots of support for different platforms on [their website](https://www.docker.com/)|

## Download Fault
You can [download Fault from GitHub](https://github.com/Fault-lang/Fault) directly or clone the repo via git

```
git clone https://github.com/Fault-lang/Fault
```

## Installing
From the Fault directory run make

```
make fault-z3
```

This will install Fault using [Microsoft's Z3 Solver](https://www.microsoft.com/en-us/research/project/z3-3/)

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

## Detailed breakdown of make command

{: .warning }
This is more information for people who want it. If you ran `make fault-z3` you're all ready to go!

The make command isn't really doing anything impressive, so if you don't want to download make for some reason or you want to use Fault with Docker and different solver it might be interesting to know what make is doing

```
$(shell touch "fault.Dockerfile")
```

First we create a Dockerfile for Fault.

```
cat Dockerfile ./solvers/z3.Dockerfile > fault.Dockerfile
```

The dockerfile in the repo is a template so that I can add support for different solvers and let people install what they want. So we pick out our solver and concat the dockerfile for that to the Fault default dockerfile and put them in to the dockerfile we just created.

```
@docker build -t ${NAME}-z3:${TAG} --no-cache --build-arg BUILD_VERSION=${VERSION} --build-arg BUILD_DATE=$(date) -f fault.Dockerfile .
	@docker tag ${NAME}-z3:${TAG} ${NAME}-z3:latest
```
Then we have docker build the container

```
@rm fault.Dockerfile
@cp fault-lang.sh /usr/local/bin/fault
```
Lastly we delete the dockerfile we created and move the shell script that acts as the interface between the user and the docker container into `/usr/local/bin`

Strictly speaking the shell script isn't necessary, but it makes interacting with Fault while it runs in a container look and feel like any command line application.