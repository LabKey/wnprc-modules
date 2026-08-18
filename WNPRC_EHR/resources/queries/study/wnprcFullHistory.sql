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
         WHEN (remarksConcat IS NOT NULL AND remarksConcat !='') THEN
             ('Sum of all water given for the day.' || CHR(10)
                 || remarksConcat)
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

UNION ALL
SELECT
    Id AS Id,
    date,
    null AS project,
    'Anesthesia Recovery' AS dataset,
    'anesthesiarecovery' AS DataSetName,
    'Animal fully recovered.' AS remark,
    'Total Recovery Time: ' || CAST(CEILING(totalRecoveryTime) AS VARCHAR) || ' minutes' || CHR(10) ||
    'Recovery Speed: ' || CAST(recoverySpeed AS VARCHAR) || CHR(10) ||
    'Recovery Condition: ' || CAST(recoveryCondition AS VARCHAR)
    AS description,
    submitterInitials AS performedBy,
    qcstate AS qcstate,
    taskid AS taskid,
    null AS requestid
FROM study.anesthesiaRecoveriesFullHistory
WHERE observation = 'Fully Recovered'