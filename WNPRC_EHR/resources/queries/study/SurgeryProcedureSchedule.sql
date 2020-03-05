/* This query feeds the Surgery Schedule JSP page/calendar. */
SELECT lsid
     , objectid
     , requestid
     , requestid.rowid           AS rowid
     , requestid.priority
     , createdby.displayname     AS requestor
     , taskid
     , Id                        AS animalid
     , Id.Demographics.gender    AS sex
     , Id.age.ageFriendly        AS age
     , Id.Demographics.weight    AS weight
     , Id.Demographics.medical   AS medical
     , Id.curLocation.room       AS cur_room
     , Id.curLocation.cage       AS cur_cage
     , Id.curLocation.cond.title AS cur_cond
     , date
     , enddate
     , procedurecategory
     , procedurename
     , created
     , project
     , project.protocol          AS protocol
     , account
     , location
     , requestid.qcstate         AS qcstate
     , statuschangereason
     , comments
FROM study.surgery_procedure