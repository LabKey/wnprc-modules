
--This query checks Rhesus parents against Rhesus ID's for similarities (ex. ID's: rhxxyy and xxyy).
--This query combines the following 2 sub-queries:
--  Query 1: This query gets Rhesus sires beginning with 'rh' and checks them against male Rhesus ID's.
--  Query 2: This query gets Rhesus dams beginning with 'rh' and checks them against female Rhesus ID's.

--Gets all (sires) and (male id's) grouped by their (last_four).
SELECT id, sire, dam, last_four, frequency, species, gender
FROM (
         --Gets: (sires) (rhesus/unknown) (beginning with 'rh').
         SELECT NULL as id, sire, NULL as dam, SUBSTR(sire,(length(sire)-3),length(sire)) AS last_four, COUNT(*) AS frequency, NULL as species, NULL as gender
         FROM Pedigree
         WHERE (SUBSTR(sire,1,2) = 'rh') AND (length(sire) = 6) AND ((Species='Rhesus') OR (Species='Unknown'))
         GROUP BY sire, SUBSTR(sire,(length(sire)-3),length(sire))

         UNION

         --Gets: (males) (rhesus/unknown) (NOT beginning with 'rh') (with a length of 4).
         SELECT id, NULL as sire, NULL as dam, SUBSTR(id,(length(id)-3),length(id)) AS last_four, NULL AS frequency, species, gender
         FROM Pedigree
         WHERE (SUBSTR(id,1,2) != 'rh') AND (length(id) = 4) AND ((Species='Rhesus') OR (Species='Unknown')) AND (gender='1')
     )
--Checks that each row above has a (last_four) that shows up BOTH with & without the 'rh' prefix.
WHERE last_four IN (
    --Shows the (last_four) of all (sires) and (male id's) that exist BOTH with & without the 'rh' prefix.
    SELECT last_four
    FROM (
             --Gets: (sires) (rhesus/unknown) (beginning with 'rh').
             SELECT NULL as id, sire, NULL as dam, SUBSTR(sire,(length(sire)-3),length(sire)) AS last_four, NULL as species, NULL as gender
             FROM Pedigree
             WHERE (SUBSTR(sire,1,2) = 'rh') AND (length(sire) = 6) AND ((Species='Rhesus') OR (Species='Unknown'))

             UNION

             --Gets: (male) (rhesus/unknown) (NOT beginning with 'rh') (with a length of 4).
             SELECT id, NULL as sire, NULL as dam, SUBSTR(id,(length(id)-3),length(id)) AS last_four, species, gender
             FROM Pedigree
             WHERE (SUBSTR(id,1,2) != 'rh') AND (length(id) = 4) AND ((Species='Rhesus') OR (Species='Unknown')) AND (gender='1')
         )
    GROUP BY last_four
    HAVING COUNT(*) >= 2
)



UNION ALL


--Gets all (dams) and (female id's) grouped by their (last_four).
SELECT id, sire, dam, last_four, frequency, species, gender
FROM (
         --Gets: (dams) (rhesus/unknown) (beginning with 'rh').
         SELECT NULL as id, NULL as sire, dam, SUBSTR(dam,(length(dam)-3),length(dam)) AS last_four, COUNT(*) AS frequency, NULL as species, NULL as gender
         FROM Pedigree
         WHERE (SUBSTR(dam,1,2) = 'rh') AND (length(dam) = 6) AND ((Species='Rhesus') OR (Species='Unknown'))
         GROUP BY dam, SUBSTR(dam,(length(dam)-3),length(dam))

         UNION

         --Gets: (females) (rhesus/unknown) (NOT beginning with 'rh') (with a length of 4).
         SELECT id, NULL as sire, NULL as dam, SUBSTR(id,(length(id)-3),length(id)) AS last_four, NULL AS frequency, species, gender
         FROM Pedigree
         WHERE (SUBSTR(id,1,2) != 'rh') AND (length(id) = 4) AND ((Species='Rhesus') OR (Species='Unknown')) AND (gender='2')
     )
--Checks that each row above has a (last_four) that shows up BOTH with & without the 'rh' prefix.
WHERE last_four IN (
    --Shows the (last_four) of all (dams) and (female id's) that exist BOTH with & without the 'rh' prefix.
    SELECT last_four
    FROM (
             --Gets: (dams) (rhesus/unknown) (beginning with 'rh').
             SELECT NULL as id, NULL as sire, dam, SUBSTR(dam,(length(dam)-3),length(dam)) AS last_four, NULL as species, NULL as gender
             FROM Pedigree
             WHERE (SUBSTR(dam,1,2) = 'rh') AND (length(dam) = 6) AND ((Species='Rhesus') OR (Species='Unknown'))

             UNION

             --Gets: (female) (rhesus/unknown) (NOT beginning with 'rh') (with a length of 4).
             SELECT id, NULL as sire, NULL as dam, SUBSTR(id,(length(id)-3),length(id)) AS last_four, species, gender
             FROM Pedigree
             WHERE (SUBSTR(id,1,2) != 'rh') AND (length(id) = 4) AND ((Species='Rhesus') OR (Species='Unknown')) AND (gender='2')
         )
    GROUP BY last_four
    HAVING COUNT(*) >= 2
)
ORDER BY last_four