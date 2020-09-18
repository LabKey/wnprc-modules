PARAMETERS
(START_DATE TIMESTAMP, END_DATE TIMESTAMP)

SELECT o.id
     , o.housingattime.roomattime
     , o.housingattime.cageattime
     --, o.id.curlocation.cage
     , o.date
     , o.behavior
     , o.otherbehavior
FROM study.obs o
WHERE o.date <= END_DATE AND o.date >= START_DATE
AND (o.behavior IS NOT NULL OR o.otherbehavior IS NOT NULL)