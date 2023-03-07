---
layout: default
title: Assumptions
parent: Invariants
nav_order: 2
---
# Assumptions
Assumptions follow essentially the same [rules as assertions](assertions.html) except they are _not_ negated. This means we can use assumptions to tell the solver to ignore certain potential solutions.

In this sense an assumption in Fault is basically an [axiom](https://en.wikipedia.org/wiki/Axiom#Logical_axioms). The model must assume that the assumption is always true. If our purpose is formalization or verification, these assumptions are supposed to have been proven correct in another earlier model. In simulation we can take the fact for granted and just use assumptions to eliminate a whole set of potential solutions we do not care about.