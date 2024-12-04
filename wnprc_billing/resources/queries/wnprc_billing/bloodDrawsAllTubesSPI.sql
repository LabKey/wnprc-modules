SELECT
    Id,
    date,
    project,
    coalesce(account, project.account.alias) as debitedAccount,
    coalesce(a.tier_rate.tierRate, project.account.tier_rate.tierRate) as otherRate,
    group_concat(objectid,';') as objectids,
    ('Blood Draws ' || Id ) as comment,
    CAST(1 AS DOUBLE) AS quantity,
    group_concat(taskid, ';') as taskids,
    group_concat(performedby, ';') as performedby
FROM studyLinked.BloodSchedule bloodSch
    LEFT JOIN ehr_billing.aliases a ON bloodSch.account = a.alias
WHERE
    billedBy.value = 'c' AND
    qcstate.publicdata = true

GROUP BY id, date, project, coalesce(account, project.account.alias), coalesce(a.tier_rate.tierRate, project.account.tier_rate.tierRate);
