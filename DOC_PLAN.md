# Fault Docs Update Plan

## Goals

1. Fix all broken/outdated content (broken syntax examples, wrong behavioral claims)
2. Restructure around the four model types Fault supports
3. Add a glossary of all keywords in alphabetical order
4. Document all features missing from current docs

---

## Proposed New Structure

```
index.md                          (home — keep, update intro framing)
installation/
  index.md                        (update CLI flags, subcommands, fix fallback claim)
  solvers.md                      (keep as-is)
  config.md                       (NEW: ~/.faultrc, fault config, FAULT_HOST)

model-types/
  index.md                        (NEW: overview of the four model types, when to use each)
  stock-flow.md                   (NEW: stock-flow models — stocks, flows, run block, time)
  component-state-machines.md     (NEW: fsystem, components, states, advance/stay/leave)
  program-synthesis.md            (NEW: __ slots, unfunc, available, assume as goals)
  boolean-logic.md                (NEW: string-as-boolean, pure boolean specs)

language-reference/
  index.md                        (NEW: file types — .fspec vs .fsystem)
  stocks.md                       (from basic-concepts/stocks.md + add extends/exclude)
  flows.md                        (from basic-concepts/flows.md + unfunc section)
  components.md                   (from basic-concepts/components.md — remove start{})
  states.md                       (from basic-concepts/states.md)
  run-block.md                    (NEW or merge from flows.md: run init{}{}, synthesis __)
  time.md                         (from basic-concepts/time.md)
  special-syntax.md               (from basic-concepts/special_syntax.md + :: operator)
  imports.md                      (pull out import docs from fsystem_fspec.md)

data-types/
  index.md                        (add: whole, natural, param)

invariants/
  index.md                        (add: available temporal qualifier)
  assertions.md                   (add: when/then form consolidation)
  assumptions.md                  (keep as-is)

glossary/
  index.md                        (NEW: all keywords A-Z)

prompts/
  index.md                        (keep)
  CLAUDE.md                       (update: fix fallback claim, add unfunc/extends/synthesis)
  sandwich.fspec                  (keep)
```

---

## Section: Model Types (new top-level section)

The four model types map to different use cases:

| Model Type | File Type | Key Constructs | Use When |
|---|---|---|---|
| Stock-flow | `.fspec` | `stock`, `flow`, `run init{}{}` | Modeling resource flows, queues, capacity |
| Component state machines | `.fsystem` | `component`, `states`, `system` | Modeling distributed systems, protocols |
| Program synthesis | `.fspec` | `__`, `unfunc`, `assume` as goal | Finding sequences of operations that satisfy a property |
| Boolean logic | `.fspec` | string fields, `&&`/`\|\|`/`!` | Pure logical modeling without numeric quantities |

Each `model-types/` page should:
- Open with a one-paragraph "what is this model type for"
- Show a complete worked example (different from the home page example)
- Point to the relevant language-reference pages for details

---

## Fixes Required (Broken / Wrong Content)

### `start {}` blocks — REMOVED from language (breaking change, 6/5/2026)

Files to fix:
- [x] `basic-concepts/components.md` — replaced `start {}` with `run {}` (file moved to `language-reference/components.md`)
- [x] `basic-concepts/index.md` — fixed (file moved to `language-reference/index.md`, old broken example gone)
- [x] `index.md` — replaced `start { breaker: closed }` with `run { breaker.closed }`
- [x] `prompts/CLAUDE.md` — no `start` examples found

### No-solver fallback — WRONG claim (changed 6/23/2026)

Current text says: *"If SOLVERCMD or SOLVERARG are not set, Fault will automatically fall back to SMT output."*
This is now false — Fault returns a **clear error**.

Files to fix:
- [x] `installation/index.md`
- [x] `prompts/CLAUDE.md`

---

## New Pages to Write

- [ ] `model-types/index.md` — overview table + when to use each type
- [ ] `model-types/stock-flow.md` — full worked example (e.g. a rate limiter or cache)
- [ ] `model-types/component-state-machines.md` — full worked example (e.g. circuit breaker)
- [ ] `model-types/program-synthesis.md` — full worked example with `__` and `unfunc`
- [ ] `model-types/boolean-logic.md` — full worked example with string-as-boolean
- [ ] `installation/config.md` — `~/.faultrc`, `fault config`, `FAULT_HOST`
- [ ] `glossary/index.md` — all keywords A-Z (see keyword list below)

---

## Additions to Existing Pages

- [ ] `installation/index.md`
  - Update CLI flags table: add `--smt-threshold`, `--timeout`, `--memory-max-size`, `--format`
  - Add subcommands section: `fault lint`, `fault config`, `fault update`, `fault render`
  - Add plugin system note (`fault-<name>` on PATH)
  - Fix the no-solver fallback claim (see above)
  - Add note about JSON output going to stdout, warnings to stderr

- [ ] `language-reference/stocks.md` (or `basic-concepts/stocks.md`)
  - Add `extends` / `exclude` stock inheritance

- [ ] `language-reference/flows.md` (or `basic-concepts/flows.md`)
  - Add `unfunc` with `requires` / `emits` clauses

- [ ] `data-types/index.md`
  - Add `whole()` — whole number constraint
  - Add `natural(n)` — natural number constraint
  - Add `param()` — parameterized value (template feature)

- [ ] `invariants/index.md`
  - Add `available` to the temporal qualifiers table

- [ ] `invariants/assertions.md`
  - Add `when / then` form (currently only in `special_syntax.md`)

- [ ] `basic-concepts/special_syntax.md`
  - Add `::` characteristic access operator (used with `multiple` flows: `l::count`)
  - Add `multiple` keyword

- [ ] `prompts/CLAUDE.md`
  - Add `unfunc` / `requires` / `emits` to quick reference
  - Add `extends` / `exclude`
  - Add `multiple` / `::`
  - Add synthesis syntax (`__`)
  - Fix fallback claim

---

## Glossary Keyword List (A-Z)

All keywords to document in `glossary/index.md`:

| Keyword | Category |
|---|---|
| `<-` | operator — increment stock field |
| `->` | operator — decrement stock field |
| `=` (in flow) | operator — overwrite stock field |
| `\|\|` (in choose/assume) | operator — logical OR / exclusive choice |
| `&&` | operator — logical AND |
| `!` | operator — logical NOT |
| `::` | operator — characteristic access (multiple flows) |
| `__` | synthesis slot — solver picks operation |
| `advance()` | builtin — transition to a state |
| `assert` | keyword — invariant that must hold (counterexample if violated) |
| `assume` | keyword — axiom (or synthesis goal with `__`) |
| `available` | temporal — unfunc is initially available |
| `always` | temporal qualifier |
| `bool()` | type — explicit boolean solvable |
| `choose` | keyword — exclusive-or state transition |
| `component` | keyword — state machine definition |
| `const` | keyword — constant declaration |
| `def` | keyword — define a stock or flow |
| `emits` | unfunc clause — declares output |
| `eventually` | temporal qualifier |
| `eventually-always` | temporal qualifier |
| `exclude` | stock modifier — remove inherited field |
| `extends` | stock modifier — inherit from another stock |
| `false` | literal |
| `float()` | type — float solvable |
| `flow` | keyword — transition definition |
| `for` (removed) | REMOVED — do not document |
| `func` | keyword — imperative function in a flow |
| `global` | keyword — global flow instance in a system |
| `import` | keyword — import a spec file |
| `int()` | type — integer solvable |
| `leave()` | builtin — exit current or named state |
| `multiple` | keyword — create multiple instances of a flow |
| `natural(n)` | type — natural number constraint |
| `new` | keyword — instantiate a stock or flow |
| `nft N` | temporal qualifier — no fewer than N times |
| `nmt N` | temporal qualifier — no more than N times |
| `now` | keyword — current round index (used in time indexing) |
| `param()` | type — parameterized value for templates |
| `requires` | unfunc clause — declares precondition |
| `run` | keyword — execution block |
| `spec` | keyword — declare a spec file |
| `start` (removed) | REMOVED — do not document |
| `stay()` | builtin — remain in current state |
| `states` | keyword — state machine body |
| `stock` | keyword — state definition |
| `system` | keyword — declare a system file |
| `this` | keyword — self-reference inside a component |
| `true` | literal |
| `uncertain(mean, sigma)` | type — normal distribution value |
| `unfunc` | keyword — declarative function with requires/emits |
| `unknown()` | type — solver-chosen value |
| `when / then` | keyword — conditional invariant form |
| `whole()` | type — whole number constraint |

---

## Decisions

1. **Fix + restructure in one pass** — do not patch first and reorganize second.

2. **Replace `basic-concepts/` entirely** — split into `model-types/` (conceptual, worked examples) and `language-reference/` (per-construct reference). Delete `basic-concepts/`.

3. **Reference section name: `language-reference/`**

4. **Glossary depth: hybrid** — one-liner for simple items (operators, literals, removed keywords); definition + short code snippet for anything with non-obvious behavior (`unfunc`, `uncertain`, `extends`, `__`, etc.).

5. **`prompts/CLAUDE.md` stays independent** — update it to fix errors and add missing features, but keep its own format optimized for LLMs. Do not derive it from the glossary.
