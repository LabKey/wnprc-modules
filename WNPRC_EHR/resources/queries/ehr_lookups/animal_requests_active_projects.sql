SELECT *
FROM (
  SELECT
  project.project AS project,
  project.protocol AS protocol,
  COALESCE(project$protocol$.external_id, project$protocol$.protocol) AS "protocol$displayName",
  project.account AS account,
  project.inves AS inves,
  project.inves2 AS inves2,
  project.avail AS avail,
  project$avail$.value AS "avail$value",
  project.title AS title,
  project.research AS research,
  project.use_category AS use_category,
  project.reqname AS reqname,
  project.contact_emails AS contact_emails,
  project.startdate AS startdate,
  project.enddate AS enddate,
  project.projecttype AS projecttype,
  project.shortname AS shortname,
  project.container AS container,
  COALESCE(project$container$.title, project$container$.name) AS "container$DisplayName",
  COALESCE(project.name, CAST(project.project AS varchar)) AS displayName,
  project$protocol$.protocol AS protocol_fs_protocol,
  project$protocol$.container AS protocol_fs_container,
  project$avail$.container AS avail_fs_container
  FROM (SELECT * FROM ehr.project) project
      LEFT OUTER JOIN (SELECT * FROM ehr.protocol) project$protocol$ ON (project.protocol = project$protocol$.protocol)
      LEFT OUTER JOIN (SELECT * FROM ehr_lookups.lookups
  WHERE (set_name = 'avail_codes') AND (container='29e3860b-02b5-102d-b524-493dbd27b599'/* EHR */)) project$avail$ ON (project.avail = project$avail$.value)
      LEFT OUTER JOIN (SELECT * FROM core.containers
  WHERE (1=1)) project$container$ ON (project.container = project$container$.entityid)) x
WHERE ("protocol$displayName" IS NOT NULL)
ORDER BY project ASC