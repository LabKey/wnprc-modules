/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

SELECT
    sd.Id,
    d.species,
    sd.date,
    sd.project AS project,
    sd.DataSet.Label AS dataset,
    sd.DataSet.Name AS DataSetName,
    sd.remark,
    sd.description,
    COALESCE(roommate_data.NumRoommates, 0) as NumRoommates,
    COALESCE(roommate_data.AnimalsInCage, 1) as AnimalsInCage,
    roommate_data.cagemates,
    CASE
        WHEN sd.DataSet.Name = 'housing' THEN
            (CASE WHEN EXISTS (
                SELECT 1 FROM study.studyData sd2
                WHERE sd2.Id = sd.Id
                  AND sd2.date BETWEEN sd.date AND COALESCE(sd.enddate, now())
                  AND (
                    (sd2.DataSet.Name = 'obs' AND sd2.description LIKE '%Feces%') OR
                    (sd2.DataSet.Name = 'cageObs' AND sd2.description LIKE '%Feces%') OR
                    (sd2.DataSet.Name = 'problem' AND LOWER(sd2.remark) LIKE '%diarrhea%') OR
                    (sd2.DataSet.Name = 'encounters' AND LOWER(sd2.remark) LIKE '%diarrhea%') OR
                    (sd2.DataSet.Name = 'treatment_order' AND (
                        sd2.description LIKE '%w-10980%' OR sd2.description LIKE '%c-54620%' OR sd2.description LIKE '%w-10942%' OR sd2.description LIKE '%w-10944%' OR sd2.description LIKE '%c-54630%' OR sd2.description LIKE '%c-52a68%' OR sd2.description LIKE '%w-10044%' OR sd2.description LIKE '%c-52a20%' OR sd2.description LIKE '%c-93040%' OR sd2.description LIKE '%c-a0111%' OR sd2.description LIKE '%c-52a10%' OR sd2.description LIKE '%w-10226%' OR sd2.description LIKE '%f-61c7b%' OR sd2.description LIKE '%c-55020%' OR sd2.description LIKE '%c-d1507%' OR sd2.description LIKE '%c-52a00%' OR sd2.description LIKE '%t-59666%' OR sd2.description LIKE '%c-d4657%' OR sd2.description LIKE '%r-f94e9%' OR sd2.description LIKE '%c-b0158%' OR sd2.description LIKE '%w-10587%' OR sd2.description LIKE '%w-10757%' OR sd2.description LIKE '%r-f94e9%' OR sd2.description LIKE '%c-d3739%' OR sd2.description LIKE '%w-10222%' OR sd2.description LIKE '%c-84540%' OR sd2.description LIKE '%w-10975%' OR sd2.description LIKE '%c-52040%' OR sd2.description LIKE '%c-5205d%' OR sd2.description LIKE '%c-84232%' OR sd2.description LIKE '%c-56101%' OR sd2.description LIKE '%c-84560%' OR sd2.description LIKE '%c-56a50%' OR sd2.description LIKE '%@e-85350%' OR sd2.description LIKE '%c-a01b0%' OR sd2.description LIKE '%f-61e1f%' OR sd2.description LIKE '%c-84812%' OR sd2.description LIKE '%w-10908%' OR sd2.description LIKE '%w-10882%' OR sd2.description LIKE '%c-0026e%' OR sd2.description LIKE '%c-55001%' OR sd2.description LIKE '%c-52340%'
                    ))
                  )
            ) THEN 1 ELSE 0 END)
        WHEN sd.DataSet.Name = 'obs' AND sd.description LIKE '%Feces%' THEN 1
        WHEN sd.DataSet.Name = 'cageObs' AND sd.description LIKE '%Feces%' THEN 1
        WHEN sd.DataSet.Name = 'problem' AND LOWER(sd.remark) LIKE '%diarrhea%' THEN 1
        WHEN sd.DataSet.Name = 'encounters' AND LOWER(sd.remark) LIKE '%diarrhea%' THEN 1
        WHEN sd.DataSet.Name = 'treatment_order' AND (
            sd.description LIKE '%w-10980%' OR sd.description LIKE '%c-54620%' OR sd.description LIKE '%w-10942%' OR sd.description LIKE '%w-10944%' OR sd.description LIKE '%c-54630%' OR sd.description LIKE '%c-52a68%' OR sd.description LIKE '%w-10044%' OR sd.description LIKE '%c-52a20%' OR sd.description LIKE '%c-93040%' OR sd.description LIKE '%c-a0111%' OR sd.description LIKE '%c-52a10%' OR sd.description LIKE '%w-10226%' OR sd.description LIKE '%f-61c7b%' OR sd.description LIKE '%c-55020%' OR sd.description LIKE '%c-d1507%' OR sd.description LIKE '%c-52a00%' OR sd.description LIKE '%t-59666%' OR sd.description LIKE '%c-d4657%' OR sd.description LIKE '%r-f94e9%' OR sd.description LIKE '%c-b0158%' OR sd.description LIKE '%w-10587%' OR sd.description LIKE '%w-10757%' OR sd.description LIKE '%r-f94e9%' OR sd.description LIKE '%c-d3739%' OR sd.description LIKE '%w-10222%' OR sd.description LIKE '%c-84540%' OR sd.description LIKE '%w-10975%' OR sd.description LIKE '%c-52040%' OR sd.description LIKE '%c-5205d%' OR sd.description LIKE '%c-84232%' OR sd.description LIKE '%c-56101%' OR sd.description LIKE '%c-84560%' OR sd.description LIKE '%c-56a50%' OR sd.description LIKE '%@e-85350%' OR sd.description LIKE '%c-a01b0%' OR sd.description LIKE '%f-61e1f%' OR sd.description LIKE '%c-84812%' OR sd.description LIKE '%w-10908%' OR sd.description LIKE '%w-10882%' OR sd.description LIKE '%c-0026e%' OR sd.description LIKE '%c-55001%' OR sd.description LIKE '%c-52340%'
        ) THEN 1
        ELSE 0
    END AS diarrhea
FROM study.studyData sd
         LEFT JOIN study.demographics d ON sd.Id = d.Id
         LEFT JOIN (
    SELECT
        d.id,
        count(DISTINCT h.RoommateId) as NumRoommates,
        (count(DISTINCT h.RoommateId)+1) as AnimalsInCage,
        group_concat(DISTINCT h.RoommateId) as cagemates
    FROM study.demographics d
             LEFT JOIN (
        SELECT
            h1.id,
            h2.id as RoommateId
        FROM study.Housing h1
                 LEFT OUTER JOIN study.Housing h2 ON (
            h1.room = h2.room AND -- Make sure room matches
            (h1.cage = h2.cage OR (h1.cage is null and h2.cage is null)) -- make sure cage matches
            )
        WHERE h1.qcstate.publicdata = true
          AND h2.qcstate.publicdata = true
          AND h1.id IS NOT NULL
          AND h2.id IS NOT NULL
          AND h1.enddate IS NULL
          AND h2.enddate IS NULL
          AND h1.id != h2.id
    ) h
                       ON (h.id = d.id)
    GROUP BY d.id
) roommate_data ON sd.Id = roommate_data.id
WHERE sd.DataSet.Name in ('obs','cageObs', 'encounters', 'treatment_order', 'housing','problem')
AND d.species IS NOT NULL