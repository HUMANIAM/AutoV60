# AutoV60 v1 — Problem Definition

## Purpose
AutoV60 starts as a small embedded prototype whose first job is to prove one core automation loop of a larger coffee idea:

**dispense a target amount of water automatically and stop at the right moment.**

This is the first step toward later V60 coffee automation, but version 1 is intentionally narrow.

## Background
The original idea came from repeated manual V60 coffee brewing. The manual process can produce good results, but it depends on human attention, timing, and consistency. Instead of trying to automate the full coffee process at once, the project starts with the smallest useful physical control problem.

## Core Problem
For version 1, the problem is:

> How can we build a cheap, simple, embedded prototype that controls water dispensing and stops at a target amount using real hardware?

This is primarily a **hardware control and prototyping problem**, not a UI problem.

## Why This Project Exists
This project serves two purposes at the same time:

1. **Product exploration**  
   Validate whether a small automated water-dispensing system can become the foundation of a larger coffee product.

2. **Learning through a real problem**  
   Re-enter embedded systems by solving a concrete physical control problem instead of studying in the abstract.

## Version 1 Goal
Build a minimal, cheap, replaceable prototype that can:

- read measured water weight
- open a water valve
- close the valve when the target amount is reached
- run as a real embedded setup on a desk or workshop table

## Version 1 Scope
### In scope
- small microcontroller-based control loop
- manually filled water container / tank
- inline electrically controlled on/off valve
- weight measurement using a scale / load-cell-based setup
- simple firmware that opens the valve and closes it at the target
- local development from laptop over USB

### Out of scope
- heating water
- full V60 brewing recipe automation
- pour patterns
- mobile app
- voice control
- direct plumbing / water pipe integration
- polished enclosure
- production-grade mechanical design

## Success Criteria for Version 1
Version 1 is successful if the prototype can do this reliably enough for learning and demonstration:

1. the firmware starts
2. the valve opens
3. water flows from the tank
4. the system reads measured weight
5. the valve closes automatically at the target amount
6. the setup can be repeated and improved without redesigning everything from scratch

## Constraints
- keep cost low
- use off-the-shelf parts
- prefer parts that are easy to replace if broken
- avoid over-design
- optimize for learning speed and hands-on iteration

## Guiding Principle
Version 1 is not trying to be a complete product.
It is trying to make the **core control loop real**.

That loop is the first contract with reality.
