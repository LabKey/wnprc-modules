SELECT x.*
FROM (SELECT
        b.dam  dam,
        b.date date,
        CASE
        WHEN b.conception IS NULL
          THEN timestampadd('SQL_TSI_DAY', -165, b.date)
        ELSE b.conception
        END    conception,
        'pg'   medical,
        b.sire sire
      FROM study.birth b
      UNION
      SELECT
        p.dam  dam,
        p.date date,
        CASE
        WHEN p.conception IS NULL
          THEN timestampadd('SQL_TSI_DAY', -165, p.date)
        ELSE p.conception
        END    conception,
        'pg'   medical,
        p.sire sire
      FROM study.prenatal p
      UNION
      SELECT
        d.id      dam,
        curdate() date,
        NULL      conception,
        d.medical medical,
        NULL      sire
      FROM study.demographics d
      WHERE lower(medical) LIKE '%pg%'
            AND calculated_status = 'Alive'
     ) x
WHERE x.dam IS NOT NULL
      AND x.dam <> 'unknown'