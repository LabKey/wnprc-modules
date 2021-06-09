/* This query feeds the Necropsy Schedule JSP page/calendar. */
SELECT lsid
      ,necropsy.taskid
      ,animalid
      ,animalid.Demographics.gender    AS sex
      ,animalid.age.ageFriendly        AS age
      ,animalid.Demographics.weight    AS weight
      ,animalid.Demographics.medical   AS medical
      ,animalid.curLocation.room       AS cur_room
      ,animalid.curLocation.cage       AS cur_cage
      ,animalid.curLocation.cond.title AS cur_cond
      ,date
      ,created
      ,caseno
      ,causeofdeath                    AS death_type
      ,project
      ,protocol
      ,account
      ,performedby                     AS pathologist
      ,location
      ,delivery_option.title           AS who_delivers
      ,shipping_comment                AS delivery_comment
      ,animalid.Demographics.necropsyAbstractNotes.remark as remark
      ,CASE
       WHEN hasTissuesForAvrl IS NULL
         THEN FALSE
         ELSE TRUE
       END                             AS has_tissues_for_avrl
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
             ,taskid.qcstate   AS state
        FROM study.necropsy
       WHERE taskid IS NOT NULL) necropsy
/* Look up the display friendly name for the delivery option. */
 LEFT JOIN wnprc.necropsy_delivery_options delivery_option
   ON necropsy.shipping = delivery_option.key
/* Flag necropsies that have tissues that need to be couriered to AVRL. */
 LEFT JOIN (SELECT taskid
                  ,TRUE AS hasTissuesForAvrl
              FROM tissue_samples
             WHERE ship_to = javaConstant('org.labkey.wnprc_ehr.schemas.SqlQueryReferencePoints.COURIER_TO_AVRL') -- 'COURIER_AVRL'
             GROUP BY taskid) avrl_tissues
   ON necropsy.lsid = avrl_tissues.taskid