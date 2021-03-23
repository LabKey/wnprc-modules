/*
 * Copyright (c) 2017-2018 LabKey Corporation
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
SELECT si.AnimalId,
  si.Date,
  d.SampleId,
  d.Lab,
  d.Analyte,
  group_concat(d.Value) as assay_value
FROM wnprc_r24.Biomarkers d
  inner join wnprc_r24.SampleInventory as si on d.SampleId = si.SampleId
WHERE d.Analyte IS NOT NULL
GROUP BY si.AnimalId,
  d.SampleId,
  si.Date,
  d.Lab,
  d.Analyte
PIVOT assay_value BY Analyte