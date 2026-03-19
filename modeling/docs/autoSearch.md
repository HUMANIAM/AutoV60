# autoSearch.md

## What is “autosearch” (Karpathy’s *autoresearch* pattern)?
Autosearch is an **automated experiment loop** where an AI agent repeatedly:

1) edits a **small, allowed surface** of modeling code (usually one file)
2) runs training/evaluation under a **fixed budget** (often fixed wall-clock time)
3) reads a **single objective metric**
4) **keeps** the change if the metric improves, otherwise **reverts**
5) logs the experiment and repeats

Karpathy’s *autoresearch* repo popularized this by making the system intentionally minimal: a fixed evaluation harness, a single editable training file, and an instruction file that tells the agent how to operate. Each run uses a fixed training budget (e.g., 5 minutes) and optimizes a single metric (in the repo it’s `val_bpb`, lower is better). :contentReference[oaicite:0]{index=0}

---

## Why it’s useful in general (beyond coffee / AutoV60)
Autosearch is valuable when progress comes from **lots of small hypotheses** and the bottleneck is “human-in-the-loop iteration”.

It can:
- Explore many model families + hyperparameters quickly (not just a grid; it can change code).
- Automate feature engineering experiments (new derived features, interactions, transforms).
- Compare split strategies and regularization choices (if the harness allows it).
- Provide a **disciplined audit trail**: what changed, what score happened, what was kept.

Where it shines:
- Small/medium datasets, fast training runs, frequent iteration.
- Problems where you can define a **reliable metric** and a stable benchmark harness.

Where it fails:
- If your metric is leaky or unstable, the agent optimizes nonsense faster.
- If data quality is poor, it will “improve” by fitting quirks, not reality.

---

## Specifically: how autosearch helps AutoV60 modeling
AutoV60 is a physical process → taste targets (sweetness/bitterness/balance or similar). The modeling problem is less “choose a fancy model” and more:

- turning messy inputs into meaningful signals (ratio, temperature profile, flow/pressure proxies)
- dealing with non-stationarity (beans aging, grinder drift, humidity, technique changes)
- evaluating honestly (avoid leakage via duplicates or correlated runs)

Autosearch can help AutoV60 by repeatedly testing **modeling hypotheses** while keeping the evaluation protocol fixed.

Concrete examples it can automate:
1) **Feature engineering**
   - Add derived features: `ratio = water_g/dose_g`, `extraction_proxy`, interactions like `temp*time`, etc.
   - Try monotonic transforms (log, clipping) for unstable variables.

2) **Model selection**
   - Baselines: linear/elastic net → tree ensembles → boosted trees → simple neural nets.
   - Multi-output vs separate models per target.

3) **Regularization and robustness**
   - Stronger regularization when data is small/noisy.
   - Robust loss functions (Huber) for noisy human ratings.

4) **Validation discipline**
   - Try different *allowed* split modes (e.g., grouped by bean or by time buckets) and compare stability.

Important constraint:
- The agent must NOT be allowed to “improve” by changing the benchmark definition in a way that leaks information or makes evaluation easier.

---

## What autosearch can automate vs what the ML engineer must own

### Autosearch can automate (safe, repeatable)
- Running experiments end-to-end (train → evaluate → log).
- Proposing changes in the allowed code surface:
  - model type, hyperparameters
  - feature transformations
  - training configuration within a fixed compute budget
- Keeping/reverting changes based on the metric.
- Producing a ranked history of what worked.

### The ML engineer must handle (cannot be delegated)
1) **Data + labeling protocol**
   - Define tasting protocol and ensure rating consistency (same conditions, calibration, rater drift control).
   - Decide what metadata must be captured (bean ID, roast date, grinder, water chemistry, ambient conditions).
   - Clean data and define outlier rules.

2) **Evaluation harness (the “truth machine”)**
   - Choose the split strategy that matches reality:
     - group by `bean_id` (generalize across beans)
     - time-based split (future generalization)
   - Prevent leakage (duplicate recipes, repeated sessions).
   - Lock the metric definition and keep it stable.
   - Decide acceptable tradeoffs: accuracy vs stability vs inference simplicity.

3) **Guardrails / search boundaries**
   - Define exactly what file(s) the agent may edit.
   - Enforce fixed compute budget and deterministic seeding policy.
   - Add “sanity checks” that fail fast (no NaNs, no changing target columns, no using test set for tuning).

4) **Interpretation and deployment**
   - Check if improvements are meaningful (not just +0.01 metric noise).
   - Validate on a true holdout set that the agent never touched.
   - Decide how the model will be used: prediction, recommendation, uncertainty, constraints.

---

## Concrete plan to start using autosearch in AutoV60 (minimal + safe)

### Step 0 — Define the benchmark contract (ML engineer)
- Freeze a dataset schema:
  - Inputs: brew params + stable metadata (at least `bean_id`, `brew_date`)
  - Targets: the sensory labels you care about
- Choose an evaluation split that matches your goal:
  - If goal is “works on new beans”: Group split by `bean_id`
  - If goal is “works next month”: time split by `brew_date`
- Define a single score:
  - Example: average MAE across targets, averaged across folds (lower is better)
  - Optional: add a stability term (penalize high fold variance)

Deliverable: `eval.py` that returns one scalar `score`.

### Step 1 — Lock the harness, open only a small search surface
Repo structure suggestion:

- `data/coffee.csv`                  (frozen during search)
- `eval.py`                          (frozen)
- `train_and_eval.py`                (frozen runner; prints `score: X`)
- `model_space.py`                   (ONLY file the agent can edit)
- `results.tsv` or `results.jsonl`   (append-only log)

Rule: the agent may only modify `model_space.py`.

### Step 2 — Add “anti-cheat” checks (ML engineer)
In `train_and_eval.py` (frozen), enforce:
- split method is fixed (or from a small allowed enum)
- test set is never used for selection (keep a final holdout untouched)
- metric and fold count fixed
- runtime budget fixed (e.g., cap epochs or wall time)
- reproducibility: seed control + log seed + dataset hash

### Step 3 — Write the agent operating manual (program.md style)
The instructions should say:
- what the objective is (minimize `score`)
- what file it can change (`model_space.py`)
- how to run an experiment (`python train_and_eval.py`)
- where to read the metric from stdout
- when to keep vs revert
- how to log each run (diff summary + score + notes)

### Step 4 — Run a short “shakeout” search (10–20 runs)
Goal: verify the loop is honest.
- Do improvements survive reruns with different seeds?
- Are there suspicious jumps (usually leakage)?
- Do changes make sense physically?

### Step 5 — Graduate to overnight runs + a true final evaluation
- Keep a final holdout set that autosearch never touches.
- After an overnight run, pick the best candidate and evaluate once on holdout.
- If it fails, the harness is lying or the model is overfitting to the search benchmark.

---

## Bottom line
Autosearch can be your tireless experiment robot, but only if the ML engineer first builds:
- stable data + labels
- a leakage-proof evaluation harness
- narrow, reviewable edit boundaries

Once those are in place, autosearch is a force multiplier for AutoV60 modeling.
