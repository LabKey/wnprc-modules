/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  d.id.dataset.demographics.v_status as v_status,
  d.id.dataset.demographics.species as species,
  count(coalesce(d.id.dataset.demographics.v_status, '')) as TotalAnimals,

  count(d.ActiveAssignments) AS ActiveAssignments,
  count(coalesce(d.id.dataset.demographics.v_status, '')) - count(d.ActiveAssignments) AS NoAssignments,
  count(d.PendingAssignments) AS PendingAssignments,
  count(d.ActiveResearchAssignments) as ActiveResearchAssignments,
  count(d.ActiveBreedingAssignments) as ActiveBreedingAssignments,
  count(d.ActiveTrainingAssignments) as ActiveTrainingAssignments,

  --count(T3.Total) as ActiveVetAssignments,
  count(d.ActiveSPF_StockAssignment) AS ActiveSPF_StockAssignments,
  count(d.ActiveConventionalStockAssignment) AS ActiveConventionalStockAssignments,
  count(d.ActiveMarmStockAssignment) AS ActiveMarmStockAssignments,


FROM study.demographicsAssignmentSummary d

WHERE
d.id.dataset.demographics.calculated_status = 'Alive'
--d.id.dataset.demographics.calculated_status = 'Alive'
AND d.id.dataset.demographics.species != 'Unknown'

GROUP BY d.id.dataset.demographics.v_status, d.id.dataset.demographics.species

