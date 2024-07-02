SELECT
    Id,
    date,
    project,
    coalesce(account, project.account.alias) AS debitedAccount,
    coalesce(a.tier_rate.tierRate, project.account.tier_rate.tierRate) as otherRate,
    objectid AS sourceRecord,
    ('Blood Draws ' || Id) AS comment,
    CAST(num_tubes as DOUBLE) AS quantity,
    taskId,
    performedby
FROM studyLinked.BloodSchedule bloodSch
    LEFT JOIN ehr_billing.aliases a ON bloodSch.account = a.alias
WHERE
    billedBy.value = 'c' AND
    qcstate.publicdata = true