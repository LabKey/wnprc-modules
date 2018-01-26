/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

select

t5.id,
group_concat(DISTINCT project) AS Projects,
group_concat(DISTINCT category) AS ViralStatus

FROM (
  SELECT T5.Id, t5.project,
    case
      when project = 20020201 then 'SPF'
      when project = 20070202 then 'Conventional'
      when project = 20070801 then 'Marmoset Stock'
      --when project = xxxxxx then 'Viral Free'
      else null
    end as category
  FROM study.Assignment T5
  WHERE t5.qcstate.publicdata = true AND cast(T5.date as date) <= curdate() AND (T5.enddate IS NULL or cast(T5.enddate as date) >= curdate()) AND (t5.project = '20020201' OR t5.project = '20070202' OR t5.project = '20070801')
) T5 GROUP BY T5.Id