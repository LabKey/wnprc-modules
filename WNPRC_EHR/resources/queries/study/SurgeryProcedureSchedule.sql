/* This query feeds the Surgery Schedule JSP page/calendar. */
SELECT lsid
  ,objectid
  ,requestid
  ,a.taskid                        AS taskid
  ,animalid
  ,animalid.Demographics.gender    AS sex
  ,animalid.age.ageFriendly        AS age
  ,animalid.Demographics.weight    AS weight
  ,animalid.Demographics.medical   AS medical
  ,animalid.curLocation.room       AS cur_room
  ,animalid.curLocation.cage       AS cur_cage
  ,animalid.curLocation.cond.title AS cur_cond
  ,date
  ,enddate
  ,procedure
  ,created
  ,project
  ,protocol
  ,account
  ,location
  ,state
FROM (SELECT lsid
        ,objectid
        ,requestid
        ,taskid.rowid     AS taskid
        ,Id               AS animalid
        ,date
        ,enddate
        ,procedure
        ,created
        ,project
        ,project.protocol AS protocol
        ,account
        ,location
        ,taskid.qcstate   AS state
      FROM study.surgery_procedure
      WHERE taskid IS NOT NULL) a