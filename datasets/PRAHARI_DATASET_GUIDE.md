# PRAHARI Master Dataset — real Indian corridors

**Files:** `PRAHARI_MASTER_DATASET.csv` (104,400 rows × 99 columns) and `PRAHARI_MASTER_DATASET.xlsx` (identical data).
Everything superseded sits in `_DELETE_THIS_FOLDER/` and is safe to delete.

---

## Can you build the whole SIH prototype on this?

**For the data layer, yes — this one file covers it.** Being precise about what that means, so nothing surprises you mid-build:

| What your prototype needs | Covered? | How |
|---|---|---|
| Train the Green/Amber/Red risk model | **Yes** | 28 features + `risk_band` + `ml_split` |
| Draw corridors on a map | **Yes** | 1,044 real GPS points, ordered by `corridor_point_seq` |
| Pin hospitals / police / fire on the map | **Yes** | 110 real facilities with their own lat/lon |
| "Nearest help" + dispatch ETA screen | **Yes** | facility name, distance, coordinates, `f24` ETA |
| Offline zone packs | **Yes** | static per-point columns; group by corridor + point |
| Crowd / seasonality views | **Yes** | `f07`, `f08`, festival and season columns |
| Zone-closed state | **Yes** | `zone_open`, `in_operating_season` |
| Live weather, live GPS, panic button, login | **No — and no dataset can** | these come from your app at runtime |

The last row is the honest boundary. This gives you every *stored* input the prototype needs; the *live* inputs (a weather API call, the phone's GPS, a user pressing SOS) are things your app supplies while running. Six features (`f07`, `f14`, `f15`, `f16`, `f18`, `f28`) are simulated here precisely because they're live channels that only exist once the app is deployed — at runtime you swap in the real values.

---

## Proven, not claimed — I trained the model on it

| Test | Result |
|---|---|
| Random 80/20 split | **98.5%** accuracy, macro-F1 0.985 (majority baseline 44.5%) |
| Temporal split (train past → predict future) | **96.2%** accuracy, macro-F1 0.963 |
| Single-row inference, CPU only | **1.9 ms** (your budget: <50 ms) |
| Features the model learned nothing from | **0 of 28** |
| Nulls across the 28 features | **0** |
| Duplicate rows / IDs | **0 / 0** |

---

## The seven corridors

| Corridor | State / District | Points | Length | Elevation | Red/Amber/Green % |
|---|---|---|---|---|---|
| Gaurikund → Kedarnath | Uttarakhand / Rudraprayag | 142 | 15.0 km | 1,745–3,542 m | 63 / 37 / 0 |
| Sela Pass → Tawang | Arunachal / Tawang | 153 | 29.7 km | 1,855–4,218 m | 66 / 34 / 0 |
| Gangtok → Nathu La | Sikkim / East Sikkim | 141 | 26.7 km | 1,509–4,353 m | 31 / 56 / 12 |
| Kullu → Manali | Himachal / Kullu | 175 | 35.4 km | 1,190–1,901 m | 2 / 59 / 39 |
| Munnar → Top Station | Kerala / Idukki | 108 | 23.8 km | 1,459–1,963 m | 8 / 58 / 33 |
| Puri → Konark | Odisha / Puri | 159 | 30.7 km | 6–15 m | 6 / 41 / 52 |
| Calangute → Margao | Goa / North Goa | 166 | 39.6 km | 6–87 m | 2 / 33 / 65 |

Overall: **Red 25.1% / Amber 45.0% / Green 30.0%.**

---

## How to train

Use the **28 `f01…f28` columns only**, and the shipped `ml_split` (temporal 70/15/15, so no future leaks backwards).

```python
import pandas as pd, lightgbm as lgb
df  = pd.read_csv("PRAHARI_MASTER_DATASET.csv", low_memory=False)
F   = [c for c in df.columns if c[:1]=="f" and c[1:3].isdigit() and "_tier" not in c]  # exactly 28
CAT = ["f11_day_of_week","f12_time_of_day_bucket","f18_tourist_permit_status","f26_season"]
tr  = df[df.ml_split=="train"]
X = tr[F].copy()
for c in CAT: X[c] = X[c].astype("category")
y = tr.risk_band.map({"Green":0,"Amber":1,"Red":2})
m = lgb.train(dict(objective="multiclass", num_class=3, learning_rate=0.08,
                   num_leaves=63, verbose=-1),
              lgb.Dataset(X, y, categorical_feature=CAT), num_boost_round=300)
```

**You cannot leak the label by accident.** The intermediate score columns `risk_band` was computed from are deliberately *not in this file* — that footgun is removed, not documented around.

Two useful one-liners for the app:

```python
# map polyline for a corridor
route = df[df.corridor_id=="UK_RUDRAPRAYAG_KEDARNATH"] \
          [["corridor_point_seq","latitude","longitude","elevation_m"]].drop_duplicates().sort_values("corridor_point_seq")

# every real facility, with coordinates, for map pins
pins = df[["nearest_medical_facility","nearest_medical_lat","nearest_medical_lon"]].dropna().drop_duplicates()
```

---

## What is real, and what is not

**Real** — from your own source files or verified online:

- **Terrain** — every lat/lon/elevation/slope from a least-cost path over the real SRTM-derived pan-India DEM (`india_dem.tif`). Cross-check: Nathu La 4,353 m (published 4,310), Sela Pass 4,218 m (~4,170), Kedarnath 15.0 km rising to 3,542 m (published ~16 km to 3,583).
- **Facilities** — real OpenStreetMap/Geofabrik points from `bharatpoi.csv` (509,139 national rows): 1,748 hospitals/clinics, 152 police stations, 31 fire stations across the seven regions, of which 110 appear as a nearest facility with coordinates.
- **Rainfall** — real IMD district monthly normals + real 1901–2015 subdivision variance.
- **Crime** — real NCRB district counts (2009–2013 avg) over **individually verified Census 2011 populations**: Tawang 6.0, Kedarnath 8.4, Sikkim 8.8, Goa 12.8, Puri 15.1, Kullu 18.8, Idukki 40.1 per 100k.
- **Calendar, permits, protected areas, seasons** — real documented facts (Inner Line Permit for Tawang, Protected Area Permit for Nathu La, Kedarnath yatra ~May–Nov).
- **Kedarnath seasonal medical posts** — real and source-cited (Bheembali ~7 km, Lincholi ~11 km, base-camp 10-bed hospital; Gaurikund and temple security posts). No published coordinates exist, so each sits at the corridor point nearest its reported trail km-mark.

**Simulated** (each tagged tier 3): `f07` crowd density, `f14` recent incidents, `f15` crowd hazard reports, `f16` data freshness, `f18` permit status, `f28` AQI — live channels that don't exist before deployment.

Per-feature provenance is in the 28 `f01_tier … f28_tier` columns: **1 = real measured/official, 2 = derived from real, 3 = simulated**.

---

## Honest limitations

1. **The label is a designed composite, not observed accidents.** No public dataset records "an incident happened at this GPS point at this hour". The model learns a transparent risk logic — hazard 32%, security 20%, crowding 16%, medical response 12%, terrain 8%, darkness 6%, connectivity 6%, plus an absolute-hazard override. State this plainly if a judge asks; it's the defensible position for a prototype.
2. **Leave-one-corridor-out is a hard test and one case fails.** Kullu 91%, Puri 84%, Goa 83%, Tawang 79%, Kedarnath 71%, Sikkim 70% — but **Idukki 38%, worse than guessing**. Idukki's real crime rate (40.1/100k) is 2–7× every other corridor, so with it held out the model has never seen that range. Irrelevant to normal use (all seven corridors in training); only matters if you claim "works on an unseen corridor".
3. **Facility coverage reflects real OSM sparsity.** Tawang has 3 healthcare and 1 police point in the whole region, so nearest-police reaches 99 km there. Real map coverage, not a bug.
4. **The DEM path is a least-cost route, not surveyed road geometry.** Endpoints match published elevations closely; mid-route alignment is approximate.
5. **Mountain corridors skew Red by design** (Kedarnath 63%, Tawang 66%) — remote, steep, slow rescue. Real, but corridor identity carries predictive weight; use `class_weight` if you want the minority bands worked harder.
6. **Temporal sampling is every 15 days** (25 dates × 4 times of day). Enough for seasonality; not a continuous time series.

---

## Defects found by testing and fixed

Each was caught by checking, not assumed:

| Defect | Fix |
|---|---|
| District "EAST" matched **Delhi East as well as Sikkim East**, inflating Sikkim's crime figure from 24.8 to 448 — an **18× error** | Filter on state *and* district |
| Sampling every 7 days landed on the same weekday forever, making `f11_day_of_week` a **constant column** | 15-day step + assertion that all 7 weekdays appear |
| `f12_time_of_day_bucket` never produced "evening" | Sample hours changed to 08/13/18/22 |
| `f06` used a **999 sentinel** a model reads as a real number | Replaced with days elapsed since window start |
| Response score `1-exp(-t/60)` **saturates above ~180 min**, pinning 75% of Kedarnath rows at one value | Capped-linear ramp to a 4-hour cap |
| Flat 28 °C base meant **heat hazard never fired anywhere** | Monthly seasonal shape + real 6.5 °C/km lapse rate |
| Treating closure as maximum risk made Kedarnath **97% Red** | Closure is an operational state, not a risk level |
| Permanent-OSM-only facilities overstated Kedarnath remoteness (median 225-min ETA) | Added the real, source-cited in-season trail posts (92% → 63% Red) |
| A facility's distance and name could come from **different records** | Both always read from the same record, with an assertion |
| Facilities had names and distances but **no coordinates**, so no map pins | Added `nearest_*_lat` / `nearest_*_lon`; verified against the distances |

Two assertions fail the build rather than shipping silently: no feature column may be constant, and the weekday grid must cover all seven days.
