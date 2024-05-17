SELECT
    Id,
    date,
    project,
    project.account.alias AS debitedAccount,
    project.account.tier_rate.tierRate AS otherRate,
    objectid AS sourceRecord,
    ('Blood Draws ' || Id) AS comment,
    CAST(num_tubes as DOUBLE) AS quantity,
    taskId,
    performedby
FROM studyLinked.BloodSchedule bloodSch
WHERE
    billedBy.value = 'c' AND
    qcstate.publicdata = true