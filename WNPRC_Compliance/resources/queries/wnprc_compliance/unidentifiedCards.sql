SELECT
cards.card_id,
last_name,
first_name,
middle_name,
department,
employee_number,
info2,
info3,
info5

FROM (
  SELECT
  card_id,
  MAX(date) as date

  FROM (
    SELECT
    unknown_cards.card_id,
    card_info.report_id,
    card_info.report_id.date

    FROM (
      SELECT
      cards.card_id,
      persons_to_cards.personid

      FROM (
        SELECT card_id
        FROM wnprc_compliance.cards
        WHERE exempt IS FALSE
      ) cards

      LEFT JOIN persons_to_cards
      ON (
        persons_to_cards.cardid = cards.card_id
      )
    ) unknown_cards, card_info
    WHERE (
      personid IS NULL
      AND
      card_info.card_id = unknown_cards.card_id
    )
  )
  GROUP BY (card_id)
) as cards, card_info
WHERE (
  cards.card_id = card_info.card_id
  AND
  cards.date = card_info.report_id.date
)
;