/*
 * Copyright (c) 2011-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

select w.id, w.date as WeightDate, w.death, timestampdiff('SQL_TSI_DAY', w.date, w.death) as daysBetween

from (SELECT
  w.Id AS Id, max(w.date) AS date, max(w.id.dataset.demographics.death) as death,
	FROM study.weight w
	WHERE w.qcstate.publicdata = true and w.weight is not null and w.id.dataset.demographics.death is not null
	GROUP BY w.id) w
	where timestampdiff('SQL_TSI_DAY', w.date, w.death) >= 7