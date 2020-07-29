/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

    w.Room,
    w.Cage,
    w.id,
    w.chowLookup as TypeOfChow,
    w.remark,
    w.DateChanged,
    w.chowConversion
    /*timestampdiff('SQL_TSI_DAY', w.DateChanged, now()) AS DaysSinceFeedingChange,*/

FROM (

         SELECT m.Id, m.chowLookup, m.remark, m.Id.curLocation.Room as Room, m.Id.curLocation.Cage as Cage, m.chowConversion, t.DateChanged
         FROM (
                  SELECT
                      w.Id AS Id,
                      max(w.date) AS DateChanged

                  FROM study.feeding w
                      /*WHERE w.qcstate.publicdata = true and w.weight is not null*/
                  GROUP BY w.id
              ) t JOIN study.feeding m ON m.Id = t.Id AND t.DateChanged = m.date;


     ) w

