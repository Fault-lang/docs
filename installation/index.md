---
title: Installation
---
# Installation
Fault can be built for source if you like, but the best way to install Fault is by [downloading the correct release for your machine](https://github.com/Fault-lang/Fault/releases).

Once installed the model checker of Fault needs access to a SMT solver, otherwise Fault will default to generating SMT of models only. Microsoft's Z3 is the recommended solver at this time and [can be downloaded here](https://github.com/Z3Prover/z3/releases)

Then in order for Fault to find your solver you need to set two configuration variables: `SOLVERCMD` (the solver command) and `SOLVERARG` (the argument it takes to read SMT from stdin).

The easiest way to do this is with the built-in `fault config` command, which writes to `~/.faultrc` so the settings persist across sessions:

```bash
fault config --solvercmd=z3 --solverarg=-in
```

You can verify the current config at any time by running `fault config` with no arguments.

Alternatively, you can set them as environment variables directly (e.g. in your shell profile):

```
export SOLVERCMD="z3"
export SOLVERARG="-in"
```

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
fault -f <path> [flags]
fault <subcommand> [flags]
```

### Flags

| Flag | Default | Description |
|------|---------|-------------|
| `-f, --file <path>` | _(required)_ | Path to the `.fspec` or `.fsystem` file to compile |
| `-m, --mode <mode>` | `model` | Stop the compiler at a milestone: `ast`, `ir`, `smt`, `template`, or `model` |
| `-i, --input <format>` | `fault` | Input file format: `fault`, `ll`, or `smt2` |
| `--output <format>` | `text` | Output format: `text` or `smt` |
| `--format <name\|path>` | `default` | Output template: `default`, `json`, `compact`, or a path to a Go template file |
| `--complete` | false | Verify that transitions to all defined states are specified in the model |
| `--smt-threshold <n>` | 10000 | Warn before sending SMT larger than `n` lines to the solver |
| `--timeout <ms>` | 30000 | Solver timeout in milliseconds (0 = no limit) |
| `--memory-max-size <MB>` | 1096 | Solver memory limit in MB (0 = no limit) |

### Subcommands

| Subcommand | Description |
|------------|-------------|
| `fault lint -f <file> [--warn-only]` | Parse and type-check only; collects all errors without compiling |
| `fault config [--solvercmd=z3] [--solverarg=-in]` | Read or write `~/.faultrc`; no flags prints current config |
| `fault update` | Download and install the latest release from GitHub |
| `fault render -f <tmpl> [--params <json>]` | Substitute parameters into a `.smt2.tmpl` and run model checking |

Any binary named `fault-<name>` on your PATH is automatically available as `fault <name>`.

**Examples:**

```bash
# Run the full model checker
fault -f examples/battery.fspec

# Inspect the AST
fault -f examples/battery.fspec -m ast

# Generate SMT output only (no solver needed)
fault -f examples/battery.fspec -m smt --output smt

# Type-check without compiling
fault lint -f examples/battery.fspec

# Get JSON output (warnings go to stderr, result to stdout)
fault -f examples/battery.fspec --format json
```

If `SOLVERCMD` or `SOLVERARG` are not set when running in `model` mode, Fault will return an error. Use `-m smt` with `--output smt` to inspect the generated SMT without a solver.
