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