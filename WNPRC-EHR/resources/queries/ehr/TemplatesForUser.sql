/*
 *  This is a special query that shows the templates for a given logged in user.  You need to impersonate another user
 *  to see how they would see this data.
 */

/*
SELECT *,
(userid = USERID()) as isOwner,
(userid IS NULL) as isPublic

FROM ehr.formtemplates
WHERE userid = USERID() OR ISMEMBEROF(userid) OR userid IS NULL
*/

SELECT
entityid,
title,
form_type,
description,
userid,
COUNT(*) as num_recs

FROM (

SELECT
entityid,
title,
formType as form_type,
description,
userid,
recs.rowid as rec_row_id

FROM ehr.my_formtemplates forms
LEFT JOIN ehr.formtemplaterecords recs
ON (
  forms.entityid = recs.templateid
)

)
GROUP BY entityid, title, form_type, description, userid