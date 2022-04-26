SELECT Id,
       date,
       project  AS project,
       DataSet.Label AS dataset,
       DataSet.Name AS DataSetName,
       remark,
       description,
       performedby,
       qcstate,
       taskid,
       requestid
FROM study.studyData

UNION ALL
SELECT
    Id AS Id,
    date,
    project AS project,
    'Water Given (Total)' AS dataset,
    'watertotal' AS DataSetName,
    CASE
         WHEN (remark IS NOT NULL AND remark !='') THEN
             ('Sum of all water given for the day.' || CHR(10)
                 || remark)
             ELSE
            'Sum of all water given for the day.'
    END AS remark,
    CASE
         WHEN (provideFruit IS NOT NULL AND provideFruit != '') THEN
            ('Total Water for the day equals: ' || TotalWater || 'ml' || CHR(10)
            || 'Food provided: ' || provideFruit)
         ELSE
            ('Total Water for the day equals: ' || TotalWater || 'ml')
    END AS description,
    performedConcat AS performedBy,
    qcstate AS qcstate,
    null AS  taskid,
    null AS requestid

FROM study.waterTotalByDate
WHERE TotalWater IS NOT NULL