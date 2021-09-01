SELECT Id,
       date,
       CAST (project AS VARCHAR) AS project,
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
    animalId AS Id,
    date,
     projectConcat AS project,
     'Water Given (Total)' AS dataset,
     'watertotal' AS DataSetName,
     'Sum of all water given for the day.' AS remark,
     'Total Water for the day equals: ' || TotalWater || 'ml' AS description,
     performedConcat AS performedBy,
     qcstate AS qcstate,
     null AS  taskid,
     null AS requestid

FROM study.waterPrePivot