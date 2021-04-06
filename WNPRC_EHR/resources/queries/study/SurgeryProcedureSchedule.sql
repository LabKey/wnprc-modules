/* This query feeds the Surgery Schedule JSP page/calendar. */
SELECT a.lsid
     , a.objectid
     , a.requestid
     , a.requestid.rowid           AS rowid
     , a.requestid.priority
     , a.createdby.displayname     AS requestor
     , a.taskid
     , a.Id                        AS animalid
     , a.Id.Demographics.gender    AS sex
     , a.Id.age.ageFriendly        AS age
     , a.Id.Demographics.weight    AS weight
     , a.Id.Demographics.medical   AS medical
     , a.Id.curLocation.room       AS cur_room
     , a.Id.curLocation.cage       AS cur_cage
     , a.Id.curLocation.cond.title AS cur_cond
     , a.date
     , a.enddate
     , (SELECT GROUP_CONCAT(b.displayname, ', ') FROM wnprc.procedure_names b
        WHERE b.name IN (SELECT UNNEST(STRING_TO_ARRAY(a.procedurename, ',')))) AS procedurename
     --, a.procedurename AS procedurename
     , a.procedureunit.unit_display_name AS procedureunitdisplay
     , a.procedureunit             AS procedureunit
     , a.created
     , a.project
     , a.project.protocol          AS protocol
     , a.account
     , a.surgeon                   AS surgeon_userid
     , a.surgeon.displayname       AS surgeon
     , a.consultrequest
     , a.biopsyneeded
     , a.surgerytechneeded
     , a.spineeded
     , a.vetneeded
     , a.vetneededreason
     , a.equipment
     , a.drugslab
     , a.drugssurgery
     , a.requestid.qcstate         AS qcstate
     , a.statuschangereason
     , a.comments
     , (SELECT GROUP_CONCAT(b.room, ',') FROM wnprc.procedure_scheduled_rooms b
        WHERE a.requestid = b.requestid) AS rooms
FROM study.surgery_procedure a