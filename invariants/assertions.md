---
layout: default
title: Assertions
parent: Invariants
nav_order: 2
---
# Assertions

When you define an assertion, you're asking Fault to find a solution to the model where your assertion is _not true_. Fault does this by negating the statements before generating the rules.

| Fault assertion | SMT generated |
| :-------------- | :------------ |
| `x > 3`         | `(<= x 3)`    |
| `y == 4`         | `(not (= y 4))` |
| `x > 3 && y == 4`| `(or (<= x 3) (not (= y 4)))`|

## Assertions on Structs
You can write assertions for structs (the stock and flow defintions) and those assertions will include all instances of those structs.

The following assert in our cache spec

```
assert resources.table <= 4;
```

Becomes the this in SMT
```
(assert (or 
    (> cache_r_machine_table_0 4)
    (> cache_r_machine_table_1 4)
    (> cache_r_machine_table_2 4)
    (> cache_r_machine_table_3 4)
    (> cache_r_machine_table_4 4)
    (> cache_r_machine_table_5 4)
    (> cache_r_machine_table_6 4)
    (> cache_r_machine_table_7 4)
    (> cache_r_machine_table_8 4)
    (> cache_r_machine_table_9 4)
    (> cache_r_machine_table_10 4)
    (> cache_r_machine_table_11 4)
    (> cache_r_machine_table_12 4)
    (> cache_r_machine_table_13 4)
    (> cache_r_machine_table_14 4)
    (> cache_r_machine_table_15 4)
))
```

Notice that although the rule in Fault is for `resources.table` all the rules generated in SMT are for the instance of `resources` initialized in the instance of the flow declared in the run block.

## Assertions on Instances
Assertions can also be made for just a specific instance of a stock.

Instead of this

```
assert resources.table <= 4;
```

You can do this

```
assert r.machine.table <= 4;
```

## Assertions on States
Even the state chart can have assertions. For example:

```
assert (replCache.lookupRecord && !replCache.expire) || (!replCache.lookupRecord && replCache.expire);
```

...would assert that the cache cannot be looking up records while also deleting them.

When used in asserts, state are treated as booleans establishing whether the state is active or not.