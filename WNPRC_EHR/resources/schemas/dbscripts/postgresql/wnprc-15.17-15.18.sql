/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
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
insert into ehr_lookups.species (common, scientific_name, id_prefix, mhc_prefix, blood_per_kg, max_draw_pct, blood_draw_interval, container)
    SELECT common, scientific_name, id_prefix, mhc_prefix, blood_per_kg, max_draw_pct, blood_draw_interval, container FROM
    (SELECT
       'Macaque' AS common,
       '' AS scientific_name,
       '' as id_prefix,
       '' as mhc_prefix,
       60.0 AS blood_per_kg,
       0.2 as max_draw_pct,
       30.0 as blood_draw_interval,
      MAX(Container) as container FROM ehr_lookups.species)
  x WHERE container IS NOT NULL;