EHR.model.DataModelManager.registerMetadata('Encounter', {

    byQuery: {
        'study.waterGiven':{
            Id: {
                editable: false
            },
            date: {
                allowBlank: false
            },
            project:{
                editable: false,
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
                editable: false

            },
            route: {
                editable: false,
                defaultValue : 'oral'
            },
            location:{
                editable: false,
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
                editable: false

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
                hidden: true
            }

        },
    }

});