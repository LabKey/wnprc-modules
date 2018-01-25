SELECT
pending_with_personid.*,
persons.first_name,
persons.middle_name,
persons.last_name,

FROM (
  SELECT
  pending.*,
  person_lookup.person_id

  FROM (
    SELECT
    id,
    date,
    comment

    FROM wnprc_compliance.pending_tb_clearances p
    WHERE NOT (
      p.tbclearance_id IS NOT NULL
      OR
      p.archived IS TRUE
    )
  ) pending

  LEFT JOIN wnprc_compliance.persons_pending_tb_clearances person_lookup
  ON (
    person_lookup.clearance_id = pending.id
  )
) pending_with_personid

LEFT JOIN wnprc_compliance.persons persons
ON (
  pending_with_personid.person_id = persons.personid
)

