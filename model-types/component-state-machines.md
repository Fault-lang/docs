---
title: Component State Machines
---

# Component State Machines

A component state machine model is the right choice when you want to reason about **systems with distinct operating modes** — services that can be healthy, degraded, or failed; protocols with handshake states; distributed systems where components influence each other's transitions.

These models live in a `.fsystem` file. The state machine defines *which mode* each component is in. Imported `.fspec` files define *what happens* during transitions.

**Use component state machine models when:**
- Your system has discrete, named operating modes
- Different components interact by triggering each other's state changes
- You want to check reachability ("can the system reach this failure state?") or safety ("can two components ever be in these states simultaneously?")

---

## Worked Example: Database Primary/Replica Failover

A database cluster has a primary node and a replica. When the primary fails, the replica should promote itself. We want to verify:

1. There is never a moment where both nodes think they are primary
2. If the primary fails, the replica eventually promotes

### Defining the Components

```
system dbCluster;

component primary = states{
    active: func{
        advance(this.failing) || stay();
    },
    failing: func{
        advance(this.failed);
    },
    failed: func{
        stay();
    },
};

component replica = states{
    standby: func{
        if primary.failed {
            advance(this.promoting);
        } else {
            stay();
        }
    },
    promoting: func{
        advance(this.active);
    },
    active: func{
        stay();
    },
};
```

States are functions. `advance()` transitions to the named state. `stay()` remains in the current state. States can be referenced as booleans in conditionals — `if primary.failed` is true when the `failed` state is active.

### Cross-Component Transitions

The replica's `standby` state watches `primary.failed` to decide when to start promoting. This is how Fault models inter-component signaling — no explicit messages, just state visibility.

The `||` in `active: func{ advance(this.failing) || stay(); }` means the solver will explore both the "stays active" and "starts failing" paths when looking for counterexamples.

### Writing Assertions

```
// Safety: both nodes are never simultaneously active
assert !(primary.active && replica.active);

// Liveness: if primary fails, replica eventually becomes active
assert replica.active eventually;
```

The first assertion is a safety property — something that should *never* happen. The second is a liveness property — something that *must eventually* happen.

### The Run Block

```
run {
    primary.active | replica.standby;
    primary.active | replica.standby;
    primary.active | replica.standby;
    primary.active | replica.standby;
    primary.active | replica.standby;
}
```

Each round runs both components concurrently. Fault explores whether the primary can fail and whether the replica responds correctly given the possible orderings.

### Complete Model

```
system dbCluster;

component primary = states{
    active: func{
        advance(this.failing) || stay();
    },
    failing: func{
        advance(this.failed);
    },
    failed: func{
        stay();
    },
};

component replica = states{
    standby: func{
        if primary.failed {
            advance(this.promoting);
        } else {
            stay();
        }
    },
    promoting: func{
        advance(this.active);
    },
    active: func{
        stay();
    },
};

assert !(primary.active && replica.active);
assert replica.active eventually;

run {
    primary.active | replica.standby;
    primary.active | replica.standby;
    primary.active | replica.standby;
    primary.active | replica.standby;
    primary.active | replica.standby;
}
```

---

## Adding Stock-Flow Detail

A pure state machine model is a **Moore machine** — it only reasons about which states are reachable. To model *how* transitions happen based on resource values, import a `.fspec` file.

For example, to model the primary only failing when its connection count drops to zero:

```
// connections.fspec
spec connections;

def pool = stock{
    active: 5,
};

def connMgr = flow{
    p: new pool,
    drain: func{
        p.active -> 1;
    },
    add: func{
        p.active <- 1;
    },
};

assert pool.active >= 0;
```

```
// dbCluster.fsystem
system dbCluster;

import("connections.fspec");

global conns = new connections.connMgr;

component primary = states{
    active: func{
        conns.drain;
        if connections.pool.active = 0 {
            advance(this.failing);
        } else {
            stay();
        }
    },
    ...
};
```

The state machine now triggers the flow on each round. The transition to `failing` only happens when the resource condition is met.

---

## Key Concepts

- **[Components](../language-reference/components)** — component and states syntax
- **[States](../language-reference/states)** — state functions, advance/stay/leave, state as boolean
- **[Fsystem and Fspec Files](../language-reference/fsystem_fspec)** — file structure and imports
- **[Time](../language-reference/time)** — how rounds work with state machines
- **[Special Syntax](../language-reference/special_syntax)** — choose, pipe, when/then
