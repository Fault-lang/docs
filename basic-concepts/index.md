---
layout: default
title: Basic Concepts
nav_order: 3
has_children: true
---

# Basic Concepts
Fault models have two parts: a state chart that defines components with their various states and specifications that define exactly how the transitions between states work.

What makes modeling systems difficult is that--regardless of what tools or languages you build your model in--you need to simplify some aspects of the system first. Simplify the wrong parts and your model fails to catch real problems.

Fault uses a state chart to create a skeleton structure for the model that defines what parts of the system are relevant and what parts can be simplified. State charts are stored in `.fsystem` files and are made up of `components` and `states`

`stock`/`flow` combinations can then be imported from `.fspec` files and used to define how a component transitions from one state to another. Or they can be run independently as their own stand alone models.

# Online REPL
Keeping with the trend of explaining Fault via example models... Let's suppose we're going to build an online REPL. People come to our website, enter code into a textarea and click RUN to execute it.

But we want to think through our system and see if our logic makes sense. We're going to use [this architecture](https://cloud.google.com/customers/repl-it/) as our reference.

Each module in this section is going to go through a different concept in detail. Here's what the final state chart (`.fsystem`) file will look like:

```
system repl;

import(
        "cache.fspec"
        "orchestrator.fspec"
    );

global record = new cache.record;
global manager = new orchestrator.control;

component replCache = states{
    idle: func{
        advance(this.expired) || advance(this.lookupRecord);
    },
    lookupRecord: func{
        record.lookup;
            advance(this.returnRecord) || advance(this.createRecord);
    },
    returnRecord: func{
        record.release;
        advance(this.idle);
    },
    createRecord:func{
        advance(containerMng.pullContainer);
    },
    expired: func{
        record.expire;
        advance(this.idle);
    },
};

component containerMng = states{
    idle: func{
        stay();
    },
    pullContainer: func{
        manager.boot;
        advance(this.standUpContainer);
    },
    standUpContainer: func{
        manager.add;
    },
    shutdownContainer: func{
        manager.remove;
    },
};

start {
    replCache:lookupRecord,
    containerMng:idle,
};
```

And here's the `.fspec` files we import

```
spec cache;

def resources = stock{
    blocks: 0, // Used blocks of memory 
    table: 0, // Number of items in the table
};

def record = flow{
    machine: new resources,
    lookup: func{
        machine.blocks <- 1;
    },
    release: func{
        machine.blocks -> 1;
    },
    store: func{
        machine.table <- 1;
        machine.blocks <- 1;
    },
    expire: func{
        machine.table -> 1;
        machine.blocks <- 1;
    },
};

assert resources.blocks < 4;
assert resources.table <= 4;

for 5 run {
    r = new record;
    r.store | r.release;
};
```

```
spec orchestrator;

def pool = stock{
    instances: 0,
    loading: 0,
};

def control = flow{
    p: new pool,
    add: func{
        if p.loading > 0{
            p.loading -> 1;
            p.instances <- 1;
        }
    },
    remove: func{
        p.instances -> 1;
    },
    boot: func{
        p.loading <- 1;
    },
};

assert pool.instances > 0 eventually-always;

for 3 run {
    cluster = new control;
    cluster.boot;
    cluster.add;
    if cluster.p.instances > 1{
        cluster.remove;
    }
}
```