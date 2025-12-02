SELECT
    ar.date as report_date,
    card_info.card_id,
    cards.exempt,
    cards.exempt_reason,
    personsList.lastTbClearance,
    personsList.measles_required,
    personsList.isArchived,
    card_info.first_name,
    card_info.last_name,
    card_info.middle_name,
    persons_to_cards.personid
FROM wnprc_compliance.access_reports ar
         INNER JOIN wnprc_compliance.card_info card_info
                    ON ar.report_id = card_info.report_id
         LEFT JOIN wnprc_compliance.cards cards
                   ON cards.card_id = card_info.card_id
         LEFT JOIN wnprc_compliance.persons_to_cards persons_to_cards
                   ON persons_to_cards.cardid = card_info.card_id
         LEFT JOIN wnprc_compliance.personsList personsList
                   ON personsList.personid = persons_to_cards.personid
WHERE ar.date = (SELECT MAX(date) FROM wnprc_compliance.access_reports)
