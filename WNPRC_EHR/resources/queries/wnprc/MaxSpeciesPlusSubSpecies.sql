SELECT rowid,
       arrow_common_name AS species,
       protocol_id       AS protocol,
       max_three_year    AS allowed,
       date_modified,
       date_expiration
FROM (
         (
             SELECT rowid, arrow_common_name, protocol_id, max_three_year, date_modified, date_expiration
             FROM arrow_protocols

             UNION ALL

             SELECT rowid, 'Rhesus' AS arrow_common_name, protocol_id, max_three_year, date_modified, date_expiration
             FROM arrow_protocols
             WHERE arrow_common_name = 'Macaque'

             UNION ALL

             SELECT rowid, 'Cynomolgus' AS arrow_common_name, protocol_id, max_three_year, date_modified, date_expiration
             FROM arrow_protocols
             WHERE arrow_common_name = 'Macaque'
         )

         UNION ALL
         SELECT rowid, arrow_common_name, protocol_id, max_three_year, modified as date_modified, date_expiration
         FROM extra_protocols

     )