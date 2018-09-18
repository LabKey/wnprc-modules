SELECT
id,
display,
LCASE(display) as displayLcase,
notes,
"type"

FROM (
  SELECT
  CAST(userid as VARCHAR) as id,
  COALESCE(
    firstName || ' ' || lastName || ' (' || displayName || ')',
    displayName,
    CAST(userid as VARCHAR)
  ) as display,
  '' as notes,
  'LABKEY USER' as type,

  FROM core.users

  UNION

  SELECT
  card_id as id,
  COALESCE(first_name, '') || ' ' || COALESCE(middle_name, '') || ' ' || COALESCE(last_name, '') || ' (' || card_id || ')' as display,
  COALESCE(department || ';', '') || COALESCE(info2 || ';', '') || COALESCE(info3 || ';', '') as notes,
  'UW CARD' as type

  FROM wnprc_compliance.mostRecentCardInfo


  UNION


  SELECT
  personid as id,
  COALESCE(first_name, '') || ' ' || COALESCE(middle_name, '') || ' ' || COALESCE(last_name, '') as display,
  notes,
  'PERSONS' as type

  FROM wnprc_compliance.persons
)