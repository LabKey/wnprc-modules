DROP TABLE wnprc_billing.chargeableItemCategories;

DROP TABLE wnprc_billing.dataAccess;

TRUNCATE TABLE wnprc_billing.tierRates;
ALTER TABLE wnprc_billing.tierRates ADD container ENTITYID NOT NULL;
ALTER TABLE wnprc_billing.tierRates ADD CONSTRAINT FK_WNPRC_BILLING_TIERRATES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX IX_WNPRC_BILLING_TIERRATES_CONTAINER ON wnprc_billing.tierRates (Container);

DROP TABLE wnprc_billing.affiliates;
DROP TABLE wnprc_billing.aliasCategories;
DROP TABLE wnprc_billing.aliasTypes;
DROP TABLE wnprc_billing.annualRateChange;
DROP TABLE wnprc_billing.chargeUnitAccounts;
DROP TABLE wnprc_billing.creditAccount;
DROP TABLE wnprc_billing.fiscalAuthorities;
DROP TABLE wnprc_billing.grantProjects;
DROP TABLE wnprc_billing.grants;
DROP TABLE wnprc_billing.iacucFundingSources;
DROP TABLE wnprc_billing.labworkFeeDefinition;
DROP TABLE wnprc_billing.leaseFeeDefinition;
DROP TABLE wnprc_billing.medicationFeeDefinition;
DROP TABLE wnprc_billing.perdiemfeedefinition;
DROP TABLE wnprc_billing.procedureFeeDefinition;
DROP TABLE wnprc_billing.projectAccountHistory;
DROP TABLE wnprc_billing.projectMultipliers;