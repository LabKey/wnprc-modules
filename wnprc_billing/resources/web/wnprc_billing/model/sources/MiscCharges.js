/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('Charges', {
    byQuery: {
        'ehr_billing.miscCharges': {
            project: {
                xtype: 'wnprc_billing-projectentryfield',
                hidden: false,
                allowBlank: false,
                userEditable: true
            },
            investigator: {
                xtype: 'wnprc_billing-investigatorfield',
                hidden: false,
                userEditable: true,
                columnConfig: {
                    width: 250
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
                    columns: 'inves',
                    sort: 'inves'
                }
            },
            debitedaccount: {
                hidden: true
            }
        }
    }
});