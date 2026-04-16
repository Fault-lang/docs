---
layout: default
title: Special Syntax
parent: Basic Concepts
nav_order: 7
---
# Special Syntax
Some modeling languages work effectively like programming languages. The code compiles to series of instructions that the computer executes, running a simulation and returning a result.

Fault compiles to _rules_ and asks an SMT to produce a solution that satisfies all those rules. It then interprets that solution to look like a simulation. Fault will render rules to cover every conceivable possibility in the model, in effect running _every_ possible simulation at once looking for the first one that satisfies all the rules.

When you have no assertions Fault will return the first scenario that it finds. When you declare assertions, Fault will look for a scenario where your assertions are wrong (model checking). When you declare assumptions, Fault will restrict the state graph to only scenarios where though assumptions are true.

Fault has some special syntax in order to specify other aspects of how those rules should be build

## The Pipe '|' Operator
The pipe operator is used to tell Fault that these steps are happening in parallel. It will give you some feedback on concurrency. When Fault sees `funcA | funcB`, what it will do is generate two paths for the solver to choose between: one in which funcA finishes before funcB and one in which funcB finishes before funcA. The less the functions themselves do, the better this can model actual concurrency.

You can chain pipe operators ( `funcA | funcB | funcC` ) but that will cause your state space to explode. Fault will generate rules for every possible order of functions. If the functions themselves generate a lot of rules or the model has many rounds, performance on the solver may suffer.

## Choose Ors
The keyword `choose` helps clarify what Fault should do when it comes across an `||` in the state graph. You cannot use `choose` within asserts or assumptions.

In logic, the truth table for OR will produce a TRUE when one _or more_ values is TRUE. This creates a scenario where instead of going down branch A or branch B, the model might go down _both_. In most cases, that isn't what you want.

`choose A || B;` is close to an XOR, except when you give XOR multiple variables it will return TRUE when an odd number of them are TRUE. Again that creates cases where the model might go down multiple paths when what we want it to do is choose one.

The `choose` keyword makes that instruction explicit. `choose A || B || C;` translates to `(A && !B && !C) || (!A && B && !C) || (!A && !B && C)` thereby allowing only one path to be chosen.

## When/Then
The construction `when A then B` can only be used with asserts and assumptions to create rules that require B to always be true when A is true. B can be false if A is false, but B _must_ be true if A is true. 
