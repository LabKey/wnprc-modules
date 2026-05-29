/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* This query feeds the Necropsy Schedule JSP page/calendar. */
SELECT lsid
      ,necropsy.taskid
      ,animalid
      ,animalid.Demographics.gender                         AS sex
      ,animalid.age.ageFriendly                             AS age
      ,animalid.mostRecentWeight.mostRecentWeight           AS weight
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
      ,animalid.Demographics.necropsyAbstractNotes.remark   AS remark
      ,CASE
      WHEN hasTissuesForAvrl IS NULL
         THEN FALSE
         ELSE TRUE
       END                                                  AS has_tissues_for_avrl
      ,CASE
       WHEN hasTissuesForWimr IS NULL
         THEN FALSE
         ELSE TRUE
       END                                                  AS has_tissues_for_wimr
      ,CASE
       WHEN hasTissuesForCcourt IS NULL
         THEN FALSE
         ELSE TRUE
       END                                                  AS has_tissues_for_ccourt
      ,CASE
       WHEN hasTissuesForBmq IS NULL
         THEN FALSE
         ELSE TRUE
       END                                                  AS has_tissues_for_bmq
      ,CASE
       WHEN hasTissuesForElements IS NULL
         THEN FALSE
         ELSE TRUE
       END                                                  AS has_tissues_for_elements
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
             ,qcstate.label as qcstate
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
/* Flag necropsies that have tissues that need to be couriered to WIMR. */
 LEFT JOIN (SELECT taskid
                  ,TRUE AS hasTissuesForWimr
              FROM tissue_samples
             WHERE ship_to = javaConstant('org.labkey.wnprc_ehr.schemas.SqlQueryReferencePoints.COURIER_TO_WIMR') -- 'COURIER_WIMR'
             GROUP BY taskid) wimr_tissues
   ON necropsy.lsid = wimr_tissues.taskid
 LEFT JOIN (SELECT taskid
                  ,TRUE AS hasTissuesForCcourt
              FROM tissue_samples
             WHERE ship_to = javaConstant('org.labkey.wnprc_ehr.schemas.SqlQueryReferencePoints.COURIER_TO_CCOURT') -- 'COURIER_WIMR'
             GROUP BY taskid) ccourt_tissues
   ON necropsy.lsid = ccourt_tissues.taskid
 LEFT JOIN (SELECT taskid
                  ,TRUE AS hasTissuesForBmq
              FROM tissue_samples
             WHERE ship_to = javaConstant('org.labkey.wnprc_ehr.schemas.SqlQueryReferencePoints.COURIER_TO_BMQ') -- 'COURIER_WIMR'
             GROUP BY taskid) bmq_tissues
   ON necropsy.lsid = bmq_tissues.taskid
 LEFT JOIN (SELECT taskid
                  ,TRUE AS hasTissuesForElements
              FROM tissue_samples
             WHERE ship_to = javaConstant('org.labkey.wnprc_ehr.schemas.SqlQueryReferencePoints.COURIER_TO_ELEMENTS') -- 'COURIER_WIMR'
             GROUP BY taskid) elements_tissues
   ON necropsy.lsid = elements_tissues.taskid
