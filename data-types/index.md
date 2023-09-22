---
layout: default
title: Data Types
nav_order: 4
---
# Data Types
Fault relies on simple data types. Numeric types--Integers and Floats, Boolean types, "Solvables"--Unknowns and Uncertains.

The type checker deduces data types from the grammar and does not need any type hints.

## All Numbers Are Reals
Fault converts all integers into reals (floats, specifically doubles) before generating SMT. This is what ran fastest in the early performance tests of various SMT models.

## Booleans
One can define a Boolean in Fault in two ways. The first is a traditional boolean value:

```
def node = stock{
    property1: true,
    property2: false,
};
```

Strings are treated as booleans with the string value used as a description of the rule expressed by the variable

```
s = "United States Postal Service";
t = "Postal Regulatory Commission";
u = "the Government Accountability Office";

independentEst = !s && !t && !u;
```

## Unknowns
The first draft of the model may define stocks with numeric values, but you can also leave them undefined and have the solver figure it out for you.

For example, we could define the cache like this

```
spec cache;

const table = unknown();
const memory = unknown();

def resources = stock{
    blocks: unknown(),
    table: unknown(),
};

assert resources.blocks < memory;
assert resources.table <= table;
```

And the solver would assign values to those variables that satisfied the model (in other words, found a failure case).

Unknowns can be declared explicitly with `unknown()` but also implicitly by just not assigning the variable a value when declaring it.

```
const table;
const memory;

def resources = stock{
    blocks,
    table,
};
```

## Uncertains
Alternatively sometimes the exact value is unknown but there are a range of values that are reasonable and anything out of that scope is unlikely.

There are two ways to do this in Fault. The first is to define [assumptions](../invariants/assumptions.html) specifying that the variable is greater than or less than certain ranges.

The second way is to declare the variable as `uncertain` which will allow those out of range solutions but calculate the probability of the value actually happening.

Uncertain values take two arguments. The mean and the sigma (standard deviation). For example changing the cache spec in the repl model to this:

```
def resources = stock{
    blocks: uncertain(1,.5),
    table: unknown(),
};
```

Will return results with annotations of the probabilities in parenthesis:

```
cache_r_machine_blocks
-> 0.500000 (0.483941) -> 0.500000 (0.483941) -> 0.500000 (0.483941) -> 1.500000 (0.483941) -> 0.500000 (0.483941) -> 0.500000 (0.483941) -> 0.500000 (0.483941) -> 0.500000 (0.483941) -> 1.500000 (0.483941) -> 0.500000 (0.483941) -> 0.500000 (0.483941) -> 0.500000 (0.483941) -> 0.500000 (0.483941) -> 1.500000 (0.483941) -> 0.500000 (0.483941) -> 0.500000 (0.483941) -> 0.500000 (0.483941) -> 0.500000 (0.483941) -> 1.500000 (0.483941) -> 0.500000 (0.483941) -> 0.500000 (0.483941) -> 0.500000 (0.483941) -> 0.500000 (0.483941) -> 1.500000 (0.483941) -> 0.500000 (0.483941)
```

For the time being Uncertains assume a normal distribution. Future updates may offer more options or the ability to restrict improbable values from the solution space.