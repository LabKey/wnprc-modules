/*
 * Before running this SQL script, run the pg_testserver_change.sql.  This just contains the additional changes
 * after that to make it work with development boxes.
 */

DROP SCHEMA oconnor CASCADE;

UPDATE exp.propertydescriptor SET scale = 64 WHERE name IN ('FirstName', 'LastName', 'Phone', 'Mobile', 'Pager', 'IM') AND propertyuri LIKE '%:ExtensibleTable-core-Users.Folder-%' AND scale = 0;
UPDATE exp.propertydescriptor SET scale = 255 WHERE name IN ('Description') AND propertyuri LIKE '%:ExtensibleTable-core-Users.Folder-%' AND scale = 0;

UPDATE prop.properties SET value = FALSE WHERE (set = 1 AND name = 'sslRequired');
UPDATE prop.properties SET value = 'http://localhost:8080' WHERE (set = 1 AND name = 'baseServerURL');