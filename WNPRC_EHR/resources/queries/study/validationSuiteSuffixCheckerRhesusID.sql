<<<<<<< HEAD
=======

--This query checks Rhesus ID's for similarities (ex. ID's: rhxxyy and xxyy).
--This query combines the following 2 sub-queries:
--  Query 1: This query checks for unique male Rhesus ID's with last four digits that match.
--  Query 2: This query checks for unique female Rhesus ID's with last four digits that match.

>>>>>>> release22.11-SNAPSHOT
--Gets all (male) (ids) grouped by their (last_four).
SELECT last_four, id, species, gender
FROM (
         --Gets: (male) (rhesus/unknown) (beginning with 'rh').
         SELECT id, SUBSTR(id,(length(id)-3),length(id)) AS last_four, species, gender
         FROM Pedigree
         WHERE (SUBSTR(id,1,2) = 'rh') AND ((Species='Rhesus') OR (Species='Unknown')) AND (gender='1')

         UNION

         --Gets: (male) (rhesus/unknown) (NOT beginning with 'rh') (with a length of 4).
         SELECT id, SUBSTR(id,(length(id)-3),length(id)) AS last_four, species, gender
         FROM Pedigree
         WHERE (SUBSTR(id,1,2) != 'rh') AND (length(id) = 4) AND ((Species='Rhesus') OR (Species='Unknown')) AND (gender='1')
     )
--Checks that each row above has a (last_four) that shows up BOTH with & without the 'rh' prefix.
WHERE last_four IN (
    --Shows the (last_four) of all (ids) that exist BOTH with & without the 'rh' prefix.
    SELECT last_four
    FROM (
             --Gets: (male) (rhesus/unknown) (beginning with 'rh').
             SELECT id, SUBSTR(id,(length(id)-3),length(id)) AS last_four
             FROM Pedigree
             WHERE (SUBSTR(id,1,2) = 'rh') AND ((Species='Rhesus') OR (Species='Unknown')) AND (gender='1')

             UNION

             --Gets: (male) (rhesus/unknown) (NOT beginning with 'rh') (with a length of 4).
             SELECT id, SUBSTR(id,(length(id)-3),length(id)) AS last_four
             FROM Pedigree
             WHERE (SUBSTR(id,1,2) != 'rh') AND (length(id) = 4) AND ((Species='Rhesus') OR (Species='Unknown')) AND (gender='1')
         )
    GROUP BY last_four
    HAVING COUNT(*) >= 2
)


UNION ALL

--Gets all (female) (ids) grouped by their (last_four).
SELECT last_four, id, species, gender
FROM (
         --Gets: (female) (rhesus/unknown) (beginning with 'rh').
         SELECT id, SUBSTR(id,(length(id)-3),length(id)) AS last_four, species, gender
         FROM Pedigree
         WHERE (SUBSTR(id,1,2) = 'rh') AND ((Species='Rhesus') OR (Species='Unknown')) AND (gender='2')

         UNION

         --Gets: (female) (rhesus/unknown) (NOT beginning with 'rh') (with a length of 4).
         SELECT id, SUBSTR(id,(length(id)-3),length(id)) AS last_four, species, gender
         FROM Pedigree
         WHERE (SUBSTR(id,1,2) != 'rh') AND (length(id) = 4) AND ((Species='Rhesus') OR (Species='Unknown')) AND (gender='2')
     )
--Checks that each row above has a (last_four) that shows up BOTH with & without the 'rh' prefix.
WHERE last_four IN (
    --Shows the (last_four) of all (ids) that exist BOTH with & without the 'rh' prefix.
    SELECT last_four
    FROM (
             --Gets: (female) (rhesus/unknown) (beginning with 'rh').
             SELECT id, SUBSTR(id,(length(id)-3),length(id)) AS last_four
             FROM Pedigree
             WHERE (SUBSTR(id,1,2) = 'rh') AND ((Species='Rhesus') OR (Species='Unknown')) AND (gender='2')

             UNION

             --Gets: (female) (rhesus/unknown) (NOT beginning with 'rh') (with a length of 4).
             SELECT id, SUBSTR(id,(length(id)-3),length(id)) AS last_four
             FROM Pedigree
             WHERE (SUBSTR(id,1,2) != 'rh') AND (length(id) = 4) AND ((Species='Rhesus') OR (Species='Unknown')) AND (gender='2')
         )
    GROUP BY last_four
    HAVING COUNT(*) >= 2
<<<<<<< HEAD
)
=======
)
ORDER BY last_four
>>>>>>> release22.11-SNAPSHOT
