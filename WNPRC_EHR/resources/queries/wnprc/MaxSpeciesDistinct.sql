SELECT DISTINCT b.protocol_id,
                b.protocol_title,
                b.pi_name,
                b.date_approved,
                b.date_expiration,
                b.date_modified,
                a.sum_three_yr,
                b.usda_code,
                (SELECT contacts FROM ehr.protocol e WHERE lower(b.protocol_id) = lower(e.protocol)) AS contacts
FROM arrow_protocols b
         INNER JOIN (
    SELECT protocol_id,
           sum(max_three_year) AS sum_three_yr
    FROM arrow_protocols
    GROUP BY protocol_id
) a ON a.protocol_id = b.protocol_id
