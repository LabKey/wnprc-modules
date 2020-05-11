/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
d.Id AS Id,

coalesce(T4.Total, 0) as NumActiveAssignments,
coalesce(T2.Total, 0) as NumPendingAssignments,
coalesce(T1.Total, 0) as NumActiveResearchAssignments,
coalesce(T3.Total, 0) as NumActiveVetAssignments,
coalesce(T10.Total, 0) as NumActiveTrainingAssignments,
coalesce(T9.Total, 0) as NumActiveBreedingAssignments,

T4.Projects as ActiveAssignments,
T2.Projects as PendingAssignments,
T1.Projects as ActiveResearchAssignments,
T3.Projects as ActiveVetAssignments,
T10.Projects as ActiveTrainingAssignments,
T9.Projects as ActiveBreedingAssignments,


-- CASE WHEN T6.Total > 0 THEN 'Y' ELSE null END as ActiveSPF_StockAssignment,
-- CASE WHEN T7.Total > 0 THEN 'Y' ELSE null END as ActiveConventionalStockAssignment,
-- CASE WHEN T8.Total > 0 THEN 'Y' ELSE null END as ActiveMarmStockAssignment,

CASE WHEN (T5.categories LIKE 'SPF') THEN 'Y' ELSE null END as ActiveSPF_StockAssignment,
CASE WHEN (T5.categories LIKE 'Conventional') THEN 'Y' ELSE null END as ActiveConventionalStockAssignment,
CASE WHEN (T5.categories LIKE 'Marmoset') THEN 'Y' ELSE null END as ActiveMarmStockAssignment,
T5.categories as categories,
coalesce(T5.Total, 0) as NumActiveStockAssignments,
T5.Projects as ActiveStockAssignments,

--NOTE: these are deliberately not COALESCED in order to preserve better readability
-- T6.Total as ActiveSPF_StockAssignments,
-- T7.Total as ActiveConventionalStockAssignments,
-- T8.Total as ActiveMarmStockAssignments,


FROM study.demographics d

--we find the number of active research project assignments
LEFT JOIN
    (SELECT Id, count(DISTINCT project) AS Total, group_concat(DISTINCT project) AS Projects
    FROM study.Assignment
    WHERE qcstate.publicdata = true AND cast(date as date) <= curdate() AND (enddate IS NULL or cast(enddate as date) >= curdate()) AND (project.avail = 'r' OR project.avail = 'n')
    GROUP BY Id) T1
    ON (T1.Id = d.Id)

--we find the number of pending project assignments
LEFT JOIN
    (SELECT Id, count(DISTINCT project) AS Total, group_concat(DISTINCT project) AS Projects FROM study.Assignment WHERE qcstate.publicdata = true AND cast(date as date) <= curdate() AND (enddate IS NULL or cast(enddate as date) >= curdate()) AND (project.avail = 'p') GROUP BY Id) T2
    ON (T2.Id = d.Id)

--we find the number of active vet project assignments
LEFT JOIN
    (SELECT Id, count(DISTINCT project) AS Total, group_concat(DISTINCT project) AS Projects FROM study.Assignment WHERE qcstate.publicdata = true AND cast(date as date) <= curdate() AND (enddate IS NULL or cast(enddate as date) >= curdate()) AND project.avail = 'v' GROUP BY Id) T3
    ON (T3.Id = d.Id)

--we find the number of active breeding project assignments
LEFT JOIN
    (SELECT Id, count(DISTINCT project) AS Total, group_concat(DISTINCT project) AS Projects FROM study.Assignment WHERE qcstate.publicdata = true AND cast(date as date) <= curdate() AND (enddate IS NULL or cast(enddate as date) >= curdate()) AND project.avail = 'b' GROUP BY Id) T9
    ON (T9.Id = d.Id)

--we find the number of active training project assignments
LEFT JOIN
    (SELECT Id, count(DISTINCT project) AS Total, group_concat(DISTINCT project) AS Projects FROM study.Assignment WHERE qcstate.publicdata = true AND cast(date as date) <= curdate() AND (enddate IS NULL or cast(enddate as date) >= curdate()) AND project.avail = 't' GROUP BY Id) T10
    ON (T10.Id = d.Id)

--we find the number of total active project assignments
LEFT JOIN
    (SELECT Id, count(DISTINCT project) AS Total, group_concat(DISTINCT project) AS Projects FROM study.Assignment WHERE qcstate.publicdata = true AND cast(date as date) <= curdate() AND (enddate IS NULL or cast(enddate as date) >= curdate()) GROUP BY Id) T4
    ON (T4.Id = d.Id)

--we find the number of active stock project assignments
--spf stock animals (20150902)
--conventional stock animals (20150903)
--marmoset stock animals (20150904)
LEFT JOIN
    (select id, count(DISTINCT project) AS Total, group_concat(DISTINCT project) AS Projects, group_concat(DISTINCT category) AS categories FROM (
      SELECT Id, project,
        case
          when project = 20150902 then 'SPF'
          when project = 20150903 then 'Conventional'
          when project = 20150904 then 'Marmoset Stock'
          else null
        end as category
      FROM study.Assignment
      WHERE qcstate.publicdata = true AND cast(date as date) <= curdate() AND (enddate IS NULL or cast(enddate as date) >= curdate())
      ) filteredAssignment WHERE category IS NOT NULL GROUP BY Id
      ) t5
    ON (T5.Id = d.Id)

--we find the number of active spf stock project assignments
--spf stock animals (20020201)
-- LEFT JOIN
--     (SELECT T6.Id, count(*) AS Total, group_concat(DISTINCT project) AS Projects FROM study.Assignment T6 WHERE t6.qcstate.publicdata = true AND cast(T6.date as date) <= curdate() AND (T6.enddate IS NULL or cast(T6.enddate as date) >= curdate()) AND (t6.project = '20020201') GROUP BY T6.Id) T6
--     ON (T6.Id = d.Id)

--we find the number of active conventional stock project assignments
--conventional stock animals (20070202)
-- LEFT JOIN
--     (SELECT T7.Id, count(DISTINCT T7.project) AS Total, group_concat(DISTINCT project) AS Projects FROM study.Assignment T7 WHERE t7.qcstate.publicdata = true AND cast(T7.date as date) <= curdate() AND (T7.enddate IS NULL or cast(T7.enddate as date) >= curdate()) AND (t7.project = '20070202') GROUP BY T7.Id) T7
--     ON (T7.Id = d.Id)

--we find the number of active marm stock project assignments
--marmoset stock animals (20070801)
-- LEFT JOIN
--     (SELECT T8.Id, count(DISTINCT T8.project) AS Total, group_concat(DISTINCT project) AS Projects FROM study.Assignment T8 WHERE t8.qcstate.publicdata = true AND cast(T8.date as date) <= curdate() AND (T8.enddate IS NULL or cast(T8.enddate as date) >= curdate()) AND (t8.project = '20070801') GROUP BY T8.Id) T8
--     ON (T8.Id = d.Id)

WHERE
d.calculated_status = 'Alive'
--d.calculated_status = 'Alive'
AND d.id.dataset.demographics.species != 'Unknown'
