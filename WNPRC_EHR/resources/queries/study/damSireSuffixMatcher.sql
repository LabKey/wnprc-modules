--Gets all sires.
SELECT last_four, sire, NULL as dam, frequency, Species
FROM (
    --Shows all rh sires.
    SELECT Sire, SUBSTR(Sire,(length(sire)-3),length(sire)) AS last_four, COUNT(*) AS frequency, Species
    FROM Pedigree
    WHERE (SUBSTR(Sire,1,2) = 'rh') AND (Species='Rhesus')
    GROUP BY Sire, SUBSTR(Sire,(length(sire)-3),length(sire)), Species

    UNION

    --Shows all 4 digit sires.
    SELECT Sire, SUBSTR(Sire,(length(sire)-3),length(sire)) AS last_four, COUNT(*) AS frequency, Species
    FROM Pedigree
    WHERE (SUBSTR(Sire,1,2) != 'rh') AND (length(sire) = 4) AND (Species='Rhesus')
    GROUP BY Sire, SUBSTR(Sire,(length(sire)-3),length(sire)), Species
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
                SELECT Sire, SUBSTR(Sire,(length(sire)-3),length(sire)) AS last_four, Species
                FROM Pedigree
                WHERE (SUBSTR(Sire,1,2) = 'rh') AND (Species='Rhesus')
                GROUP BY Sire, SUBSTR(Sire,(length(sire)-3),length(sire)), Species

                UNION

                --Shows all 4 digit sires.
                SELECT Sire, SUBSTR(Sire,(length(sire)-3),length(sire)) AS last_four, Species
                FROM Pedigree
                WHERE (SUBSTR(Sire,1,2) != 'rh') AND (length(sire) = 4) AND (Species='Rhesus')
                GROUP BY Sire, SUBSTR(Sire,(length(sire)-3),length(sire)), Species
            )
            GROUP BY last_four
        )
        WHERE duplicate_entry = 2
    )
)


UNION ALL


--Gets all dams.
SELECT last_four, NULL AS sire, dam, frequency, Species
FROM (
    --Shows all rh dam.
    SELECT Dam, SUBSTR(Dam,(length(dam)-3),length(dam)) AS last_four, COUNT(*) AS frequency, Species
    FROM Pedigree
    WHERE (SUBSTR(Dam,1,2) = 'rh') AND (Species='Rhesus')
    GROUP BY Dam, SUBSTR(Dam,(length(dam)-3),length(dam)), Species

    UNION

    --Shows all 4 digit dams.
    SELECT Dam, SUBSTR(Dam,(length(dam)-3),length(dam)) AS last_four, COUNT(*) AS frequency, Species
    FROM Pedigree
    WHERE (SUBSTR(Dam,1,2) != 'rh') AND (length(dam) = 4) AND (Species='Rhesus')
    GROUP BY Dam, SUBSTR(Dam,(length(dam)-3),length(dam)), Species
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
                SELECT Dam, SUBSTR(Dam,(length(dam)-3),length(dam)) AS last_four, Species
                FROM Pedigree
                WHERE (SUBSTR(Dam,1,2) = 'rh') AND (Species='Rhesus')
                GROUP BY Dam, SUBSTR(Dam,(length(dam)-3),length(dam)), Species

                UNION

                --Shows all 4 digit dams.
                SELECT Dam, SUBSTR(Dam,(length(dam)-3),length(dam)) AS last_four, Species
                FROM Pedigree
                WHERE (SUBSTR(Dam,1,2) != 'rh') AND (length(dam) = 4) AND (Species='Rhesus')
                GROUP BY Dam, SUBSTR(Dam,(length(dam)-3),length(dam)), Species
            )
            GROUP BY last_four
        )
        WHERE duplicate_entry = 2
    )
)
ORDER BY last_four