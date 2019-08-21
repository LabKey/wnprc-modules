-- noinspection SqlNoDataSourceInspectionForFile

SELECT
personid,
first_name,
middle_name,
last_name,
notes,
measlesResults.mid as mid,
to_char(measlesResults.mdate, 'MM/DD/YYYY') as mdate

FROM persons

LEFT JOIN (

  SELECT
  p_m_map.person_id,
  m.id as mid,
  CAST(m.date as DATE) as mdate

  FROM measles_clearances m

  LEFT JOIN persons_measles_clearances p_m_map
  ON (
    m.id = p_m_map.clearance_id
  )

) measlesResults

ON measlesResults.person_id = persons.personid
