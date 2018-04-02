EHR.model.DataModelManager.registerMetadata('Husbandry', {
    allQueries: {
        remark: {
            shownInGrid: false
        }
    },
    byQuery: {
        'study.foodDeprives':{
            location:{
                width: 100,
                columnConfig: {
                    width: 100
                }
            },
            account: {
                shownInGrid: true,
                columnConfig: {
                    displayAfterColumn: 'project'
                }
            },
            project: {
                xtype: 'ehr-projectentryfield',
                disable: true,
                editorConfig: {

                },
                shownInGrid: true,
                useNull: true,
                lookup: {
                    columns: 'project,name,displayName,protocol'
                },
                columnConfig: {
                    width: 120
                }
            },
            schedule:{
                allowBlank: false,
                columnConfig: {
                    width: 130
                },
                lookup:{
                    display: 'title',
                    value: 'value',
                    columns:'*',
                    sort: 'sort_order'
                }

            },
            /*date:{
                xtype: 'datefield',
                extFormat: 'Y-m-d',
                minValue: Ext4.Date.add(new Date(), Ext4.Date.DAY, 4),
                editorConfig: {
                    dateConfig: {
                        minValue: Ext4.Date.add(new Date(), Ext4.Date.DAY, 4)
                    }

                },
                allowBlank:true,
                columnConfig: {
                    width:140
                }
            },*/
            protocolContact: {
                //xtype: 'ehr-projectentryfield',
                xtype: 'ehr-protocolStaffField',

                shownInGrid: true,
                useNull: true,
                columnConfig: {
                    width: 120
                }
            },
            depriveStartTime:{
                xtype: 'xdatetime',
                allowBlank : true,
                extFormat: 'Y-m-d H:i',
                hidden: false,
                columnConfig : {
                    width: 150
                }
            },
            restoredTime:{
                xtype: 'xdatetime',
                extFormat: 'Y-m-d H:i',
                columnConfig:{
                    width: 140
                },
                shownInGrid: true,
                hidden: false,
                allowBlank: true
            },
            reason:{
                width: 500,
                columnConfig:{
                    width:200
                },
                hidden :true,
                shownInGrid: false
            },
            remarks:{
                width: 500
            },
            depriveStartedBy:{
                hidden: true,
                shownInGrid: false,
                allowBlank: true
            },
            foodRestoredBy:{
                hidden: true,
                shownInGrid: false,
                allowBlank: true
            },
            startedTaskId:{
                hidden: true,
                shownInGrid: false
            },
            QCState:{
                hidden: false

            }

        },
        'ehr.requests':{
            priority:{
                hidden: true
            },
            QCState:{
                setInitialValue: function(v){
                    var qc;
                    if(!v && EHR.Security.getQCStateByLabel('Request: Approved'))
                        qc = EHR.Security.getQCStateByLabel('Request: Approved').RowId;
                    return v || qc;
                }
            }
        }
    }

});