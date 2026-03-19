# AutoV60 Simulation Setup

## Purpose

This document explains the lightweight simulation setup for AutoV60 v1.

The goal is to validate the control loop before wiring the real hardware:
- controller opens the valve
- water starts flowing
- measured weight increases
- controller closes the valve at the target

The setup is intentionally simple and suitable for a weak laptop.

## VM / dev environment prerequisites (CLI)

This repo is typically developed **inside an Ubuntu 24 VM** (with the host connecting via VS Code Remote SSH).

- Full VM provisioning runbook: `docs/vm_ubuntu_24_dev_env_setup.md`
- Minimal guest requirements for *simulation only*:
  - Python 3 + `venv`
  - Git (to clone/open the repo)

In the **Ubuntu 24 guest**, run:

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip git
```

In the repo root (inside the guest):

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
```

Then you can run your simulator script (once it exists under `simulation/`), for example:

```bash
python simulation/flow_simulator.py
```

## Simulation Strategy

Use two small layers instead of one heavy simulator:

1. **ESP32 controller simulation**
   - Use **Wokwi** in the browser
   - Simulate GPIO behavior and simple firmware logic
   - Start with LED blink as the hardware hello world

2. **Control-loop / system simulation**
   - Use a small **Python script**
   - Simulate tank, valve, flow rate, cup weight, and stop logic

This avoids large tools like Simulink.

## First Step: Hardware Hello World

Before simulating the full system, verify the embedded workflow with the smallest possible test.

### Goal

Blink one LED on and off from the ESP32.

### Why

This confirms:
- development environment works
- ESP32 project runs
- GPIO output works
- timing loop works
- simulator and firmware loop are understood

### Minimal Behavior

- LED ON
- wait
- LED OFF
- wait
- repeat forever

## Wokwi Setup

Wokwi is used to simulate:
- ESP32 board
- LED
- simple GPIO behavior
- later, mock control logic

## LED Blink Example (Arduino-style)

```cpp
const int LED_PIN = 2;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(1000);
  digitalWrite(LED_PIN, LOW);
  delay(1000);
}
```

## Control Loop Simulator in Python

After LED blink works, simulate the control logic in Python.

### Simulated Parts

- tank
- valve state (open / closed)
- flow rate
- cup weight
- target weight
- stop condition

### Simplified Model

If valve is open:

`cup_weight += flow_rate * dt`

If cup weight reaches target:

`close valve`

## Example Python Logic

```python
target_weight = 150.0
cup_weight = 0.0
flow_rate = 20.0   # grams per second
dt = 0.1
valve_open = True

time_elapsed = 0.0

while valve_open:
    cup_weight += flow_rate * dt
    time_elapsed += dt

    if cup_weight >= target_weight:
        valve_open = False

print(f"Stopped at {cup_weight:.2f} g after {time_elapsed:.2f} s")
```

## Recommended Iteration Order

1. Blink LED in Wokwi
2. Create Python simulator for target weight and stop logic
3. Add realism: delay, noise, changing flow
4. Connect real ESP32, driver, valve, and scale

## Suggested Repo Structure

```text
AutoV60/
├── README.md
├── docs/
│   ├── problem_definition.md
│   ├── system_analyst_output.md
│   ├── components_and_instruments.md
│   └── simulation_setup.md
├── firmware/
│   └── esp32/
├── simulation/
│   ├── flow_simulator.py
│   └── experiments/
└── hardware/
```

## Current Recommendation

Use this minimal path:

1. Wokwi + LED blink
2. Python flow simulator
3. Real ESP32 board
4. Real valve and scale later

## Definition of Success for Simulation Phase

The simulation phase is successful when:
- the controller logic is understood
- the stop-at-target behavior is simulated
- the firmware loop is exercised in Wokwi
- the project is ready to move into real hardware wiring
