SELECT
lsid,
necropsy.taskid,
animalid,
animalid.curLocation.room as cur_room,
animalid.curLocation.cage as cur_cage,
animalid.curLocation.cond.title as cur_cond,
date,
created,
caseno,
project,
protocol,
account,
performedby as pathologist,
location,
delivery_option.title as who_delivers,
shipping_comment as delivery_comment,
CASE
  WHEN hasTissuesForAvrl IS NULL THEN FALSE
  ELSE true
END as has_tissues_for_avrl,
state


FROM (
  SELECT
  taskid as lsid,
  taskid.rowid as taskid,
  Id as animalid,
  "date",
  created,
  caseno,
  project,
  project.protocol as protocol,
  account,
  shipping,
  shipping_comment,
  location,
  performedby,
  taskid.qcstate as state

  FROM study.necropsy
  WHERE taskid IS NOT NULL
) necropsy

/*
 * Look up the display friendly name for the delivery option.
 */
LEFT JOIN wnprc.necropsy_delivery_options delivery_option
ON (
  necropsy.shipping = delivery_option.key
)

/*
 * Flag necropsies that have tissues that need to be couried to AVRL.
 */
LEFT JOIN (
  SELECT taskid, true as hasTissuesForAvrl
  FROM tissue_samples
  WHERE ship_to = javaConstant('org.labkey.wnprc_ehr.schemas.SqlQueryReferencePoints.COURIER_TO_AVRL') -- 'COURIER_AVRL'
  GROUP BY taskid
) avrl_tissues
ON (
  necropsy.lsid = avrl_tissues.taskid
)