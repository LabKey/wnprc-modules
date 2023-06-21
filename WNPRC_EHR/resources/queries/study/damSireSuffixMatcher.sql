--Gets all sires.
SELECT last_four, sire, NULL as dam, frequency
FROM (
         --Shows all rh sires.
         SELECT Sire, SUBSTR(Sire,(length(sire)-3),length(sire)) AS last_four, COUNT(*) AS frequency
         FROM Pedigree
         WHERE (SUBSTR(Sire,1,2) = 'rh')
         GROUP BY Sire, SUBSTR(Sire,(length(sire)-3),length(sire))

         UNION

         --Shows all 4 digit sires.
         SELECT Sire, SUBSTR(Sire,(length(sire)-3),length(sire)) AS last_four, COUNT(*) AS frequency
         FROM Pedigree
         WHERE (SUBSTR(Sire,1,2) != 'rh') AND (length(sire) = 4)
         GROUP BY Sire, SUBSTR(Sire,(length(sire)-3),length(sire))
     )
--Checks that each row above has a 'last_four' that shows up both with & without the 'rh'.
WHERE last_four IN (
    SELECT last_four
    FROM (
             --Shows all issue ID suffixes.
             SELECT last_four, duplicate_entry
             FROM (
                      --Only shows ID's where last_four appears both with & without the 'rh'.
                      SELECT last_four, COUNT(*) AS duplicate_entry
                      FROM (
                               --Shows all rh sires.
                               SELECT Sire, SUBSTR(Sire,(length(sire)-3),length(sire)) AS last_four
                               FROM Pedigree
                               WHERE (SUBSTR(Sire,1,2) = 'rh')
                               GROUP BY Sire, SUBSTR(Sire,(length(sire)-3),length(sire))

                               UNION

                               --Shows all 4 digit sires.
                               SELECT Sire, SUBSTR(Sire,(length(sire)-3),length(sire)) AS last_four
                               FROM Pedigree
                               WHERE (SUBSTR(Sire,1,2) != 'rh') AND (length(sire) = 4)
                               GROUP BY Sire, SUBSTR(Sire,(length(sire)-3),length(sire))
                           )
                      GROUP BY last_four
                  )
             WHERE duplicate_entry = 2
         )
)


UNION ALL


--Gets all dams.
SELECT last_four, NULL AS sire, dam, frequency,
FROM (
         --Shows all rh dam.
         SELECT Dam, SUBSTR(Dam,(length(dam)-3),length(dam)) AS last_four, COUNT(*) AS frequency
         FROM Pedigree
         WHERE (SUBSTR(Dam,1,2) = 'rh')
         GROUP BY Dam, SUBSTR(Dam,(length(dam)-3),length(dam))

         UNION

         --Shows all 4 digit dams.
         SELECT Dam, SUBSTR(Dam,(length(dam)-3),length(dam)) AS last_four, COUNT(*) AS frequency
         FROM Pedigree
         WHERE (SUBSTR(Dam,1,2) != 'rh') AND (length(dam) = 4)
         GROUP BY Dam, SUBSTR(Dam,(length(dam)-3),length(dam))
     )
--Checks that each row above has a 'last_four' that shows up both with & without the 'rh'.
WHERE last_four IN (
    SELECT last_four
    FROM (
             --Shows all issue ID suffixes.
             SELECT last_four, duplicate_entry
             FROM (
                      --Only shows ID's where last_four appears both with & without the 'rh'.
                      SELECT last_four, COUNT(*) AS duplicate_entry
                      FROM (
                               --Shows all rh dams.
                               SELECT Dam, SUBSTR(Dam,(length(dam)-3),length(dam)) AS last_four
                               FROM Pedigree
                               WHERE (SUBSTR(Dam,1,2) = 'rh')
                               GROUP BY Dam, SUBSTR(Dam,(length(dam)-3),length(dam))

                               UNION

                               --Shows all 4 digit dams.
                               SELECT Dam, SUBSTR(Dam,(length(dam)-3),length(dam)) AS last_four
                               FROM Pedigree
                               WHERE (SUBSTR(Dam,1,2) != 'rh') AND (length(dam) = 4)
                               GROUP BY Dam, SUBSTR(Dam,(length(dam)-3),length(dam))
                           )
                      GROUP BY last_four
                  )
             WHERE duplicate_entry = 2
         )
)
ORDER BY last_four