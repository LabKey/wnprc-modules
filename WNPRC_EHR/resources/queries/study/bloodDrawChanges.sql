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
--this query is designed to return any dates when allowable blood draw volume changes
--this includes dates of blood draws, plus the date those draws drop off
PARAMETERS(DATE_INTERVAL INTEGER)

SELECT
  b2.id,
  b2.dateOnly,
  b2.quantity,
  DATE_INTERVAL as blood_draw_interval,
  TIMESTAMPADD('SQL_TSI_DAY', (-1 * DATE_INTERVAL), b2.dateOnly) as minDate,
  TIMESTAMPADD('SQL_TSI_DAY', DATE_INTERVAL, b2.dateOnly) as maxDate,

FROM (
  SELECT
    b.id,
    b.dateOnly,
    sum(b.quantity) as quantity

  FROM (
    --find all blood draws within the interval, looking backwards
    SELECT
      b.id,
      b.dateOnly,
      b.quantity,
    FROM study.blood b
    WHERE b.dateOnly > timestampadd('SQL_TSI_DAY', -1 * DATE_INTERVAL, curdate()) AND b.project.research = TRUE

    UNION ALL

    --join 1 row for the current date
    SELECT
      d1.id,
      curdate() as dateOnly,
      0 as quantity,
    FROM study.demographics d1
    WHERE d1.calculated_status = 'Alive'

    UNION ALL

    --add one row for each date when the draw drops off the record
    SELECT
      b.id,
      timestampadd('SQL_TSI_DAY', DATE_INTERVAL, b.dateOnly),
      0 as quantity,
    FROM study.blood b
    WHERE timestampadd('SQL_TSI_DAY', DATE_INTERVAL, b.dateOnly) >= timestampadd('SQL_TSI_DAY', -1 * DATE_INTERVAL, curdate()) AND b.project.research = TRUE

  ) b

  GROUP BY b.id, b.dateOnly
) b2