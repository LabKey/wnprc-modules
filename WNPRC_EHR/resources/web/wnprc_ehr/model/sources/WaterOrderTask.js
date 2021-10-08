EHR.model.DataModelManager.registerMetadata('WaterOrderTask', {
    allQueries: {
        remark: {
            shownInGrid: false
        }
    },
    byQuery: {
        'study.waterOrders':{
            id :{
                columnConfig: {
                    width:70
                }
            },
            project:{
                allowBlank: false,
                columnConfig: {
                    width:120
                },
            },
            account:{
                hidden: true,
                shownInGrid: false
            },
            date:{
                xtype: 'datefield',
                header: 'Start Date',
                extFormat: 'Y-m-d',
                /*defaultHour: 0,
                defaultMinutes: 0,*/
                allowBlank: false,
                editable: true,
                columnConfig: {
                    width:90
                },
                editorConfig: {
                    minValue: new Date()
                },
                defaultValue: new Date(new Date().setHours(0)).setMinutes(0),
                /*setInitialValue: function(v) {
                    debugger;
                    var date = (Ext4.Date.add(new Date(), Ext4.Date.DAY, 1));
                    date.setHours(0);
                    date.setMinutes(0);
                    return v || date;
                },*/
                onExpand: function() {
                    var value = this.getValue();
                    this.picker.setValue(Ext.isDate(value) ? value : Ext4.Date.add(new Date(), Ext4.Date.DAY, 1));
                }
            },
            enddate:{
                xtype: 'datefield',
                header: 'End Date',
                extFormat: 'Y-m-d',
                //  allowBlank: false,
                editable: true,
                columnConfig: {
                    width:90
                },
                editorConfig: {
                    minValue: Ext4.Date.add(new Date(), Ext4.Date.DAY, 2)
                }
            },
            waterSource:{
                defaultValue: 'regulated',
                allowBlank: 'false',
                lookup:{
                    schemaName: 'ehr_lookups',
                    queryName: 'water_source',
                    keyColumn: 'value',
                    displayColumn: 'title'
                }
            },
            volume:{
                xtype: 'textfield',
                header: 'Water Volume (mL)',
                //allowBlank: false,
                columnConfig: {
                    width:140
                }
            },
            assignedTo:{
                allowBlank: false,
                defaultValue: 'researchstaff',
                columnConfig: {
                    width:120
                }
            },
            frequency:{
                allowBlank: false,
                defaultValue: 2,
                lookup:{
                    schemaName: 'wnprc',
                    queryName: 'husbandry_frequency',
                    keyColumn: 'rowid',
                    displayColumn: 'meaning',
                    sort: 'sort_order'
                }
            },
            provideFruit:{
                defaultValue: 'none',
                allowBlank: false,
                lookup:{
                    schemaName: 'ehr_lookups',
                    queryName: 'husbandry_fruit',
                    keyColumn: 'value',
                    displayColumn: 'title',
                    sort: 'sort_order'
                }
            }



        },
        'study.waterAmount':{
            Id:{
                //hidden: true,
                //shownInGrid: false,
                // parentConfig: {
                //     storeIdentifier: {queryName: 'weight', schemaName: 'study'},
                //     dataIndex: 'Id'
                // }
            },
            date:{
                xtype: 'datefield',
                header: 'Date',
                extFormat: 'Y-m-d',
                allowBlank: false,
                editable: true,
                columnConfig: {
                    width:110
                },
                editorConfig: {
                    maxValue: new Date(),
                    minValue: new Date(),

                }
            },
            volume:{
                xtype: 'numberfield',
                header: 'Volume (mL)',
                allowBlank:false,
                columnConfig: {
                    width:140
                }
            },
            assignedTo:{
                allowBlank: false
            },
            frequency:{
                allowBlank: false,
                defaultValue: '2',
                editable: false,
                editorConfig:{
                    displayColumn: 'altmeaning'
                },
                lookup:{
                    schemaName: 'wnprc',
                    queryName: 'husbandry_frequency',
                    keyColumn: 'rowid',
                    displayColumn: 'altmeaning',
                    sort: 'sort_order',
                    filterArray: [LABKEY.Filter.create('altmeaning', null, LABKEY.Filter.Types.NONBLANK)]
                }

            },
            recordSource:{
                defaultValue: 'WaterOrdersForm',
                editable: false,
                //hidden: true,
                shownInGrid: false
            }
        }



    }

});