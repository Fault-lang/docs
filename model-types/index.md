---
title: Model Types
---

# Model Types
Fault supports four distinct modeling styles. Each is suited to a different kind of problem.

| Model Type | File Type | Use When |
|---|---|---|
| [Stock-Flow](stock-flow) | `.fspec` | Modeling resource flows, queues, capacity limits |
| [Component State Machines](component-state-machines) | `.fsystem` | Modeling distributed systems, protocols, component interactions |
| [Program Synthesis](program-synthesis) | `.fspec` | Finding sequences of operations that satisfy a property |
| [Boolean Logic](boolean-logic) | `.fspec` | Pure logical modeling without numeric quantities |

If you are new to Fault, start with the model type that most closely matches the system you want to model.

## How Fault Models Work

### Bounded Checking
Like most model checkers, Fault will not run your model indefinitely. It is **bounded**, meaning it will only check the exact number of steps you tell it to. Each line in the run block is one round of execution. Fault verifies that your assertions hold across every step.

This isn't as serious a limitation as you might assume. The trick is not to define a starting state for the variables in the model. If they are unknown, then the model checker will jump to whatever values will lead to a solution. 

More steps mean larger SMT formulas, which take longer to solve. Start with 3–5 steps and increase only if you have reason to believe the failure requires more. See [Time and Rounds](../language-reference/time) for details.

### Strings as Booleans
SMT does not have string operations, and no need for them either. But in Fault will allow you to define something that looks like the string

```
a = "Socrates is a man";
b = "All men are mortal";
c = "Socrates is mortal";
```

And then treat it like a boolean!

Under the hood, SMT encodes information in variable names that look like variable names in any other language. This can make it hard to make sense of your results when you have hundreds of rules. You have to remember how each one maps to a variable name.

Fault treats strings like booleans and encodes them as SMT rules, but keeps the string itself as a docstring and reuses it when formating the results from the solver.

### In-flows (<-) and Out-flows (->)
Fault is for programmers, not mathematicians. The syntax is designed to be familiar to programmers (without being too close ... after all, Fault is not a programming language!) and mathematical symbols common in logic are either avoided or not used.

So `x -> y` is _not_ the logic symbol for implies in Fault (sorry ... but also, not sorry) Instead it's just some syntaxic sugar for `x = x - y`

`x -> y` decrements x by y. `x <- y` increments x by y. Of course if this bother you, you can always just write `x = x - y` instead

### Extending and Multiplying Constructs
While stocks and flows were originally named to match the format of system dynamics models, they've developed into their own concepts within the language.

Stocks can be extended to create parent-child hierarchies. This means you can write assertions against the parent that apply to all children, or target a specific child when a constraint only belongs there.

Flows can be initiated as multiples, meaning the same flow can be executing as many concurrent instances as the solver needs to find a solution — or a failure. Rather than specifying how many, you let the solver decide, and use `::count` to bound what it's allowed to try.
