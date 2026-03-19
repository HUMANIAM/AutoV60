
## 1) Problem statement (what we’re trying to solve)
We want a model that helps us **predict** (and later optimize) the sensory outcome of a V60 brew — things like **sweetness, bitterness, balance** — from the brew setup and process parameters.

In plain terms:

> Given a brew recipe + context (dose, water, temperature, grind, time, agitation, water chemistry, bean metadata, etc.), predict what the cup will taste like.

This can support:
- **Prediction:** “If I brew this way, what sensory profile should I expect?”
- **Guidance:** “If I want sweeter / less bitter, which knobs are most promising?”
- **Experiment planning:** “What should I vary next to learn fastest?”

Important: we are modeling a **physical, human-rated process**, not a clean deterministic function.

---

## 2) Inputs, outputs, and scope

### Outputs (targets)
Typically numeric ratings per cup (0–10 scale, or similar):
- `sweetness`
- `bitterness`
- `balance`
Optionally later:
- `acidity`, `body`, `clarity`, `aftertaste`, `overall`

### Inputs (features)
Two categories:

**A) Brew parameters (controllable knobs)**
- dose (g), water (g), ratio
- water temperature (°C)
- grind setting (and ideally grinder model + burr type)
- bloom time, total brew time
- agitation (must be defined precisely, not “vibes”)
- filter type
- pour structure (pulse count, pour rate, total pours) — if you can measure it

**B) Context (non-controllable but crucial)**
- `bean_id` / `bag_id` (unique identifier per coffee bag)
- roast level + roast date (days off roast)
- process (washed/natural/honey/anaerobic etc.)
- origin/variety/altitude (if available)
- water hardness/mineral recipe (ppm, Ca/Mg/alkalinity ideally)
- brew date/time (for drift tracking)
- ambient conditions (humidity/temperature) if you can capture cheaply

### Scope boundaries (to avoid nonsense)
- First phase focuses on **predicting** sensory outcomes for recipes within the ranges we actually brew.
- “Recipe optimization” comes later, after evaluation proves generalization.

---

## 3) Why this problem is hard (reality-based risks)

### 3.1 Labels are noisy (sensory ratings are not stable)
- Same recipe can taste different due to cooling time, palate fatigue, mood, expectation.
- Multiple raters introduce scale differences (your “7” is my “5”).
- If the tasting protocol changes over time, the model learns protocol drift.

### 3.2 Confounding (the model learns wrong causes)
Real life is messy: you choose grind and temp *because* of the bean, not independently.
If bean identity isn’t captured, the model will attribute “sweetness” to grind when it’s actually bean chemistry.

### 3.3 Non-stationarity (the world changes)
- Beans age.
- Grinder calibration drifts, burrs wear.
- Water changes.
- Technique changes.
A model that looked good last month can quietly rot.

### 3.4 Data coverage is usually narrow
Most home brews cluster around a “comfort zone” (e.g., 18g/300g, 93–95°C).
Models can’t reliably extrapolate outside the space they’ve seen.

### 3.5 Evaluation can lie (leakage and duplicates)
If you random-split rows and the same bean/recipe appears in both train and test, metrics can look great while real-world performance fails on:
- new beans
- future weeks
- different grinder/water

---

## 4) What “good” looks like (success criteria)
Success is not “high score on a random split”.
Success is:

1) **Generalization to the scenario you actually care about**, e.g.:
   - new beans (`group split by bean_id`)
   - future time period (`time split by brew_date`)
2) **Stable improvements**, not random noise:
   - improvements should persist across seeds and across folds
3) **Actionability**:
   - model outputs should be usable for decisions (even if imperfect)
   - ideally include uncertainty / confidence

---

## 5) Available solution approaches (what we can do)
Think in layers: start simple, scale complexity only if it helps.

### 5.1 Baseline heuristics (no ML)
- Rule-of-thumb guidance: ratio, temperature, grind, time.
- Useful as sanity check and to detect when ML is hallucinating.

### 5.2 Supervised regression (practical starting point)
Predict targets from features with:
- Linear / Elastic Net (strong baseline, interpretable)
- Tree ensembles (RandomForest, Gradient Boosting)
- Multi-output vs separate models per target

This is often the best “first real” solution.

### 5.3 Mixed effects / hierarchical thinking (if you have enough data)
Treat `bean_id` as a grouping variable:
- helps separate “bean baseline taste” from “recipe effects”
- improves generalization if designed well

### 5.4 Recommendation / optimization (later, after trust)
Use the trained predictor + constraints to search recipes that maximize sweetness and minimize bitterness, *but only within safe, observed ranges*.
Without strong evaluation, this becomes nonsense quickly.

---

## 6) What to pay attention to during research + experimentation + training

### 6.1 Data collection discipline (most important)
You need a consistent protocol:
- When are you tasting? (e.g., 5–10 min after brew, and again at 20 min)
- Do you stir? How many times?
- Same cup type? Same rinse routine?
- Same scoring rubric definitions?

Minimum metadata to capture from day 1:
- `bean_id`, roast date (or days off roast)
- water recipe/hardness
- grinder model + burr info (if changed)
- brew date

### 6.2 Experimental design (avoid purely observational data)
If all your brews are “what you felt like doing”, the dataset is highly confounded.
Better:
- do small controlled sweeps (change one variable while holding others fixed)
- repeat the same recipe occasionally to measure label noise

### 6.3 Evaluation harness must be locked and honest
Define splits that match reality:

- **Goal A: generalize to new beans**
  - Use grouped split by `bean_id` (GroupKFold or GroupShuffleSplit)

- **Goal B: generalize into the future**
  - Use time-based split by `brew_date` (train on past → test on future)

Keep a final holdout set untouched until the end.

### 6.4 Metrics that reflect what you care about
Start with:
- MAE for each target (sweetness/bitterness/balance)
Also track:
- per-bean performance variability
- stability across folds

A model with slightly worse average MAE but far better stability across beans may be more useful.

### 6.5 Guardrails against “agent over-optimization”
If using autosearch/autoresearch-style automation:
- the agent must not edit the evaluation code
- must not touch the test split
- must run under fixed budget
- must log dataset hash + seed + score each run

Otherwise it will “win” by cheating (even accidentally).

### 6.6 Interpretability and sanity checks
Always check:
- do predictions move in plausible directions?
- are feature importances dominated by “brew_time” (which can be a circular proxy)?
- does the model collapse when given a new bean?

---

## 7) How autosearch fits (what it automates, what it doesn’t)
Autosearch can automate:
- trying many model variants (algorithms + hyperparams)
- trying feature transforms and interactions
- running train/eval repeatedly and keeping improvements
- logging results and diffs

The ML engineer must own:
- dataset quality and labeling protocol
- leakage-proof evaluation harness
- defining objective metric
- defining the allowed edit surface and guardrails
- interpreting results and deciding what is “real improvement”

---

## 8) Initial execution plan (minimum viable, research-friendly)

### Phase 1 — Benchmark + Baseline
1) Freeze schema and tasting protocol.
2) Build `eval.py`:
   - grouped-by-bean split OR time split (choose one primary goal)
   - output a single scalar score (e.g., mean MAE across targets)
3) Train baseline models:
   - Elastic Net
   - RandomForest / Gradient Boosting
4) Record baseline metrics and failure cases.

### Phase 2 — Controlled data expansion
1) Add planned sweeps (1 variable at a time).
2) Add repeats to measure label noise.
3) Add missing context fields (bean_id, roast age, water).

### Phase 3 — Autosearch loop
1) Lock harness; allow edits only in `model_space.py`.
2) Run short autosearch (10–20 runs) to validate honesty.
3) Overnight run.
4) Validate best candidate on untouched holdout.

---

## 9) Non-negotiables (if you want real-world usefulness)
- Capture `bean_id` and `brew_date` from day one.
- Use grouped/time splits; random split alone is misleading.
- Don’t trust improvements that don’t survive reruns and holdout tests.
- Treat “modeling” as secondary; data + evaluation are the core.
