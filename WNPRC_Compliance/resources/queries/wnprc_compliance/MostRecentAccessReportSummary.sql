SELECT
ar.date as report_date,

card_info.card_id,
cards.exempt,
cards.exempt_reason,
personsList.lastTbClearance,
personsList.measlesClearance,
personsList.isArchived,

card_info.first_name,
card_info.last_name,
card_info.middle_name,
card_info.department,
card_info.employee_number,
card_info.info2,
card_info.info3,
card_info.info5,

access_info.areas,

persons_to_cards.personid

FROM (
  SELECT
  report_id,
  card_id,
  GROUP_CONCAT(display_area, ';') as areas


  FROM (
    SELECT
    reports.report_id,
    report_data.card_id,
    report_data.enabled,
    report_data.area,
    CASE
      WHEN report_data.enabled IS FALSE THEN CAST(COALESCE(report_data.area, '') || ' (disabled)' as VARCHAR)
      ELSE report_data.area
    END as display_area


    FROM  wnprc_compliance.access_reports reports, wnprc_compliance.access_report_data report_data
    WHERE (
      reports.date = (SELECT MAX(date) FROM wnprc_compliance.access_reports)
      AND (
        report_data.report_id = reports.report_id
      )
    )
  )

  GROUP BY report_id, card_id
) as access_info

LEFT JOIN wnprc_compliance.card_info card_info
on (
  access_info.card_id = card_info.card_id
  AND
  access_info.report_id = card_info.report_id
)

LEFT JOIN wnprc_compliance.cards cards
ON (
  cards.card_id = access_info.card_id
)

LEFT JOIN wnprc_compliance.persons_to_cards persons_to_cards
ON (
  persons_to_cards.cardid = access_info.card_id
)

LEFT JOIN wnprc_compliance.personsList personsList
ON (
  personsList.personid = persons_to_cards.personid
)

LEFT JOIN wnprc_compliance.access_reports ar
ON (
  ar.report_id = access_info.report_id
)