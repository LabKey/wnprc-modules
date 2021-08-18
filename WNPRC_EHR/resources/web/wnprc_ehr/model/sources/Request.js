EHR.model.DataModelManager.registerMetadata('WNPRC_Request', {
    allQueries: {
        account: {
            shownInGrid: true,
            columnConfig: {
                displayAfterColumn: 'project'
            }
        },
        //Category
        type: {
            columnConfig: {
                displayAfterColumn: "servicerequested"
            }
        },
        collectedBy: {
            columnConfig: {
                displayAfterColumn: "collectionMethod"
            }
        },
        dateReviewed: {
            hidden: true
        },
        clinremark: {
            hidden: true
        },
        reviewedBy: {
            hidden: true
        },
        servicerequested: {
            lookup: {
                queryName: 'filter_labwork' // Use the filter_labwork query to filter out disabled options.
            }
        },
        sampletype: {
            hidden: false,
            shownInGrid: true
        }
    },
    byQuery: {
        'study.waterAmount':{
            project: {
                xtype: 'ehr-projectentryfield',
                editorConfig: {

                },
                shownInGrid: true,
                useNull: true,
                allowBlank: false,
                lookup: {
                    columns: 'project,name,displayName,protocol'
                },
                columnConfig: {
                    width: 120
                }
            },
            date: {
                xtype: 'datefield',
                format:'Y-m-d',
                allowBlank: false,
                editorConfig: {
                    minValue: new Date()
                },
                columnConfig:{
                    width: 110
                },
                helpPopup: 'Choose the date when the water amount should happen.',
                onExpand: function() {
                    var value = this.getValue();
                    this.picker.setValue(Ext.isDate(value) ? value : new Date());
                }


            },
            requestid:{
                hidden: true,
                shownInGrid: false

            },
            QCState: {
                setInitialValue: function(v){
                    var qc;
                    if(!v && EHR.Security.getQCStateByLabel('Scheduled'))
                        qc = EHR.Security.getQCStateByLabel('Scheduled').RowId;
                    return v || qc;
                },
                shownInGrid: true,
                hidden: false
            }

        },
        'study.foodDeprives':{
            project: {
                xtype: 'ehr-projectentryfield',
                editorConfig: {

                },
                shownInGrid: true,
                useNull: true,
                allowBlank: false,
                lookup: {
                    columns: 'project,name,displayName,protocol'
                },
                columnConfig: {
                    width: 120
                }
            },
            account:{
                shownInGrid: false,
                hidden: true
            },
            protocolContact: {
                xtype: 'wnprcehr-protocolStaffField',

                shownInGrid: true,
                useNull: true,
                columnConfig: {
                    width: 120
                }
            },
            requestid:{
                hidden: true,
                shownInGrid: false

            },
            date: {
                xtype: 'datefield',
                label: 'Requested Dated',
                format:'Y-m-d',
                allowBlank: false,
                editorConfig: {
                    minValue: Ext4.Date.add(new Date(), Ext4.Date.DAY, 1)
                },
                columnConfig:{
                    width: 110
                },
                helpPopup: 'Choose the date when the food deprive should happen.',
                onExpand: function() {
                    var value = this.getValue();
                    this.picker.setValue(Ext.isDate(value) ? value : Ext4.Date.add(new Date(), Ext4.Date.DAY, 1));
                }


            },
            schedule:{
                allowBlank: false,
                lookup:{
                    display:'title',
                    columns: '*',
                    sort: 'sort_order'
                },
                width: 500,
                columnConfig: {
                    width: 120
                }
            },
            QCState: {
                setInitialValue: function(v){
                    var qc;
                    if(!v && EHR.Security.getQCStateByLabel('Request: Approved'))
                        qc = EHR.Security.getQCStateByLabel('Request: Approved').RowId;
                    return v || qc;
                },
                shownInGrid: false,
                hidden: false,
                editorConfig: {
                    editable: true,
                    listWidth: 200,
                    disabled: true
                },
                columnConfig: {
                    width: 70
                }
            },
            restoredTime:{
                hidden: true,
                shownInGrid: false,
                allowBlank: true
            },
            depriveStartTime:{
                hidden: true,
                shownInGrid: false,
                allowBlank: true
            },
            reason:{
                width: 500,
                showInGrid : true,
                allowBlank: false,
                columnConfig:{
                    width: 200
                }

            },
            remarks:{
                width: 500,
                hidden: false,
                showInGrid: true,
                columnConfig:{
                    width:200
                }
            },
            separated:{
                hidden: true,
                shownInGrid: false,
                allowBlank: true
            },
            assignedTo:{
                allowBlank: false
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
            }

        },
        'study.necropsy': {
            grossdescription: {
                hidden: true
            },
            histologicalDescription: {
                hidden: true
            },
            patho_notes: {
                hidden: true
            },
            performedby: {
                hidden: true
            },
            pathologist: {
                hidden: true
            },
            comments: {
                hidden: false
            }
        }
    }
});