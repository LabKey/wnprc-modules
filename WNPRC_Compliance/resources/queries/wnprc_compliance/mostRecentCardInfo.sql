/*
 * Copyright (c) 2017-2026 Board of Regents of the University of Wisconsin System
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
/*
 * This query is essentially the same as the card_info table, but de-duplicates
 * the list to only show the card_info for the most recent report that includes
 * that card.
 */

SELECT info.*

-- Grab the most recent id
FROM (

  SELECT mostRecentReportDates.card_id, reports.report_id
  FROM (
    -- Select the most recent report date
    SELECT info.card_id as card_id, max(reports.date) as mostRecentDate
    FROM wnprc_compliance.card_info info, wnprc_compliance.access_reports reports
    WHERE reports.report_id = info.report_id
    GROUP BY card_id
  ) as mostRecentReportDates, wnprc_compliance.access_reports reports
  WHERE (reports.date = mostRecentDate)

) mostRecentIds

-- Left join with the actual data
LEFT JOIN wnprc_compliance.card_info info
ON (
  (mostRecentIds.card_id = info.card_id)
  AND
  (mostRecentIds.report_id = info.report_id)
)