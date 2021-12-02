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
     'Sum of all water given for the day.' AS remark,
     'Total Water for the day equals: ' || TotalWater || 'ml' AS description,
     performedConcat AS performedBy,
     qcstate AS qcstate,
     null AS  taskid,
     null AS requestid

FROM study.waterTotalByDate
WHERE TotalWater IS NOT NULL