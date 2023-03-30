---
layout: default
title: Running in Docker
parent: Installation
nav_order: 3
---
# Running in Docker
There's a MAKEFILE in the Fault repository designed to help run Fault in a Docker container. Obviously that requires Make be installed.

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