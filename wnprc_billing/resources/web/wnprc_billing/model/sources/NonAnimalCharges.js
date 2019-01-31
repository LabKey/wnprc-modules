EHR.model.DataModelManager.registerMetadata('NonAnimalCharges', {
    allQueries: {

    },
    byQuery: {
        'ehr_billing.miscCharges': {
            Id: {
                hidden: true
            },
            project: {
                hidden: true
            },
            debitedaccount: {
                hidden: false,
                xtype: 'wnprc_billing-miscchargesdebitacctentryfield',
                columnConfig: {
                    width: 125
                }
            },
            investigator: {
                hidden: false,
                columnConfig: {
                    width: 250
                },
                xtype: 'ehr_billingRowObserverEntryField',
                lookup: {
                    schemaName: 'ehr_billing',
                    queryName: 'aliases',
                    keyColumn: 'investigatorName',
                    displayColumn: 'investigatorName',
                    columns: 'alias, investigatorName'
                },
                editorConfig: {
                    caseSensitive: false,
                    id: 'wnprc_billing-debitAcct-investigator',
                    valueField: 'investigatorName',
                    displayField: 'investigatorName',
                    observedField: 'debitedAccount',
                    observerLookupField: 'alias'
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
                    id: 'ehr_billing-nonAnimalCharges-chargeId',
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