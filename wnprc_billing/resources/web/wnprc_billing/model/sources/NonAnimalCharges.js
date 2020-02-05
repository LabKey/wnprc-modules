EHR.model.DataModelManager.registerMetadata('NonAnimalCharges', {
    allQueries: {

    },
    byQuery: {
        'ehr_billing.miscCharges': {
            Id: {
                hidden: true,
                allowBlank: true,
                nullable: true

            },
            project: {
                hidden: true,
                allowBlank: true
            },
            debitedaccount: {
                hidden: false,
                xtype: 'wnprc_billing-miscchargesdebitacctentryfield',
                lookup: {
                    schemaName: 'ehr_billing',
                    queryName: 'aliases',
                    filterArray: [LABKEY.Filter.create('isAcceptingCharges', 'N', LABKEY.Filter.Types.NEQ_OR_NULL)]
                },
                columnConfig: {
                    width: 125
                }
            },
            investigator: {
                hidden: false,
                columnConfig: {
                    width: 250
                },
                xtype: 'wnprc_billing-investigatorfield',
                lookup: {
                    schemaName: 'ehr',
                    queryName: 'aliasesWithInvestigators',
                    keyColumn: 'investigatorWithName',
                    columns: 'investigatorWithName',
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
                    columns: 'rowId, name, chargeCategoryId, departmentCode, startDate, endDate'
                }
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
                    width: 200
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