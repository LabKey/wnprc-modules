/* This query feeds the Surgery Schedule JSP page/calendar. */
SELECT lsid
  ,objectid
  ,a.taskid                        AS taskid
  ,animalid
  ,animalid.Demographics.gender    AS sex
  ,animalid.age.ageFriendly        AS age
  ,animalid.Demographics.weight    AS weight
  ,animalid.Demographics.medical   AS medical
  ,animalid.curLocation.room       AS cur_room
  ,animalid.curLocation.cage       AS cur_cage
  ,animalid.curLocation.cond.title AS cur_cond
  ,surgerystart
  ,surgeryend
  ,date
  ,procedure
  ,created
  ,project
  ,protocol
  ,account
  ,location
  ,state
FROM (SELECT lsid
        ,objectid
        ,taskid.rowid     AS taskid
        ,Id               AS animalid
        ,surgerystart
        ,surgeryend
        ,"date"
        ,procedure
        ,created
        ,project
        ,project.protocol AS protocol
        ,account
        ,location
        ,taskid.qcstate   AS state
      FROM study.surgery
      WHERE taskid IS NOT NULL) a