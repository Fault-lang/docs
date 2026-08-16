---
title: Stocks
---
# Stocks

Simple systems can be expressed accurately as linear relationships--straight forward cause and effect. More complex systems, however, transform those linear relationships into dynamic feedback loops where change to one variable's value impacts several different parts of the system.

Our state chart is that simple system, states are either on or off. But when specifying what triggers them to go on or off we end up with a dynamic system instead.

Stocks are the first building block of a dynamic system. They are resevoirs of resources. In our REPL model we care about two scenarios:

1. That the orchestrator goes from pulling the container to standing it up correctly
1. That the cache always has enough memory to store references to active servers.

So to do that we create the following stocks

For the cache

```
def resources = stock{
    blocks: 0, // Used blocks of memory
    table: 0, // Number of items in the table
};
```

For the orchestrator

```
def pool = stock{
    instances: 0,
    loading: 0,
};
```
## Possible Values
In Fault, stocks can be numeric values (floats or integers), booleans, or unknown/uncertain types.

The Fault compiler treats all numeric values as doubles (Real numbers in SMT, essentially floats) in order to be friendlier to the solver.

For more information about different types of values [see the section on data types](../data-types)

## Stock Inheritance

A stock can inherit all fields from another stock using `extends`:

```
def base = stock{
    value: 0,
    limit: 100,
};

def extended = stock{
    extends base,
    extra: 5,
};
```

`extended` has all three fields: `value`, `limit`, and `extra`.

To inherit from a stock in an imported spec, qualify the name with the import alias:

```
def level2 = stock{
    extends nestedimport.level1,
};
```

### Excluding Inherited Fields

Use `exclude` to drop a specific field from the inherited set:

```
def derived = stock{
    extends base,
    exclude limit,
};
```

`derived` has `value` but not `limit`. This lets you build variations of a stock without duplicating the common fields.
