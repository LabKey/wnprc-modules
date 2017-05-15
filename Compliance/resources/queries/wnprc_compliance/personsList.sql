SELECT
persons.personid,
first_name,
middle_name,
last_name,
notes,
tbResults.lastClearance as lastTbClearance,
measlesResults.lastClearance as measlesClearance,
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
  MAX(m.date) as lastClearance

  FROM measles_clearances m

  LEFT JOIN persons_measles_clearances p_m_map
  ON (
    m.id = p_m_map.clearance_id
  )

  GROUP BY (p_m_map.person_id)
) measlesResults

ON measlesResults.person_id = persons.personid



;