SELECT
    ci.rowid,
    ci.name ||' - '|| ci.departmentCode AS chargeItem,
FROM ehr_billing.chargeableItems ci
