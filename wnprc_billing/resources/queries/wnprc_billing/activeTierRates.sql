SELECT
    tierRateType,
    tierRate,
    startDate,
    endDate,
    isActive
FROM wnprc_billing.tierRates
WHERE isActive = true