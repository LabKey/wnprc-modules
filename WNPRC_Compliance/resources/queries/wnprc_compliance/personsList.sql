SELECT
DISTINCT(persons.personid),
last_name,
first_name,
middle_name,
date_of_birth,
cardInfo.employee_number,
notes,
tbResults.lastClearance as lastTbClearance,
measlesResults.lastClearance as measlesClearance,
measlesResults.mrequired as measlesRequired,
archived_for_access_purposes as isArchived

FROM persons

LEFT JOIN (

  SELECT
  p_tb_map.person_id,
  MAX(tb.date) as lastClearance

  FROM tb_clearances tb

  LEFT JOIN persons_tb_clearances p_tb_map
  ON (
    tb.id = p_tb_map.clearance_id
  )

  GROUP BY (p_tb_map.person_id)
) tbResults

ON tbResults.person_id = persons.personid


LEFT JOIN (

  SELECT
  p_m_map.person_id,
  m.required as mrequired,
  MAX(m.date) as lastClearance

  FROM measles_clearances m

  LEFT JOIN persons_measles_clearances p_m_map
  ON (
    m.id = p_m_map.clearance_id
  )

  GROUP BY p_m_map.person_id, m.required
) measlesResults

ON measlesResults.person_id = persons.personid;

--Adding employee_number from card_info table. Need to select the latest uploaded record to the card_info table
--Use person_to_cards table to link the personid to the card_id.
LEFT JOIN wnprc_compliance.persons_to_cards pers_to_card ON (persons.personid = pers_to_card.personid)
LEFT JOIN
    (
        SELECT card_info.employee_number, card_info.card_id, MAX(card_info.created)
        FROM wnprc_compliance.card_info
        GROUP BY card_info.card_id, card_info.employee_number
    ) cardInfo
ON (pers_to_card.cardid = cardInfo.card_id)

ORDER BY last_name ASC

