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

## Fault TUI

Running `fault` with no arguments launches the interactive TUI. It walks you through compilation options in a full-screen terminal interface:

1. **Setup** — enter a file path and choose compilation options (mode, input format, output format)
2. **Progress** — an animated spinner shows compilation status
3. **Results** — scrollable output with vim-style navigation (`j`/`k` or `↑`/`↓`, `q` to quit)

If compilation fails, the **Error** view shows the failure phase, a description, and a suggestion. From there you can retry, return to setup, or quit.

**TUI keybindings:**

| Context | Keys | Action |
|---------|------|--------|
| Global | `Ctrl+C` / `Ctrl+Q` | Quit |
| Global | `Ctrl+T` | Toggle light/dark theme |
| Setup | `↑`/`↓`, `Enter` | Navigate and select options |
| Results | `↑`/`↓` or `j`/`k` | Scroll output |
| Error | `↑`/`↓` or `j`/`k`, `Enter` | Navigate actions |
| Error | `r` / `b` / `q` | Retry / Back to setup / Quit |

## Fault Command Line

When a file path is provided via `-f`, Fault runs in traditional CLI mode and prints results to stdout.

```
fault -f <path> [-m <mode>] [-i <format>] [-output <format>] [-complete]
```

| Flag | Default | Description |
|------|---------|-------------|
| `-f <path>` | _(required)_ | Path to the file to compile |
| `-m <mode>` | `model` | Stop the compiler at a milestone: `ast`, `ir`, `smt`, or `model` |
| `-i <format>` | `fault` | Input file format: `fault`, `ll`, or `smt2` |
| `-output <format>` | `text` | Output format: `text` or `smt` |
| `-complete` | false | Verify that transitions to all defined states are specified in the model |

**Examples:**

```bash
# Run the full model checker
fault -f examples/battery.fspec

# Inspect the AST
fault -f examples/battery.fspec -m ast

# Generate SMT output only
fault -f examples/battery.fspec -m smt -output smt
```

If `SOLVERCMD` or `SOLVERARG` are not set when running in `model` mode, Fault will automatically fall back to SMT output without model checking.
