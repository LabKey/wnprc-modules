/*
 * Copyright (c) 2010-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/*
This script is designed to alter postgres settings on a staging/development server following a full postgres dump from
a production server.  This script comes with no guarantee whatsoever.  Test prior to use.

Sections below can be commented/uncommented depending on your needs

*/

--use labkey;
--'use' doesnt appear supported in postgres
--maybe alternative is \c.  ie: postgres=# \c labkey



--will inactivate all users except site admins and labkey
-- update   core.Principals
-- SET      Active = FALSE
-- WHERE type = 'u'
--       AND UserId NOT IN (select p.UserId from core.Principals p inner join core.Members m on (p.UserId = m.UserId and m.GroupId=-1))
--       AND Name NOT LIKE '%@labkey.com'
--       --AND Name NOT IN ('someuser@myServer.com', 'someOtherUser@myServer.com')
-- ;


UPDATE    prop.Properties p
SET       Value = 'https://test-ehr.primate.wisc.edu:8443'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'SiteConfig'
          AND p.Name = 'baseServerURL'
;

UPDATE    prop.Properties p
SET       Value = 'TestServer'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'LookAndFeel'
          AND p.Name = 'systemShortName'
;

UPDATE    prop.Properties p
SET       Value = 'EHR Test Server'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'LookAndFeel'
          AND p.Name = 'systemDescription'
;

UPDATE    prop.Properties p
SET       Value = 'Blue'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'LookAndFeel'
          AND p.Name = 'themeName'
;

--this is the test-ehr's analytics ID.
UPDATE    prop.Properties p
SET       Value = 'UA-12818769-2'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'analytics'
          AND p.Name = 'accountId'
;

--replace the mySQL server used.  use replace so we dont save the password here 
UPDATE    prop.Properties p
SET       Value = replace(Value, 'saimiri', 'colony-test')
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'wnprc.ehr.etl.config'
	      AND p.Name = 'jdbcUrl'
;

--turn off the ETL
UPDATE    prop.Properties p
SET       Value = 0
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'wnprc.ehr.etl.config'
	      AND p.Name = 'runIntervalInMinutes'
;

--disable kinship calculations
UPDATE    prop.Properties p
SET       Value = 'false'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'org.labkey.ehr.geneticcalculations'
  AND p.Name = 'enabled'
;

--disable ldap sync
UPDATE    prop.Properties p
SET       Value = 'false'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'ldk.ldapConfig'
  AND p.Name = 'enabled'
;

UPDATE    ehr.module_properties p
SET       stringvalue = 'test-ehr-do-not-reply@primate.wisc.edu'
WHERE     p.prop_name = 'site_email'
;



--for a PC
--set the R program path
-- UPDATE    prop.Properties p
-- SET       Value = 'C:\\Program Files\\R\\R-2.11.1-x64\\bin\\R.exe'
-- WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'UserPreferencesMap'
-- 	      AND p.Name = 'RReport.RExe'
-- ;
-- UPDATE    prop.Properties p
-- SET       Value = 'C:\\Program Files\\R\\R-2.11.1-x64\\bin\\R.exe'
-- WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'ScriptEngineDefinition_R,r'
-- 	      AND p.Name = 'exePath'
-- ;


--set the R program path
UPDATE    prop.Properties p
SET       Value = '/usr/bin/R'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'UserPreferencesMap'
	      AND p.Name = 'RReport.RExe'
;
UPDATE    prop.Properties p
SET       Value = '/usr/bin/R'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'ScriptEngineDefinition_R,r'
	      AND p.Name = 'exePath'
;


--not used, but might be of interest
-- UPDATE    prop.Properties p
-- SET       Value = FALSE
-- WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'SiteConfig'
--             AND p.Name = 'sslRequired'
-- ;

UPDATE    prop.Properties p
SET       Value = '8443'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'SiteConfig'
            AND p.Name = 'sslPort'
;

-- UPDATE    prop.Properties p
-- SET       Value = 'c:\labkey_data'
-- WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'SiteConfig'
--             AND p.Name = 'webRoot'
-- ;

-- UPDATE    prop.Properties p
-- SET       Value = TRUE
-- WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'SiteConfig'
--             AND p.Name = 'adminOnlyMode'
-- ;

--not used, but might be of interest
-- INSERT into    core.Members m
-- (GroupId, UserId) VALUES (-1, (select userId from core.users WHERE email='yourEmail@wisc.edu')
-- ;

--TODO: change logo link to remove /labkey


DELETE FROM ehr.notificationrecipients WHERE (recipient <> 1975 OR recipient <> 1966);

--Delete
DELETE FROM googledrive.service_accounts WHERE id = '8c4a933c-2f8e-4094-9f43-46e80f14e163';

INSERT INTO ehr.notificationrecipients
(rowid, notificationtype,            container,                               createdby, created,                   modifiedby, modified,                   recipient)
VALUES
(1,     'Animal Death',	             '29e3860b-02b5-102d-b524-493dbd27b599',	1975,	     '2011-09-22 14:42:34.941',	1975,	      '2011-10-01 10:02:31.387',	1975),
(2,     'Orphan Alert',	             '29e3860b-02b5-102d-b524-493dbd27b599',	1975,	     '2012-09-19 15:05:43.634',	1975,	      '2012-09-19 15:05:43.634',	1975),
(3,	    'Weight Drops',	             '29e3860b-02b5-102d-b524-493dbd27b599',	1975,	     '2012-10-09 14:18:39.165',	1975,	      '2012-10-09 14:18:39.165',	1975),
(4,	    'Clinpath Admin Alerts',	   '29e3860b-02b5-102d-b524-493dbd27b599',	1047,	     '2012-03-21 08:38:38.942',	1966,	      '2013-02-18 17:30:17.841',	1975),
(46,	  'Clinpath Request - Stat',   '29e3860b-02b5-102d-b524-493dbd27b599',	1994,	     '2012-02-21 18:09:24.037',	1994,	      '2012-02-21 18:09:24.037',	1975),
(11,	  'Prenatal Death',	           '29e3860b-02b5-102d-b524-493dbd27b599',	1005,	     '2011-09-27 09:33:45.283',	1005,	      '2011-09-27 09:33:45.283',	1975),
(17,	  'Clinpath Abnormal Results', '29e3860b-02b5-102d-b524-493dbd27b599',	1005,	     '2011-09-27 13:05:55.242',	1005,	      '2011-09-27 13:05:55.242',	1975),
(19,	  'Clinpath Admin Alerts',	   '29e3860b-02b5-102d-b524-493dbd27b599',	1005,	     '2011-09-27 13:06:43.638',	1005,	      '2011-09-27 13:07:51.938',	1975),
(20,	  'Clinpath Results',	         '29e3860b-02b5-102d-b524-493dbd27b599',	1005,	     '2011-09-27 13:08:19.64',	1005,	      '2011-09-27 13:08:19.64',	  1975),
(26,	  'Colony Management Alerts',	 '29e3860b-02b5-102d-b524-493dbd27b599',	1005,	     '2011-09-27 13:09:46.475',	1005,	      '2011-09-27 13:09:46.475',	1975),
(28,	  'Overdue Weight Alerts',	   '29e3860b-02b5-102d-b524-493dbd27b599',	1005,	     '2011-09-27 13:10:15.83',	1005,	      '2011-09-27 13:10:15.83',	  1975),
(32,	  'Incomplete Treatments',	   '29e3860b-02b5-102d-b524-493dbd27b599',	1005,	     '2011-09-27 13:11:20.188',	1005,	      '2011-09-27 13:11:20.188',	1975)
;

-- Switch to using non-ssl LDAP
UPDATE    prop.Properties p
SET       Value = 'ldap://ldap.primate.wisc.edu'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'LDAPAuthentication'
	      AND p.Name = 'Servers'
;

-- We've left a bit of a mess, so it's best to vacuum before guests arrive.  (Deleting doesn't reclaim the space on it's own, and we just deleted 40-50GB)
--VACUUM FULL;
