/*
 * Copyright (c) 2023-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

--This query checks Rhesus parents for similarities (ex. ID's: rhxxyy and xxyy).
--This query combines the following 2 sub-queries:
--  Query 1: This query checks for unique Rhesus sires with last four digits that match.
--  Query 2: This query checks for unique Rhesus dams with last four digits that match.

--Gets all (sires) grouped by their (last_four).
--Uses a (frequency) variable to show how many (sires) are listed for each (last_four).
SELECT last_four, sire, NULL AS dam, frequency, Species
FROM (
         --Gets: (sires) (rhesus/unknown) (beginning with 'rh').
         SELECT sire, SUBSTR(sire,(length(sire)-3),length(sire)) AS last_four, COUNT(*) AS frequency, Species
         FROM Pedigree
         WHERE (SUBSTR(sire,1,2) = 'rh') AND ((Species='Rhesus') OR (Species='Unknown'))
         GROUP BY sire, SUBSTR(sire,(length(sire)-3),length(sire)), Species

         UNION

         --Gets: (sires) (rhesus/unknown) (NOT beginning with 'rh') (with a length of 4).
         SELECT sire, SUBSTR(sire,(length(sire)-3),length(sire)) AS last_four, COUNT(*) AS frequency, Species
         FROM Pedigree
         WHERE (SUBSTR(sire,1,2) != 'rh') AND (length(sire) = 4) AND ((Species='Rhesus') OR (Species='Unknown'))
         GROUP BY sire, SUBSTR(sire,(length(sire)-3),length(sire)), Species
     )
--Checks that each row above has a (last_four) that shows up BOTH with & without the 'rh' prefix.
WHERE last_four IN (
    --Shows the (last_four) of all (sires) that exist BOTH with & without the 'rh' prefix.
    SELECT last_four
    FROM (
             --Gets: (sires) (rhesus/unknown) (beginning with 'rh').
             SELECT sire, SUBSTR(sire,(length(sire)-3),length(sire)) AS last_four, Species
             FROM Pedigree
             WHERE (SUBSTR(sire,1,2) = 'rh') AND ((Species='Rhesus') OR (Species='Unknown'))

             UNION

             --Gets: (sires) (rhesus/unknown) (NOT beginning with 'rh') (with a length of 4).
             SELECT sire, SUBSTR(sire,(length(sire)-3),length(sire)) AS last_four, Species
             FROM Pedigree
             WHERE (SUBSTR(sire,1,2) != 'rh') AND (length(sire) = 4) AND ((Species='Rhesus') OR (Species='Unknown'))
         )
    GROUP BY last_four
    HAVING COUNT(*) >= 2
)


UNION ALL


--Gets all (dams) grouped by their (last_four).
--Uses a (frequency) variable to show how many (dams) are listed for each (last_four).
SELECT last_four, NULL AS sire, Dam, frequency, Species
FROM (
         --Gets: (dams) (rhesus/unknown) (beginning with 'rh').
         SELECT Dam, SUBSTR(Dam,(length(Dam)-3),length(Dam)) AS last_four, COUNT(*) AS frequency, Species
         FROM Pedigree
         WHERE (SUBSTR(Dam,1,2) = 'rh') AND ((Species='Rhesus') OR (Species='Unknown'))
         GROUP BY Dam, SUBSTR(Dam,(length(Dam)-3),length(Dam)), Species

         UNION

         --Gets: (dams) (rhesus/unknown) (NOT beginning with 'rh') (with a length of 4).
         SELECT Dam, SUBSTR(Dam,(length(Dam)-3),length(Dam)) AS last_four, COUNT(*) AS frequency, Species
         FROM Pedigree
         WHERE (SUBSTR(Dam,1,2) != 'rh') AND (length(Dam) = 4) AND ((Species='Rhesus') OR (Species='Unknown'))
         GROUP BY Dam, SUBSTR(Dam,(length(Dam)-3),length(Dam)), Species
     )
--Checks that each row above has a (last_four) that shows up BOTH with & without the 'rh' prefix.
WHERE last_four IN (
    --Shows the (last_four) of all (dams) that exist BOTH with & without the 'rh' prefix.
    SELECT last_four
    FROM (
             --Gets: (dams) (rhesus/unknown) (beginning with 'rh').
             SELECT Dam, SUBSTR(Dam,(length(Dam)-3),length(Dam)) AS last_four, Species
             FROM Pedigree
             WHERE (SUBSTR(Dam,1,2) = 'rh') AND ((Species='Rhesus') OR (Species='Unknown'))

             UNION

             --Gets: (dams) (rhesus/unknown) (NOT beginning with 'rh') (with a length of 4).
             SELECT Dam, SUBSTR(Dam,(length(Dam)-3),length(Dam)) AS last_four, Species
             FROM Pedigree
             WHERE (SUBSTR(Dam,1,2) != 'rh') AND (length(Dam) = 4) AND ((Species='Rhesus') OR (Species='Unknown'))
         )
    GROUP BY last_four
    HAVING COUNT(*) >= 2
)
ORDER BY last_four