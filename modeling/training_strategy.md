# Training Strategy for V60 Coffee Sensory Modeling

## 1. Purpose

This document explains three things:

1. what the **prerequisites** are for using AutoSearch on this coffee problem,
2. how **AutoSearch** helps in practice,
3. which **training strategies** are realistic for the first version.

The project goal is:

> predict sensory outcomes of a V60 brew — mainly **sweetness**, **bitterness**, and **balance** — from brew parameters and bean context.

This is a **supervised learning** problem on structured tabular data.

---

## 2. What “prerequisite” means here

A prerequisite is something that must already exist before AutoSearch can be useful.

For this project, the most important prerequisite is **not the model**. It is the **data + evaluation setup**.

Without those, AutoSearch will only automate random guessing.

In this context, a prerequisite means:

* the data has the right columns,
* the target labels are defined clearly,
* the split and metric are fixed,
* the agent is allowed to search only inside the modeling space.

So the order is:

1. define the dataset,
2. define the target labels,
3. define the evaluation harness,
4. then let AutoSearch search for better models.

---

## 3. Data prerequisites

### 3.1 Minimum unit of data

Each row must represent **one brewed cup**.

That row should contain:

* the recipe parameters used,
* the bean/context information,
* the sensory result for that brewed cup.

If one row mixes multiple brews, or one recipe without an actual tasting result, the data becomes weak.

### 3.2 Required input features

These are the minimum useful features.

#### A. Brew parameters (controllable variables)

* `coffee_dose_g`
* `water_g`
* `brew_ratio`
* `water_temp_c`
* `grind_setting`
* `bloom_time_s`
* `total_brew_time_s`
* `num_pours`

#### B. Context features (not directly controllable but important)

* `bean_id` or `bag_id`
* `roast_level`
* `roast_age_days`
* `process_method` (washed, natural, honey, anaerobic, etc.)
* `brew_date`

### 3.3 Strongly recommended features

These are not mandatory for a first prototype, but they matter if you want a model that survives reality:

* grinder model
* water mineral recipe / hardness
* filter type
* kettle / pouring style proxy
* ambient temperature / humidity if easy to capture

### 3.4 Required target labels

For now, keep the targets simple and numeric:

* `sweetness` from 0 to 10
* `bitterness` from 0 to 10
* `balance` from 0 to 10

Optional later:

* acidity
* clarity
* body
* aftertaste

### 3.5 Minimum data quality requirement

The labels must be scored with a **consistent tasting protocol**.

That means you define things like:

* when the coffee is tasted after brewing,
* whether the cup is stirred,
* whether one person or two people score it,
* what exactly a 3, 5, or 8 means on the sweetness scale.

If this is not fixed, the model learns rating noise, not coffee behavior.

### 3.6 Minimum data size

For a toy prototype:

* around **30 to 50 rows** can help test the pipeline.

For a model search process that is actually meaningful:

* around **100 to 300 rows** is a more realistic starting point.

Less than that is still useful for engineering the pipeline, but not for trusting the results.

### 3.7 Internet data vs real data

Internet recipes are useful for:

* testing the pipeline,
* creating the first structured dataset,
* experimenting with feature handling and model search.

Internet recipes are weak because:

* they often lack numeric sensory labels,
* they are inconsistent across authors,
* grind settings are not standardized,
* the same “sweet” word may mean different things.

So internet data is acceptable for **bootstrapping**, but not as the final truth.

---

## 4. Non-data prerequisites

Before AutoSearch runs, the following must exist:

### 4.1 A fixed evaluation harness

You need an `eval.py` or equivalent that:

* loads the dataset,
* applies the split,
* trains a candidate model,
* computes one scalar score.

Recommended score:

* mean MAE across sweetness, bitterness, and balance.

### 4.2 Honest train/test split

The split must reflect reality.

Recommended options:

* **group split by `bean_id`** if the main goal is to generalize to new beans,
* **time split by `brew_date`** if the main goal is to generalize into the future.

A pure random split is weak here and can give misleading results.

### 4.3 A baseline training file

You need one training file, for example `model_space.py`, that already works.

This is the file AutoSearch is allowed to edit.

It should:

* load the data,
* preprocess features,
* train a model,
* output the validation score.

### 4.4 Agent boundaries

AutoSearch must not be allowed to:

* edit the evaluation code,
* edit the held-out test split,
* change the dataset itself,
* redefine the target labels.

If you allow that, the agent may improve the score without improving the model.

---

## 5. How AutoSearch helps

AutoSearch is useful **after** the prerequisites are ready.

It helps by automating repeated model experiments.

### 5.1 What it can automate

AutoSearch can:

* try different model families,
* tune hyperparameters,
* test feature transforms,
* compare different preprocessing choices,
* log scores and code changes,
* keep improvements and discard weaker attempts.

### 5.2 What it cannot solve for you

AutoSearch does **not** solve:

* missing or low-quality labels,
* bad dataset design,
* data leakage,
* confounding caused by missing bean context,
* unrealistic evaluation.

In other words:

> AutoSearch can search the model space, but it cannot rescue a broken problem definition.

### 5.3 Why it is still valuable here

This coffee problem has a limited number of features and a small tabular dataset.
That is actually a good fit for AutoSearch because:

* the search space is finite,
* experiments are relatively cheap,
* multiple model families are plausible,
* there is no need for massive GPU training.

So AutoSearch is a good tool for:

* finding a solid baseline quickly,
* testing which feature groups matter,
* checking whether the signal is strong enough to justify further data collection.

---

## 6. Training strategy options

Below are three realistic strategies. These are not random ideas. They reflect three different assumptions about the problem.

### Strategy 1 — Interpretable baseline

#### Idea

Start simple and transparent.

#### Model family

* Ridge regression
* Elastic Net

#### Feature handling

* normalize numeric features,
* one-hot encode categorical variables,
* optionally add a few manual interaction terms such as:

  * ratio × temperature
  * grind × brew time

#### Why use it

This tells you whether there is a basic linear signal in the data.
It is easy to debug and easy to explain.

#### Strengths

* transparent,
* cheap to train,
* good sanity check,
* useful as a baseline AutoSearch must beat.

#### Weaknesses

* may miss non-linear relationships,
* may underfit strongly bean-dependent behavior.

#### When it wins

It wins when the dataset is still small and noisy, because simple models often survive noise better.

---

### Strategy 2 — Non-linear tree-based search

#### Idea

Assume the relationship between brew parameters and taste is non-linear.

#### Model family

* Random Forest
* Gradient Boosting
* XGBoost / LightGBM if available

#### Feature handling

* minimal scaling needed,
* categorical encoding still required depending on implementation,
* can capture thresholds and interactions automatically.

#### Why use it

This is usually the strongest practical choice for small-to-medium tabular datasets.

#### Strengths

* handles non-linearity well,
* often better than linear models on real-world tabular problems,
* robust first serious candidate.

#### Weaknesses

* less interpretable,
* can overfit if the dataset is too small,
* may learn bean identity too strongly if evaluation is weak.

#### When it wins

It often wins once you have enough rows and reasonably good context variables.

---

### Strategy 3 — Bean-aware prediction

#### Idea

Assume part of the taste comes from the brew recipe, and part comes from the bean itself.

#### Model family

* multi-output gradient boosting,
* separate models per target with bean/context features,
* or a hierarchical / grouped approach if later needed.

#### Feature handling

Must include:

* `bean_id` or grouped bean representation,
* roast age,
* process method,
* brew date if possible.

#### Why use it

This strategy reflects reality better. A recipe that is sweet on one bean may be sour on another.

#### Strengths

* closest to the real-world problem,
* better chance of separating bean effects from recipe effects,
* useful if future recommendation depends on bean identity.

#### Weaknesses

* needs more data,
* easier to overfit,
* evaluation must be very strict.

#### When it wins

It wins only when the dataset is rich enough and bean/context fields are reliable.

---

## 7. Recommended order of execution

This is the recommended sequence:

### Phase 1 — Build the pipeline

* create the dataset schema,
* build the loader,
* define labels,
* build `eval.py`,
* build one working `model_space.py`.

### Phase 2 — Establish baselines

* run Strategy 1 manually,
* run Strategy 2 manually,
* compare with the same evaluation split.

### Phase 3 — Use AutoSearch

* allow AutoSearch to improve only `model_space.py`,
* search within Strategies 1 to 3,
* keep run budget fixed,
* log dataset hash, score, and seed.

### Phase 4 — Validate honestly

* rerun the best candidate,
* test on untouched holdout data,
* inspect failure cases.

---

## 8. Final recommendation

For the current stage of the project, the best approach is:

1. use **internet data** to build the first structured dataset,
2. start with **Strategy 1 and Strategy 2**,
3. use **Strategy 3 only after bean/context data is strong enough**,
4. treat AutoSearch as a model-search engine, not as a replacement for data design.

The key point is simple:

> the real prerequisite is not “having AutoSearch.”
> the real prerequisite is having a dataset and evaluation setup that deserve search.

Once that exists, AutoSearch becomes useful and efficient.
