---
title: Configuration
parent: Installation
---
# Configuration

Fault reads configuration from `~/.faultrc` at startup. You can manage this file with the `fault config` command or edit it directly — it's a simple key=value format with `#` comments.

## Using `fault config`

```bash
# View current configuration
fault config

# Set solver options
fault config --solvercmd=z3 --solverarg=-in

# Set the base directory for relative file paths
fault config --fault-host=/home/user/models
```

Running `fault config` with no arguments prints the current configuration.

## Configuration Reference

### `SOLVERCMD`

The command used to invoke the SMT solver.

```
SOLVERCMD=z3
```

Required for model checking. If unset, `fault` returns an error when run in `model` mode. See [Custom Solvers](solvers) for other solver options.

### `SOLVERARG`

The argument passed to the solver to make it read SMT from stdin.

```
SOLVERARG=-in
```

Required alongside `SOLVERCMD`.

### `FAULT_HOST`

The base directory that Fault uses to resolve file paths. When set, it affects three cases:

- **Relative paths** — any path that doesn't start with `/` or `~/` is resolved relative to `FAULT_HOST`
- **`..` segments** — each `..` walks up from `FAULT_HOST`, not from the current working directory
- **`~` within a path** — a `~` that appears mid-path (not at the start) is resolved relative to `FAULT_HOST` rather than your home directory

```
# FAULT_HOST=
```

This setting is commented out by default. Set it if your models live in a central directory and you want to reference them with short relative paths:

```bash
fault config --fault-host=/home/user/models
```

Leading `~/` at the start of a file path is always expanded to your home directory, regardless of `FAULT_HOST`.

## Environment Variables

All `~/.faultrc` settings can be overridden by environment variables of the same name. Environment variables take precedence over the config file.

```bash
export SOLVERCMD="z3"
export SOLVERARG="-in"
```

This is useful for CI environments or when you need per-project solver settings without modifying your global config.
