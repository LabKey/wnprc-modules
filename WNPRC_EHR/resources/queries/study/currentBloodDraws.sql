/*
 * Copyright (c) 2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

SELECT
  t.id,
  t.date,
  cast(t.quantity as double) as quantity,
  t.species,
  t.max_draw_pct,
  t.blood_draw_interval,
  t.blood_per_kg,
  t.mostRecentWeight,
  t.mostRecentWeightDate,
  t.death,
  cast(t.allowableBlood as double) as maxAllowableBlood,
  cast(t.bloodPrevious as double) as bloodPrevious,
  cast((t.allowableBlood - t.bloodPrevious) as double) as allowablePrevious,

  cast(t.bloodFuture as double) as bloodFuture,
  cast((t.allowableBlood - t.bloodFuture) as double) as allowableFuture,

  --if the draw is historic, always consider previous draws only.
  --otherwise, look both forward and backwards, then take the interval with the highest volume
  cast(case
    WHEN t.date < curdate() THEN (t.allowableBlood - t.bloodPrevious)
    WHEN t.bloodPrevious < t.bloodFuture THEN (t.allowableBlood - t.bloodFuture)
    ELSE (t.allowableBlood - t.bloodPrevious)
  end  as double) as allowableBlood,
  t.minDate,
  t.maxDate

FROM (

SELECT
  bd.id,
  bd.dateOnly as date,
  bd.quantity,
  d.species,
  d.death,
  d.id.mostRecentWeight.MostRecentWeight,
  d.id.mostRecentWeight.MostRecentWeightDate,
  d.species.blood_per_kg,
  d.species.max_draw_pct,
  bd.blood_draw_interval,
(d.id.mostRecentWeight.MostRecentWeight * d.species.blood_per_kg * d.species.max_draw_pct)
  as allowableBlood,
  bd.minDate,
  bd.maxDate,
  COALESCE(
    (SELECT SUM(coalesce(draws.quantity, 0)) AS _expr
    FROM study."Blood Draws" draws
    WHERE draws.id = bd.id AND draws.project.research = true
      AND draws.dateOnly > bd.minDate
      AND draws.dateOnly <= bd.dateOnly
      --NOTE: this has been changed to include pending/non-approved draws
      AND draws.countsAgainstVolume = true
  ), 0) AS BloodPrevious,

  COALESCE(
    (SELECT SUM(coalesce(draws.quantity, 0)) AS _expr
    FROM study."Blood Draws" draws
    WHERE draws.id = bd.id AND draws.project.research = true
      AND draws.dateOnly < bd.maxDate
      AND draws.dateOnly >= bd.dateOnly
      --NOTE: this has been changed to include pending/non-approved draws
      AND draws.countsAgainstVolume = true
  ), 0) AS BloodFuture

FROM study.bloodDrawChanges bd
JOIN study.demographics d ON (d.id = bd.id)

) t