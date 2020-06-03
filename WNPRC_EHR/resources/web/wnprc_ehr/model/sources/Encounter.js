EHR.model.DataModelManager.registerMetadata('Encounter', {

    byQuery: {
        'study.waterGiven':{


            date: {
                allowBlank: false
            },
            project:{
                allowBlank: false
            },
            volume: {
                xtype: 'numberfield',
                compositeField: 'Volume (mL)',
                header: 'Volume (ml)',
                editable: false,
                allowBlank: true
            },
            provideFruit:{

            },
            route: {
                defaultValue : 'oral'
            },
            location:{
                defaultValue: 'animalRoom',
                lookup:{
                    schemaName: 'ehr_lookups',
                    queryName: 'water_location',
                    keyColumn: 'value',
                    displayColumn: 'title',
                    sort: 'sort_order'
                },
                columnConfig: {
                    width:130
                }
            },
            assignedTo:{

            },
            remarks :{
                xtype: 'ehr-remarkfield',
                //hidden : true,
                shownInGrid: false
            },
            performedby:{
                allowBlank: false
            },
            treatmentid: {
                hidden: true
            },
            dateordered:{
                //hidden: true
            }

        },
    }

});