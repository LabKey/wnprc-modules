-- this sql is for the template so that users can upload data using the category name ins
SELECT
chargeGroupName,
chargeCategoryId AS chargeCategoryName
FROM
wnprc_billing.groupCategoryAssociations