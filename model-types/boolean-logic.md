---
title: Boolean Logic Models
---

# Boolean Logic Models

A boolean logic model is the right choice when your system is best described in terms of **propositions that are true or false** rather than quantities that accumulate. You are reasoning about what combinations of facts can coexist, not about numeric values changing over time.

Fault supports pure boolean modeling through boolean stock fields and string fields, which are treated as boolean propositions in logical expressions.

**Use boolean logic models when:**
- Your system state is a set of flags or conditions, not numeric quantities
- You want to check that certain combinations of facts are impossible
- You are modeling access control, feature flags, protocol invariants, or logical constraints

---

## Booleans in Stocks

Stock fields can hold `true` or `false`:

```
def state = stock{
    authenticated: false,
    tokenIssued: false,
    accessGranted: false,
    sessionExpired: false,
};
```

Flow functions can set, unset, or combine these using `=`:

```
def auth = flow{
    s: new state,

    login: func{
        s.authenticated = true;
        s.tokenIssued = true;
    },

    grant: func{
        s.accessGranted = true;
    },

    expire: func{
        s.sessionExpired = true;
        s.tokenIssued = false;
    },

    revoke: func{
        s.accessGranted = false;
        s.authenticated = false;
    },
};
```

### Assertions Over Booleans

Use `&&`, `||`, and `!` to combine boolean stocks in assertions:

```
// Access cannot be granted without authentication
assert when state.accessGranted then state.authenticated;

// A session cannot be both active and expired
assert !(state.accessGranted && state.sessionExpired);

// Once expired, token must be re-issued before access can be granted again
assert when state.sessionExpired then !state.tokenIssued;
```

---

## Strings as Propositions

String fields are treated as booleans in logical expressions. A string field is truthy — its truth value can be negated, ANDed, or ORed with other fields.

This lets you name boolean propositions with descriptive labels:

```
spec featureFlags;

const (
    betaUsersOnly = "only beta users see this"
    adminRequired = "requires admin role"
);

def access = stock{
    isBetaUser: betaUsersOnly,
    isAdmin: adminRequired,
    featureVisible,              // unknown — solver picks
};
```

### Boolean Logic on Strings

```
def rules = flow{
    a: new access,

    enableForBeta: func{
        a.featureVisible = a.isBetaUser;
    },

    enableForAdmin: func{
        a.featureVisible = a.isAdmin;
    },
};

// Feature is only visible to beta users or admins
assert when access.featureVisible then (access.isBetaUser || access.isAdmin);

// Feature cannot be visible to a non-admin non-beta user
assert !(access.featureVisible && !access.isBetaUser && !access.isAdmin);
```

---

## Worked Example: Mutex Protocol

Two processes want to enter a critical section. At most one should be inside at a time. We want to verify the mutual exclusion property.

```
spec mutex;

def lock = stock{
    heldByA: false,
    heldByB: false,
    available: true,
};

def protocol = flow{
    l: new lock,

    acquireA: func{
        if l.available {
            l.heldByA = true;
            l.available = false;
        }
    },

    acquireB: func{
        if l.available {
            l.heldByB = true;
            l.available = false;
        }
    },

    releaseA: func{
        l.heldByA = false;
        l.available = true;
    },

    releaseB: func{
        l.heldByB = false;
        l.available = true;
    },
};

// Mutual exclusion: A and B cannot both hold the lock
assert !(lock.heldByA && lock.heldByB);

// Consistency: if someone holds the lock, it is not available
assert when (lock.heldByA || lock.heldByB) then !lock.available;

run init {
    p = new protocol;
} {
    p.acquireA | p.acquireB;
    p.acquireA | p.acquireB;
    p.releaseA | p.releaseB;
    p.acquireA | p.acquireB;
    p.acquireA | p.acquireB;
    p.releaseA | p.releaseB;
};
```

The `|` operator on `acquireA | acquireB` means Fault explores both orderings — A acquires first, or B acquires first. If the guard conditions are insufficient to prevent both acquiring simultaneously, the solver will find the counterexample.

---

## `when/then` for Conditional Invariants

The `when A then B` construction is the clearest way to express implication in assertions and assumptions:

```
assert when state.accessGranted then state.authenticated;
```

This is equivalent to `assert !state.accessGranted || state.authenticated` but reads more clearly. It can be used with any temporal qualifier:

```
assert when lock.heldByA then !lock.heldByB always;
```

---

## Key Concepts

- **[Special Syntax](../language-reference/special_syntax)** — `when/then`, `choose`, `|`
- **[Invariants](../invariants)** — assertions and assumptions
- **[Data Types](../data-types)** — booleans, strings, unknowns
- **[Flows](../language-reference/flows)** — flow and func syntax
