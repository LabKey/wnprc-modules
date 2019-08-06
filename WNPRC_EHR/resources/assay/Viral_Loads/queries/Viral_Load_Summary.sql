/*
 * Copyright (c) 2012 LabKey Corporation
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
  v.subjectid,
  v.date,
  v.category,
  v.assayId,
  avg(v.viralLoad) as viralLoad,
  count(*) as replicates,
  stddev(viralLoad) as stdDeviation,
  group_concat(distinct v.qcflag, ';') as qcflags,
  group_concat(distinct v.comment, ';') as comments,
  cast(min(v.well) as varchar) as lowestWell,~
  v.batched,
  v.run,
  v.folder

FROM Data v
GROUP BY v.run, v.subjectid, v.date, v.assayId, v.category, v.batched, v.folder