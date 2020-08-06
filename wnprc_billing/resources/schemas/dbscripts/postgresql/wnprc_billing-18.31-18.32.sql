DROP TABLE wnprc_billing.groups;

-- Table to hold Charge Group Category Associations
CREATE TABLE wnprc_billing.groupCategoryAssociations(
    rowId SERIAL NOT NULL,
    chargeGroupName varchar(200),
    chargeCategoryId int,

    container ENTITYID NOT NULL,
    createdBy USERID,
    created timestamp,
    modifiedBy USERID,
    modified timestamp,

    CONSTRAINT PK_groupCategoryAssociations PRIMARY KEY (rowId),
    CONSTRAINT UQ_WNPRC_BILLING_GROUPCATEGORYASSOCIATIONS_GROUP_CATEGORY UNIQUE (chargeGroupName, chargeCategoryId),

    CONSTRAINT FK_WNPRC_BILLING_GROUPCATEGORYASSOCIATIONS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId),
    CONSTRAINT FK_WNPRC_BILLING_GROUPCATEGORYASSOCIATIONS_CHARGEGROUPNAME FOREIGN KEY (chargeGroupName) REFERENCES ehr_billing.chargeUnits (groupName),
    CONSTRAINT FK_WNPRC_BILLING_GROUPCATEGORYASSOCIATIONS_CHARGECATEGORYID FOREIGN KEY (chargeCategoryId) REFERENCES ehr_billing.chargeableItemCategories (rowid)

);

CREATE INDEX IDX_WNPRC_BILLING_GROUPCATEGORYASSOCIATIONS_CONTAINER ON wnprc_billing.groupCategoryAssociations (Container);
CREATE INDEX IDX_WNPRC_BILLING_GROUPCATEGORYASSOCIATIONS_CHARGEGROUPNAME ON wnprc_billing.groupCategoryAssociations (chargeGroupName);
CREATE INDEX IDX_WNPRC_BILLING_GROUPCATEGORYASSOCIATIONS_CHARGECATEGORYID ON wnprc_billing.groupCategoryAssociations (chargeCategoryId);

-- Updates to match the data under given column names --

-- Data under 'chargetype' was really group data, so move that to newly added chargeGroup column
UPDATE ehr_billing.miscCharges set chargeGroup = chargetype WHERE chargeGroup IS NULL AND chargetype IS NOT NULL;

-- 'Adjustment' or 'Reversal' values under chargeCategory column was confusing since column name is too close to chargeableItems' category.
-- So moving data from chargeCategory under appropriate sounding column 'chargetype'
UPDATE ehr_billing.miscCharges set chargetype = chargeCategory WHERE chargeCategory IN ('Adjustment', 'Reversal');

-- chargeCategory will remain empty in miscCharges table. (ChargebleItem's charge category can be accessed via chargeId.chargeableItems.chargeCategoryId)
UPDATE ehr_billing.miscCharges set chargeCategory = null;