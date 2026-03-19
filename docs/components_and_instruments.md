# AutoV60 v1 — Components and Instruments Guide

## Purpose
This document explains what to buy for the first prototype, why each part exists, what trade-offs it brings, and where to learn more.

The goal is not to buy the perfect production hardware.
The goal is to buy the **smallest sane set** that lets the prototype work.

---

## 1. ESP32 Development Board
### Suggested item
- **ESP32-D0WDQ6 Development Board**

### What it does
This is the controller board — the brain of the prototype.
It runs the firmware that:
- reads weight data
- decides when the target amount is reached
- turns the valve on and off

### Why this component
- cheap
- common
- easy to program over USB
- enough GPIO for this prototype
- can support wireless features later if needed

### Trade-offs
**Pros**
- low cost
- strong ecosystem
- easy laptop-based development
- suitable for both prototype and later iterations

**Cons**
- dev board, not product-ready hardware
- more capable than the first prototype strictly needs
- requires learning the board pinout and toolchain

### Learn more
- TinyTronics product page: https://www.tinytronics.nl/en/development-boards/microcontroller-boards/with-wi-fi/esp32-d0wdq6-development-board-with-wi-fi-and-bluetooth
- Espressif docs: https://docs.espressif.com/projects/esp-idf/en/latest/esp32/

---

## 2. Weight Sensor Setup
### Suggested item
- **5 kg weighing scale with HX711**

### What it does
This measures the water amount indirectly by weight.
The HX711 is the small electronics module that reads the load-cell signal and makes it readable by the microcontroller.

### Why this component
- direct measured stop condition
- cheap
- common in hobby and prototype work
- enough range for cup + water + simple setup

### Trade-offs
**Pros**
- much better foundation than time-only estimation
- easy to use for a prototype
- common tutorials and example code exist

**Cons**
- readings can be noisy
- requires calibration
- mechanical mounting affects quality
- not a polished commercial scale

### Learn more
- TinyTronics product page: https://www.tinytronics.nl/nl/sensoren/gewicht-druk-kracht/load-cellen/weegschaal-met-hx711-5kg
- ESP32 + HX711 tutorial: https://randomnerdtutorials.com/esp32-load-cell-hx711/

---

## 3. Solenoid Valve
### Suggested item
- **12V normally closed nylon solenoid valve, G1/2**

### What it does
This is the controllable water tap.
When powered, it opens.
When power is removed, it closes.

### Why this component
- matches the exact v1 control idea
- off-the-shelf
- cheap
- easy to understand
- simple on/off behavior

### Trade-offs
**Pros**
- simple binary control
- easy to wire through a driver
- very suitable for a first gravity-fed prototype

**Cons**
- not a precision flow-control valve
- may not be the final food-safe production choice
- requires correct orientation and fittings
- needs a separate power supply

### Learn more
- TinyTronics product page: https://www.tinytronics.nl/nl/mechanica-en-actuatoren/solenoids/magneetventielen/magneetventiel-normaal-gesloten-12v-dc-nylon-g12
- General explanation of solenoid valves: https://en.wikipedia.org/wiki/Solenoid_valve

---

## 4. MOSFET Driver Module
### Suggested item
- **High Power MOSFET Module 5–36V 15A**

### What it does
This sits between the ESP32 and the valve.
The ESP32 sends a small control signal.
The MOSFET module switches the higher-power 12V line to the valve.

### Why this component
- the ESP32 should not power the valve directly
- cheap and easy
- accepts 3.3V control logic
- exactly fits this switching problem

### Trade-offs
**Pros**
- simple solution
- protects the controller from directly driving the load
- good fit for on/off actuation

**Cons**
- one more module and one more wiring step
- requires correct common-ground wiring
- can still be miswired if rushed

### Learn more
- TinyTronics product page: https://www.tinytronics.nl/en/switches/transistors-and-mosfets/mosfets/high-power-mosfet-module-5-36v-15a
- MOSFET basics: https://en.wikipedia.org/wiki/MOSFET

---

## 5. 12V Power Adapter
### Suggested item
- **12V 2A power adapter**

### What it does
This powers the valve side of the system.
The ESP32 can be powered separately over USB during development.

### Why this component
- stable external power source
- enough for a small valve prototype
- very common and inexpensive

### Trade-offs
**Pros**
- simple bench power setup
- cheap
- widely usable for later tests

**Cons**
- one more cable on the desk
- requires safe separation from water
- connector compatibility must be checked

### Learn more
- TinyTronics product page: https://www.tinytronics.nl/nl/power/voedingen/12v/sunshine-power-adapter-met-dc-jack-5.5-2.1mm-12v-2a

---

## 6. Jumper Wires
### Suggested items
- **Male–female jumper wires**
- **Male–male jumper wires**

### What they do
These connect the boards and modules during prototyping.

### Why these components
- fast to use
- easy to rewire
- perfect for trial-and-error bring-up

### Trade-offs
**Pros**
- flexible
- cheap
- good for learning and debugging

**Cons**
- not mechanically strong
- easy to disconnect accidentally
- not suitable for final product assembly

### Learn more
- TinyTronics jumper wires: https://www.tinytronics.nl/en/cables-and-connectors/cables-and-adapters/prototyping-wires/dupont-compatible-and-jumper/

---

## 7. Small Breadboard
### Suggested item
- **170-point breadboard**

### What it does
Helps build temporary connections cleanly without soldering.

### Why this component
- low cost
- improves wiring clarity
- useful for the first bench setup

### Trade-offs
**Pros**
- very easy to rearrange
- good for experimentation
- cheap

**Cons**
- temporary only
- not robust for movement or final integration

### Learn more
- TinyTronics product page: https://www.tinytronics.nl/nl/gereedschap-en-montage/prototyping-toebehoren/breadboards/breadboard-170-points-transparant

---

## 8. Manual Water Container / Tank
### Suggested choice
- any simple clean container or bottle used as a gravity-fed water source

### What it does
Holds water above the outlet so gravity can move the water through the valve.

### Why this component is not specialized yet
For version 1, the tank is not the smart part.
The tank is just the reservoir.
The controllable part is the valve.

### Trade-offs
**Pros**
- no need to over-design
- cheap or free
- easy to replace

**Cons**
- not polished
- may require DIY mounting
- not representative of the final product form

---

## 9. Tubing / Hose / Fittings
### Suggested choice
- buy after checking the valve thread size and your chosen tank connection

### What they do
Carry water from the tank through the valve to the outlet.

### Why this is left flexible
This part depends on your physical setup.
It is better to inspect the valve and tank in hand before buying adapters blindly.

### Trade-offs
**Pros**
- avoids buying the wrong fittings too early
- lets the physical layout guide the choice

**Cons**
- one extra step after the main order

---

## 10. Optional Instruments / Tools
These are not strictly required in the first order, but very useful:

- micro-USB cable for the ESP32 if you do not already have one
- multimeter for checking voltage and continuity
- small screwdriver set
- zip ties or clips for cable management
- notebook or calibration log

---

## 11. Final Recommended First Order
### Buy now
- ESP32 development board
- 5 kg weighing scale with HX711
- 12V normally closed solenoid valve
- MOSFET driver module
- 12V 2A power adapter
- jumper wires
- small breadboard

### Delay until physical setup is clearer
- tank shape
- hose diameter
- fittings and adapters
- permanent frame / mount

---

## 12. Why This Set Is Right for Version 1
This set is not the most elegant.
It is not the most polished.
It is not the final product.

It is the right set because it gives you:
- the control brain
- the measured signal
- the physical actuator
- the switching electronics
- the power source
- the prototyping wiring

That is enough to make the core loop real.
