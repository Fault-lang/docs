---
layout: default
title: Generating Fault from LLMs
nav_order: 6
has_children: true
---

# Generating Fault from LLMs

LLMs can generate useful Fault models, but they need to be guided carefully. Fault has a small, strict syntax and a fundamentally different goal than most programming tasks — you are not asking the LLM to implement behavior, you are asking it to help you find failures. That distinction changes everything about how you should prompt.

## Start with CLAUDE.md

The file [`prompts/CLAUDE.md`](CLAUDE.html) in this repo is a reference document written specifically for LLMs. It contains the full syntax, common mistakes, and a worked example. Before writing a prompt, paste the contents of that file into your context window. Do not summarize it or paraphrase it — include the full text. LLMs will hallucinate Fault syntax unless they have the actual spec in front of them.

```
<context>
[paste full contents of CLAUDE.md here]
</context>
```

Most errors in LLM-generated Fault trace back to the model not having this context.

## Make use of modes
Changing the place in which Fault returns and output can help the LLM iterate on the model it has written.

- **ast** Prints a string version of the abstract syntax tree the parser has assembled
- **ir** Prints the LLVM ir Fault converts the AST to before optimization passes
- **smt** Prints the generated SMT that will be run on the solver

You can also see just the uninterpreted solver output with the flag `-output=smt` instead of mode.

## Describe failures, not implementations

Fault looks for counterexamples to your assertions. When you describe what you want to model, lead with what can go wrong — not how the system is built.

**Less useful:**
> "Model a cache with a lookup, store, and expire operation."

**More useful:**
> "I want to check whether concurrent cache lookups and expirations can cause memory blocks to go negative or exceed a limit of 4. The cache tracks used blocks and stored table entries."

The second prompt gives the LLM the invariants to assert and the failure scenario to look for. The first prompt produces code that compiles but probably finds nothing interesting.

Ask yourself before prompting: *what would have to be true for this system to be broken?* Tell the LLM that.

## Be explicit about what kind of file you need

Tell the LLM which file type to produce and why:

- Use `.fspec` when you are modeling a single process or a set of operations on shared state
- Use `.fsystem` + one or more `.fspec` files when the system has distinct operating modes (idle, processing, error) that determine which operations can run

If you are unsure, ask for `.fspec` first. Add a state machine only when the LLM cannot express what you need without it.


## Tell the LLM to write assertions first

Ask the LLM to write the assertions before writing any flows or stocks. This forces the model to reason about what the invariants are before generating the mechanics that might violate them.

**Prompt pattern:**
> "First, list the invariants you want to assert as plain English. Then write the assertions. Then write the stocks and flows that could violate those assertions."

A model that starts with assertions is almost always better than one that starts with stocks.

---

## Common LLM errors — and how to correct them

### Inventing syntax

LLMs frequently produce syntax that does not exist in Fault. Common examples:

- **Return values from flow functions** — flows have no return values; they only change stock via `<-`, `->`, or `=`
- **Function arguments** — flow functions take no arguments; stocks must be initialized inside the flow with `new`

**Correction prompt:**
> "Flow functions cannot return values or take arguments. Replace any return statements or parameters with direct stock mutations using `<-` or `->`. Remember that `<-` increments and `->` decrements."

### Assertions that are trivially true or impossible to violate

If the LLM writes assertions like `assert buffer.size >= 0` when `size` starts at 0 and only increments, the assertion can never be violated. Fault will return unsat immediately. This is not a useful model.

**Correction prompt:**
> "The solver returned unsat. Check whether the assertion can actually be violated given the initial stock values and the operations in the run block. If not, either weaken the assertion, add an operation that could violate it, or use `unknown()` for initial stock values so the solver can pick a starting condition that makes the assertion harder to satisfy."

### Underscores in variable names

Fault does not support underscores. LLMs trained on general code will use `my_stock` or `num_instances`. These will fail to parse.

**Correction prompt:**
> "Variable names cannot contain underscores. Rename all identifiers to camelCase."

## Validation workflow

After the LLM generates Fault code, do the following before running the solver:

1. **Check for syntax errors first** — run `fault -f model.fspec -m smt`. This only generates SMT and does not require a solver. If it fails, the error output identifies the line with the problem.

2. **Read every assertion** — ask yourself whether each one can actually be violated by the flows in the model. If not, the model will always return unsat and you will learn nothing.

3. **Verify the run block** — confirm that the number of rounds is sufficient for the failure scenario you care about, and that the concurrent operations (`|`) reflect the actual concurrency you are testing.

4. **Run the model checker** — `fault -f model.fspec`. A useful result is either a counterexample (sat) or a clear explanation of why no counterexample exists.

5. **If unsat, ask the LLM to explain why** — paste the model back and ask: "The solver found no counterexample. Explain why each assertion cannot be violated given the initial conditions and the run block. Then suggest how to make the model more likely to find a failure."


## Iterative refinement

LLM-generated models rarely nail the right level of abstraction on the first try. Use this loop:

1. Generate an initial model
2. Check syntax with `-m smt`
3. Run the model checker
4. If unsat: ask the LLM to tighten assertions, use `unknown()` for initial values, or add flows that could violate the invariants
5. If sat: examine the counterexample — does it represent a real failure or a modeling artifact?
6. Repeat until the model finds failures that match real system behavior

The goal is not a model that passes. A model that finds nothing interesting is a model that has not been pushed hard enough.

## Prompting patterns that work well

**Pattern 1 — Start from a failure scenario:**
> "Here is a system: [description]. What are the most likely failure modes? For each one, write a Fault `.fspec` that would detect it."

**Pattern 2 — Start from existing code:**
> "Here is the implementation: [code]. What invariants should always hold for this to be correct? Write a Fault spec that tests those invariants under concurrent execution."

**Pattern 3 — Expand an existing spec:**
> "Here is a working Fault spec: [spec]. Add a new flow that models [behavior] and add assertions that would catch failures in that flow. Do not change the existing assertions."

**Pattern 4 — Debug an unsat result:**
> "This Fault model returns unsat. The assertion is [assertion]. Explain what would need to change — in initial stock values, flow operations, or run block structure — for a counterexample to exist. Then make the smallest change that would allow the solver to find one."