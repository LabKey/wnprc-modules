-- noinspection SqlNoDataSourceInspectionForFile

SELECT
personid,
first_name,
middle_name,
last_name,
notes,
measlesResults.mid as id,
measlesResults.mrequired as required,
to_char(measlesResults.mdate, 'MM/DD/YYYY') as date,
'measles_clearances' as table_name

FROM persons

LEFT JOIN (

  SELECT
  p_m_map.person_id,
  m.id as mid,
  m.required as mrequired,
  CAST(m.date as DATE) as mdate

  FROM measles_clearances m

  LEFT JOIN persons_measles_clearances p_m_map
  ON (
    m.id = p_m_map.clearance_id
  )

  ORDER BY mdate DESC

) measlesResults

ON measlesResults.person_id = persons.personid
