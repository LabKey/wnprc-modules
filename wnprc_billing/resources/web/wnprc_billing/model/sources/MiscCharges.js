/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

EHR.model.DataModelManager.registerMetadata('Charges', {
    byQuery: {
        'ehr_billing.miscCharges': {
            Id: {
                hidden: false,
                columnConfig: {
                    width: 75
                },
                nullable: false
            },
            project: {
                xtype: 'wnprc_billing-projectentryfield',
                hidden: false,
                nullable: false,
                lookup: {
                    columns: 'project'
                }
            },
            debitedaccount: {
                hidden: true
            },
            investigator: {
                xtype: 'wnprc_billing-investigatorfield',
                hidden: false,
                userEditable: true,
                columnConfig: {
                    width: 200
                },
                lookup: {
                    schemaName: 'ehr',
                    queryName: 'projectsWithInvestigators',
                    keyColumn: 'investigatorWithName',
                    columns: 'project, investigatorId, investigatorWithName',
                    displayColumn: 'investigatorWithName'
                }
            },
            chargeId: {
                xtype: 'wnprc_billing-chargeitemfield',
                hidden: false,
                userEditable: true,
                columnConfig:{
                    width: 200
                },
                lookup: {
                    columns: 'rowid, name, chargeCategoryId, departmentCode, startDate, endDate'
                },
            },
            date: {
                hidden: false,
                xtype: 'wnprc_billing-miscchargesdatefield',
                columnConfig: {
                    width: 125
                }
            },
            chargeGroup: {
                hidden: false,
                xtype: 'wnprc_billing-chargegroupentryfield',
                columnConfig: {
                    width: 175
                }
            },
            comment: {
                hidden: false,
                xtype: 'textfield',
                anchor: '50%',
                height: 20,
                columnConfig: {
                    width: 300
                }
            },
            chargetype: {
                hidden: false,
                columnConfig: {
                    width: 125
                }
            },
            chargeCategory: {
                hidden: true
            }
        }
    }
});