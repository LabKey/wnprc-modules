/* This query feeds the Necropsy Schedule JSP page/calendar. */
/* Correlated subqueries rather than lookups/joins that aggregate entire datasets, so cost scales with the rows returned. */
SELECT lsid
      ,taskid
      ,animalid
      ,animalid.Demographics.gender                         AS sex
      ,animalid.age.ageFriendly                             AS age
      ,CAST((SELECT ROUND(CAST(AVG(w.weight) AS DOUBLE), 2)
               FROM study.weight w
              WHERE w.Id = necropsy.animalid
                AND w.qcstate.publicdata = TRUE
                AND w.date = (SELECT MAX(w2.date)
                                FROM study.weight w2
                               WHERE w2.Id = necropsy.animalid
                                 AND w2.qcstate.publicdata = TRUE
                                 AND w2.weight IS NOT NULL)) AS DOUBLE) AS weight
      ,animalid.Demographics.medical                        AS medical
      ,animalid.curLocation.room                            AS cur_room
      ,animalid.curLocation.cage                            AS cur_cage
      ,animalid.curLocation.cond.title                      AS cur_cond
      ,date
      ,created
      ,caseno
      ,causeofdeath                                         AS death_type
      ,project
      ,protocol
      ,account
      ,performedby                                          AS pathologist
      ,location
      ,delivery_option.title                                AS who_delivers
      ,shipping_comment                                     AS delivery_comment
      ,qcstate
      ,(SELECT GROUP_CONCAT((a.remark || ' (' || COALESCE(CAST(a.project AS VARCHAR), 'no proj.') || ')'), '; ') as x
          FROM study.NecropsyAbstract a
         WHERE a.Id = necropsy.animalid)                    AS remark
      ,CASE WHEN EXISTS (SELECT 1 FROM study.tissue_samples t WHERE t.taskid = necropsy.lsid
                           AND t.ship_to = javaConstant('org.labkey.wnprc_ehr.schemas.SqlQueryReferencePoints.COURIER_TO_AVRL'))
            THEN TRUE ELSE FALSE END                        AS has_tissues_for_avrl
      ,CASE WHEN EXISTS (SELECT 1 FROM study.tissue_samples t WHERE t.taskid = necropsy.lsid
                           AND t.ship_to = javaConstant('org.labkey.wnprc_ehr.schemas.SqlQueryReferencePoints.COURIER_TO_WIMR'))
            THEN TRUE ELSE FALSE END                        AS has_tissues_for_wimr
      ,CASE WHEN EXISTS (SELECT 1 FROM study.tissue_samples t WHERE t.taskid = necropsy.lsid
                           AND t.ship_to = javaConstant('org.labkey.wnprc_ehr.schemas.SqlQueryReferencePoints.COURIER_TO_CCOURT'))
            THEN TRUE ELSE FALSE END                        AS has_tissues_for_ccourt
      ,CASE WHEN EXISTS (SELECT 1 FROM study.tissue_samples t WHERE t.taskid = necropsy.lsid
                           AND t.ship_to = javaConstant('org.labkey.wnprc_ehr.schemas.SqlQueryReferencePoints.COURIER_TO_BMQ'))
            THEN TRUE ELSE FALSE END                        AS has_tissues_for_bmq
      ,CASE WHEN EXISTS (SELECT 1 FROM study.tissue_samples t WHERE t.taskid = necropsy.lsid
                           AND t.ship_to = javaConstant('org.labkey.wnprc_ehr.schemas.SqlQueryReferencePoints.COURIER_TO_ELEMENTS'))
            THEN TRUE ELSE FALSE END                        AS has_tissues_for_elements
      ,state
 FROM (SELECT taskid           AS lsid
             ,taskid.rowid     AS taskid
             ,Id               AS animalid
             ,"date"
             ,created
             ,caseno
             ,causeofdeath
             ,project
             ,project.protocol AS protocol
             ,account
             ,shipping
             ,shipping_comment
             ,location
             ,performedby
             ,qcstate.label    AS qcstate
             ,taskid.qcstate   AS state
        FROM study.necropsy
       WHERE taskid IS NOT NULL) necropsy
/* Look up the display friendly name for the delivery option. */
 LEFT JOIN wnprc.necropsy_delivery_options delivery_option
   ON necropsy.shipping = delivery_option.key
