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
                    width: 150
                },
                editorConfig: {
                  caseSensitive: false,
                  id: 'wnprc_billing-Charges-investigator',
                  valueField: 'inves',
                  displayField: 'inves',
                  observedField: 'project',
                  observerLookupField: 'project'
                },
                lookup: {
                    schemaName: 'ehr',
                    queryName: 'project',
                    keyColumn: 'inves',
                    displayColumn: 'inves',
                    columns: 'inves'
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
                    columns: 'rowId, name, chargeCategoryId, departmentCode, startDate, endDate'
                },
                editorConfig: {
                    caseSensitive: false,
                    id: 'ehr_billing-Misc-charges-chargeId',
                    valueField: 'rowId',
                    displayField: 'name',
                    observedField: 'chargetype',
                    observerLookupField: 'departmentCode'
                }
            },
            date: {
                hidden: false,
                xtype: 'wnprc_billing-miscchargesdatefield',
                columnConfig: {
                    width: 125
                }
            },
            chargetype: {
                hidden: false,
                xtype: 'wnprc_billing-chargetypeentryfield',
                columnConfig: {
                    width: 175
                }
            },
            comment: {
                hidden: false,
                xtype: 'textareafield',
                anchor: '50%',
                height: 20,
                columnConfig: {
                    width: 200
                }
            },
            chargeCategory: {
                hidden: false,
                columnConfig: {
                    width: 125
                }
            },
        }
    }
});