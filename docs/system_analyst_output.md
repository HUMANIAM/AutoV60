# AutoV60 v1 — System Analyst Output

## Document Purpose
This document records the clarified client intent and the agreed interpretation of the first version of the project.

It acts as the initial contract for the Git repository.

---

## 1. Client Intent
The client wants to build a small embedded prototype that can become the first step toward automating part of the V60 coffee process.

The immediate objective is not to automate all of V60.
The immediate objective is to prove a minimal physical control loop in the real world.

The client also uses this project as a practical way to return to embedded systems through a real design problem.

### Interpreted intent
- build something real, small, and cheap
- use the project as a learning vehicle
- focus on hardware reality first
- avoid premature polish
- keep the setup replaceable and easy to iterate on
- build only the smallest useful slice first

---

## 2. Product Vision for Version 1
**AutoV60 v1 is a cheap, small, replaceable embedded prototype that automatically dispenses a target amount of water by measured weight, mainly to validate the product idea and learn from the real hardware setup.**

---

## 3. Agreed System Boundary
### System under design in version 1
A gravity-fed water dispensing prototype with:

- a manually filled water container
- a hose / tubing path
- an electrically controlled on/off valve
- a weight measurement device
- a microcontroller running firmware

### Core system behavior
The system shall:

1. start a dispensing action
2. open the valve
3. read water weight continuously or frequently
4. stop the valve when the measured target is reached

---

## 4. Functional Requirements
### FR-1 — Target amount control
The system shall dispense water until a configured target amount is reached.

### FR-2 — Valve control
The system shall control a water valve in binary mode only:
- open
- closed

### FR-3 — Measured stopping condition
The system shall use measured weight as the stopping signal rather than estimated time alone.

### FR-4 — Local execution
The first version shall run locally without requiring a mobile app, cloud backend, or voice interface.

### FR-5 — Bench prototype operation
The first version shall work as a workshop / desk prototype using off-the-shelf parts.

---

## 5. Non-Functional Requirements
### NFR-1 — Low cost
The setup should stay inexpensive enough to experiment without fear of breaking parts.

### NFR-2 — Replaceability
Core parts should be easy to replace.

### NFR-3 — Simplicity
The design should favor simple, understandable connections over cleverness.

### NFR-4 — Expandability
The first version should not block later extension into richer hardware or interface layers.

### NFR-5 — Learnability
The system should be easy enough to observe, test, and modify during learning.

---

## 6. Explicit Design Decisions Already Made
### Decision 1 — Start with a prototype, not a finished product
The first milestone is a visible end-to-end prototype.

### Decision 2 — Use measured weight, not time-only estimation
Time-only control was considered, but measured weight was chosen because it is a stronger long-term foundation.

### Decision 3 — Use an on/off valve
Variable flow control is not required in version 1.
A simple on/off valve is sufficient.

### Decision 4 — Use a manual tank first
Direct plumbing is a later evolution.
Version 1 uses a manually filled water container.

### Decision 5 — UI is not part of version 1
The first version focuses on controller logic and hardware behavior.
A mobile app or other interface can come later.

### Decision 6 — Prioritize embedded reality over software complexity
The hard part in version 1 is the physical setup, not application software.

---

## 7. Primary Risks
- unstable water flow from the tank
- inaccurate or noisy weight readings
- wiring mistakes during prototyping
- valve switching / power issues
- weak mechanical mounting of parts
- overcomplicating the project too early

---

## 8. Assumptions
- a simple gravity-fed prototype is sufficient for learning and proof of concept
- an off-the-shelf valve can be controlled electrically with a microcontroller through a driver module
- measured weight is good enough as the first control signal
- the client is comfortable building firmware once the hardware is assembled

---

## 9. Version 1 Non-Goals
The following are deliberately not part of the first contract:

- hot water handling
- full V60 sequence automation
- bloom stages and multi-pour recipes
- production enclosure
- direct connection to water pipes
- food-grade production validation
- cloud infrastructure
- polished consumer UX

---

## 10. Acceptance Criteria
Version 1 is accepted when the following can be demonstrated on a bench setup:

- the controller boots and runs
- the weight reading can be observed
- the valve can be switched by firmware
- water flows from the container through the valve
- the system stops the valve when the target amount is reached

---

## 11. Recommended Next Documents
After this contract, the next useful repo documents are:

1. hardware architecture draft
2. wiring plan
3. firmware control loop design
4. bring-up checklist
5. component bill of materials

---

## 12. Contract Statement
This repository starts from a deliberately small contract:

> Build a cheap, replaceable embedded prototype that dispenses water from a manual tank and stops at a target measured weight using an on/off valve and microcontroller control.

Everything outside that boundary is future work.
