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
select w.id as AnimalId,
       d.participantid.primateId.primateId AS primateId,
       w.date,
       w.weight,
       w.objectid,
       w.modified
from study.weight as w
INNER JOIN study.demographics as d on w.id = d.id and d.species.id_prefix = 'cj'
WHERE NOT (d.participantid.primateId.primateId IS NULL OR w.weight IS NULL)