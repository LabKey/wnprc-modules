
--This query checks Rhesus ID's against Rhesus parents for similarities (ex. ID's: rhxxyy and xxyy).
--This query combines the following 2 sub-queries:
--  Query 1: This query gets male Rhesus ID's beginning with 'rh' and checks them against Rhesus sires.
--  Query 2: This query gets female Rhesus ID's beginning with 'rh' and checks them against Rhesus dams.

--Gets all (male id's) and (sires) grouped by their (last_four).
SELECT id, sire, dam, last_four, frequency, species, gender
FROM (
         --Gets: (male) (rhesus/unknown) (beginning with 'rh').
         SELECT id, NULL as sire, NULL as dam, SUBSTR(id,(length(id)-3),length(id)) AS last_four, NULL AS frequency, species, gender
         FROM Pedigree
         WHERE (SUBSTR(id,1,2) = 'rh') AND ((Species='Rhesus') OR (Species='Unknown')) AND (gender='1')

         UNION

         --Gets: (sires) (rhesus/unknown) (NOT beginning with 'rh') (with a length of 4).
         SELECT NULL as id, sire, NULL as dam, SUBSTR(sire,(length(sire)-3),length(sire)) AS last_four, COUNT(*) AS frequency, NULL as species, NULL as gender
         FROM Pedigree
         WHERE (SUBSTR(sire,1,2) != 'rh') AND (length(sire) = 4) AND ((Species='Rhesus') OR (Species='Unknown'))
         GROUP BY sire, SUBSTR(sire,(length(sire)-3),length(sire))
     )
--Checks that each row above has a (last_four) that shows up BOTH with & without the 'rh' prefix.
WHERE last_four IN (
    --Shows the (last_four) of all (male id's) and (sires) that exist BOTH with & without the 'rh' prefix.
    SELECT last_four
    FROM (
             --Gets: (male) (rhesus/unknown) (beginning with 'rh').
             SELECT id, NULL as sire, NULL as dam, SUBSTR(id,(length(id)-3),length(id)) AS last_four, species, gender
             FROM Pedigree
             WHERE (SUBSTR(id,1,2) = 'rh') AND ((Species='Rhesus') OR (Species='Unknown')) AND (gender='1')

             UNION

             --Gets: (sires) (rhesus/unknown) (NOT beginning with 'rh') (with a length of 4).
             SELECT NULL as id, sire, NULL as dam, SUBSTR(sire,(length(sire)-3),length(sire)) AS last_four, NULL as species, NULL as gender
             FROM Pedigree
             WHERE (SUBSTR(sire,1,2) != 'rh') AND (length(sire) = 4) AND ((Species='Rhesus') OR (Species='Unknown'))
             GROUP BY sire, SUBSTR(sire,(length(sire)-3),length(sire))
         )
    GROUP BY last_four
    HAVING COUNT(*) >= 2
)

UNION ALL

--Gets all (female id's) and (dams) grouped by their (last_four).
SELECT id, sire, dam, last_four, frequency, species, gender
FROM (
         --Gets: (female) (rhesus/unknown) (beginning with 'rh').
         SELECT id, NULL as sire, NULL as dam, SUBSTR(id,(length(id)-3),length(id)) AS last_four, NULL AS frequency, species, gender
         FROM Pedigree
         WHERE (SUBSTR(id,1,2) = 'rh') AND ((Species='Rhesus') OR (Species='Unknown')) AND (gender='2')

         UNION

         --Gets: (dams) (rhesus/unknown) (NOT beginning with 'rh') (with a length of 4).
         SELECT NULL as id, NULL as sire, dam, SUBSTR(dam,(length(dam)-3),length(dam)) AS last_four, COUNT(*) AS frequency, NULL as species, NULL as gender
         FROM Pedigree
         WHERE (SUBSTR(dam,1,2) != 'rh') AND (length(dam) = 4) AND ((Species='Rhesus') OR (Species='Unknown'))
         GROUP BY dam, SUBSTR(dam,(length(dam)-3),length(dam))
     )
--Checks that each row above has a (last_four) that shows up BOTH with & without the 'rh' prefix.
WHERE last_four IN (
    --Shows the (last_four) of all (female id's) and (dams) that exist BOTH with & without the 'rh' prefix.
    SELECT last_four
    FROM (
             --Gets: (female) (rhesus/unknown) (beginning with 'rh').
             SELECT id, NULL as sire, NULL as dam, SUBSTR(id,(length(id)-3),length(id)) AS last_four, species, gender
             FROM Pedigree
             WHERE (SUBSTR(id,1,2) = 'rh') AND ((Species='Rhesus') OR (Species='Unknown')) AND (gender='2')

             UNION

             --Gets: (dams) (rhesus/unknown) (NOT beginning with 'rh') (with a length of 4).
             SELECT NULL as id, NULL as sire, dam, SUBSTR(dam,(length(dam)-3),length(dam)) AS last_four, NULL as species, NULL as gender
             FROM Pedigree
             WHERE (SUBSTR(dam,1,2) != 'rh') AND (length(dam) = 4) AND ((Species='Rhesus') OR (Species='Unknown'))
             GROUP BY dam, SUBSTR(dam,(length(dam)-3),length(dam))
         )
    GROUP BY last_four
    HAVING COUNT(*) >= 2
)
ORDER BY last_four