---
layout: default
title: Time
parent: Basic Concepts
nav_order: 6
---
# Time
Fault verifies system behavior over a bounded number of discrete rounds, declared with for N run { ... }. A round is the fundamental unit of time — it represents one step of the system's evolution. The SMT solver checks that all assertions hold across every round.
                                                     
## Flow-Based Time
In a `.fspec` file, flows execute their functions once per round. Two operators control ordering within a round:

### Sequential (separate lines) — fixed order, deterministic:

```
run {
       arr.enqueue;
       proc.drain;
}
```

arr.enqueue always completes before proc.drain in every round.                                                                       
### Concurrent (|) — non-deterministic ordering:
```
arr.enqueue | proc.drain;
```

The SMT solver considers both possible orderings — enqueue first, or drain first — and verifies that assertions hold under either.

This is not parallel execution; it is a claim that the ordering is unspecified and the system must be correct regardless.
            
## State Machine Time                         
In a `.fsystem` file, components are state machines. Each state has a boolean variable indicating whether it is currently active. States are inactive by default; the start block sets which state each component begins in.

Both stay() and advance() are non-deterministic possibilities, not commands. A state function may contain both — the SMT solver explores all valid paths simultaneously.

### Chains within a round
Because advance() updates state booleans immediately, a state machine can pass through multiple states in a single round. If state A calls advance(B), B's boolean becomes true, and calls that state function. This continues until a stay() is reached or there are no more states to evaluate. State machines advance until they stabilize, not one step per round.

## Using Flows and State Machines Together
A run block in a `.fsystem` file can specify both the round count and the ordering relationship between components:

```
for 5 run {
    Arrival | Processor;
    Queue;
}
```

This means: in each of 5 rounds, the SMT solver considers both orderings of Arrival and Processor (mirroring | semantics from fspec), followed by Queue in a fixed order. Without the run block, the state machine will execute each component in the order they are defined in the specification.

Flow functions called from component state functions execute in the context of the current round. Flow variables reflect the values established by flows that ran earlier in that round — a state mid-chain observes whatever snapshot of the flow variables exists at that point in the round's SSA sequence.

## Summary
Rounds determine how deep the verification goes. Most properties are provable in 3–4 rounds, especially if you avoid declaring variables with specific values. Higher rounds produce larger SMT formulas, which may cause performance issues or even models the solver never returns a solution for.

State changes are treated as if they happen instantaneously, each component is executed in the order it is defined, unless an order is specified in the run block. Fault will execute all the state transitions triggered by that component until it has doubled-back on a state it has seen before (to prevent infinite loops) or it has run out of state transitions.

Fault ignores the round count of imported files.