# AutoV60

AutoV60 is an embedded product experiment to automate part of the V60 coffee brewing process.

The project starts from a simple, real problem: dispensing a target amount of water consistently without relying on manual timing or attention. The first version is intentionally small, cheap, and hardware-first. It is not a full coffee machine. It is a minimal prototype to prove the core control loop in the real world.

## What the project is about

AutoV60 explores how a simple embedded system can:

- control water flow with an on/off valve
- measure dispensed water amount by weight
- stop automatically when a target amount is reached

The first goal is to make this loop work end to end with off-the-shelf parts. Once the physical system works and can be observed, the project can evolve toward richer brewing workflows and a more productized design.

## Current project intent

Version 1 focuses on a gravity-fed prototype with:

- a water container or tank
- an electrically controlled valve
- a weight measurement setup
- a microcontroller running the control logic

The purpose of v1 is to validate the idea, learn the hardware and control behavior, and build a foundation that can be improved step by step.

## What this project is not yet

At this stage, AutoV60 is **not**:

- a polished consumer product
- a full V60 recipe engine
- a heating system
- a mobile app
- a complete coffee machine

Those may come later, but they are not the current contract.

## Documentation

The main project documents live in the `docs/` folder.

Start with:

- `docs/problem_definition.md` — defines the problem, the context, and the v1 boundary
- `docs/system_analyst_output.md` — captures the agreed client intent, scope, assumptions, and contract for v1
- `docs/components_and_instruments.md` — explains the current hardware choices, trade-offs, and what to buy for the first prototype

## Guiding principle

This project is built to learn through a real problem.

Instead of starting from abstract study, AutoV60 starts from a concrete control problem and uses the product prototype as the path to understanding embedded systems, hardware integration, and system design.

## Status

The repository is at the beginning of the journey.

The current milestone is to assemble the minimum prototype, set up the development environment, connect the controller to the valve and measurement path, and make the first control loop work in front of us.
