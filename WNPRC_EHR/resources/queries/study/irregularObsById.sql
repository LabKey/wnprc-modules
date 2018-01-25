/*
 * Copyright (c) 2010-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/*
 * This query combines the cage observations, individual animal observations, and Okay rooms tables
 * to provide a summary of the irregular obs performed.  This is accessed by the vets to review the
 * day's observations.
 *
 * This query is used to display the Today at Center // Irregular Observations report in Animal History.
 */

SELECT
  animal_ob.id,                                    --  +
  animal_ob.id.dataset.activehousing.area as area, --  |
  animal_ob.id.dataset.activehousing.room as room, --  |
  animal_ob.id.dataset.activehousing.cage as cage, --  |
  animal_ob.date,                                  --  |
  cast(animal_ob.date as DATE) as DateOnly,        --  |
  animal_ob.performedby as userid,                 --  |
  animal_ob.feces,                                 --  |
  animal_ob.menses,                                --  |
  animal_ob.behavior,                              --  +-- Animal observations
  animal_ob.breeding,                              --  |
  animal_ob.other,                                 --  |
  animal_ob.tlocation,                             --  |
  animal_ob.otherbehavior,                         --  |
  animal_ob.remark,                                --  |
  animal_ob.dataset,                               --  |
  animal_ob.description,                           --  |
  animal_ob.qcstate,                               --  |
  animal_ob.taskid,                                --  |
  FALSE AS everything_ok,                          --  |
  animal_ob.isIrregular                            --  +
FROM study."Irregular Observations" animal_ob

UNION ALL

SELECT
  cage_ob.id as id,                                --  +
  cage_ob.area as area,                            --  |
  cage_ob.room as room,                            --  |
  cage_ob.cage as cage,                            --  |
  cage_ob.date,                                    --  |
  cast(cage_ob.date as DATE) as DateOnly,          --  |
  cage_ob.userid as userid,                        --  |
  cage_ob.feces as feces,                          --  |
  null as menses,                                  --  +-- Cage Observations
  null as behavior,                                --  |
  null as breeding,                                --  |
  null as other,                                   --  |
  null as tlocation,                               --  |
  null as otherbehavior,                           --  |
  cage_ob.remark,                                  --  |
  null as dataset,                                 --  |
  cage_ob.description,                             --  |
  cage_ob.qcstate,                                 --  |
  cage_ob.taskid,                                  --  |
  cage_ob.no_observations AS everything_ok,        --  |
  true as isIrregular                              --  +
FROM study."Cage Observations Per Animal" cage_ob

UNION ALL

SELECT
  null as id,                                      --  +
  ok_room.room.area as area,                       --  |
  ok_room.room as room,                            --  |
  null as cage,                                    --  |
  ok_room.date,                                    --  |
  cast(ok_room.date as DATE) as DateOnly,          --  |
  ok_room.userid as userid,                        --  |
  null as feces,                                   --  |
  null as menses,                                  --  |
  null as behavior,                                --  +-- Rooms Marked as "Okay"
  null as breeding,                                --  |
  null as other,                                   --  |
  null as tlocation,                               --  |
  null as otherbehavior,                           --  |
  ok_room.remark,                                  --  |
  null as dataset,                                 --  |
  ok_room.description,                             --  |
  ok_room.qcstate,                                 --  |
  ok_room.taskid,                                  --  |
  TRUE AS everything_ok,                           --  |
  true as isIrregular                              --  +
FROM study."Okay Rooms" ok_room
