/*
 *  This is a special query that shows the templates for a given logged in user.  You need to impersonate another user
 *  to see how they would see this data.
 */


SELECT
entityid,
title,
userid as owner_id,
userid.displayName as owner_name,
formType as form_type,
description,
CASE WHEN (userid = USERID()) THEN true
     ELSE false
END as is_owner,
(userid IS NULL) as is_public,
CASE WHEN userid IS NULL THEN FALSE
     ELSE ISMEMBEROF(userid)
END as is_in_group,
createdBy.displayName as creator

FROM ehr.formtemplates