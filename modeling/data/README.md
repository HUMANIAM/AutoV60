Purpose

This folder contains the first bootstrap datasets for the V60 pour-over sensory modeling project.

These files are meant for:

building the training pipeline,

testing feature engineering,

testing evaluation and AutoSearch,

creating a first predictive baseline.

They are not final ground-truth datasets.
They are built from structured internet sources and weak sensory labeling, so they are useful for bootstrapping, not for claiming strong real-world accuracy.

Files
1. v60_pourover_training_dataset.csv

This is the full bootstrap dataset.

It contains:

exact V60 rows,

near-V60 pour-over rows,

structured recipe data,

tasting-note-based rows,

weak sensory labels derived from source text.

Use this file when you want:

more rows,

broader experimentation,

to test data loading and model training,

to try feature engineering and AutoSearch.

2. v60_pourover_training_dataset_exact_v60_only.csv

This is the stricter dataset.

It contains only rows that are explicitly V60-focused.

Use this file when you want:

higher consistency,

less method noise,

a cleaner baseline,

a more controlled first experiment.

This is the better default file for the first serious baseline.

Important Warning

These datasets are partly measured and partly inferred.

That means:

brew parameters are mostly taken directly from recipe sources,

some bean/context fields are missing because many sources do not provide them,

sensory labels such as sweetness, bitterness, acidity, and balance are often weak labels derived from tasting text.

So this dataset is good for:

pipeline development,

model prototyping,

evaluation setup,

early AutoSearch experiments.

It is not enough for:

strong causal claims,

production-quality recipe recommendation,

reliable inverse modeling without real-world validation.

Dataset Design

Each row represents one brew recipe or one brew configuration collected from online sources.

The goal is to model the relationship:

brew parameters + bean/context -> sensory outcome

The dataset follows the idea that coffee flavor is affected by a limited set of interacting variables, mainly:

bean properties,

grind setting,

dose and water quantity,

brew ratio,

water temperature,

bloom,

pour structure,

total brew time,

agitation,

water properties.

Main Column Groups
A. Identification and source columns

These columns tell you where the row came from and how trustworthy it is.

Typical fields:

source_url

source_type

recipe_name

is_exact_v60

label_source

B. Brew parameter columns

These are the controllable brewing variables.

Typical fields:

coffee_g

water_g

ratio

temp_c

grind_text

grind_code

brew_time_s

num_pours

bloom_g

bloom_s

agitation_level

C. Bean and context columns

These describe the coffee and surrounding context when available.

Typical fields:

bean_origin

bean_process

bean_variety

roast_level

water_info

These fields may be partially missing because many web recipes do not describe the bean or water in enough detail.

D. Taste description columns

These preserve the original text used for weak labeling.

Typical fields:

explicit_taste_text

This field is important because it lets you inspect where the label came from instead of blindly trusting the number.

E. Weak label columns

These are approximate sensory scores derived from text.

Typical fields:

sweetness_score_weak

bitterness_score_weak

acidity_score_weak

sourness_risk_score_weak

balance_score_weak

These labels are useful for early modeling, but they are not equivalent to controlled human scoring.

Difference Between the Two Files
v60_pourover_training_dataset.csv

larger

broader

more diverse

more noise

better for engineering and experimentation

v60_pourover_training_dataset_exact_v60_only.csv

smaller

more method-consistent

less noise

better for the first clean baseline

Recommended Usage
First baseline

Start with:

v60_pourover_training_dataset_exact_v60_only.csv

Reason:

cleaner signal,

fewer method differences,

easier to debug.

Broader experimentation

Then move to:

v60_pourover_training_dataset.csv

Reason:

more rows,

better for testing robustness,

useful for exploring feature importance and model sensitivity.

Recommended Modeling Order
Step 1

Train a simple baseline model on the exact V60 only dataset.

Good first options:

Ridge regression

Elastic Net

Random Forest

Gradient Boosting

Step 2

Compare with the full dataset and see whether the extra rows help or hurt.

Step 3

Inspect failure cases manually:

does the model respond reasonably to grind, time, and temperature?

does it overfit to text-derived label artifacts?

does it collapse when rows have missing bean information?

Step 4

Replace or enrich this bootstrap data with real brew logs and human sensory scores.

That is the real path to a trustworthy model.

Known Limitations
1. Weak labels

Many sensory scores are inferred from text, not directly measured.

2. Missing bean metadata

Some sources do not provide:

roast date,

exact process,

variety,

water mineral composition,

grinder calibration.

3. Grind is not standardized

A grind description from one source is not directly comparable to another grinder’s setting.

4. Source inconsistency

Different authors use different brewing styles, language, and assumptions.

5. Limited size

This is a small bootstrap dataset, not a large research-grade dataset.

How To Treat These Files

Treat these files as:

bootstrap training data

engineering data

model search data

evaluation harness data

Do not treat them as:

final truth,

causal proof,

production-grade training data.

Best Next Upgrade

The best next step is to keep these files for bootstrapping and add a new dataset built from your own brews with:

fixed tasting protocol,

numeric sensory scores,

bean ID,

roast age,

water recipe,

grinder info,

repeated brews for the same recipe.

That will turn the project from “internet-trained prototype” into “real sensory modeling system”.

Suggested Folder Structure
modeling/
└── Data/
    ├── README.md
    ├── v60_pourover_training_dataset.csv
    └── v60_pourover_training_dataset_exact_v60_only.csv
Short Summary

use v60_pourover_training_dataset_exact_v60_only.csv for the first clean baseline,

use v60_pourover_training_dataset.csv for broader experimentation,

treat both as bootstrap datasets,

expect noise,

plan to replace or extend them with real measured data.