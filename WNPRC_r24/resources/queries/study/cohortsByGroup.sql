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
select animalId,
  Created as Date,
  case when currentColony = 'SNPRC' then
    case when sourceColony = 'SNPRC' then 'SNPRC' else 'S-NEPRC' end
  else     -- current colony = 'WNPRC'
      case when sourceColony = 'WNPRC' then 'WNPRC' else 'W-NEPRC' end
  end as sourceColony,
  sequenceNum as sequenceNumMin
from study.demographics
where status = 'alive'

union

select animalId,
  Created as Date,
  'Dead' as sourceColony,
  sequenceNum as sequenceNumMin
from study.demographics
where status <> 'alive'