SELECT
*,
investigatorId.investigatorWithName
FROM ehr_billing_public.aliases
WHERE investigatorId IS NOT NULL