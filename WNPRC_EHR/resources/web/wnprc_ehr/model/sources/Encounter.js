/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('Encounter', {

    byQuery: {
        'study.waterGiven':{
            Id: {
                editable: false
            },
            date: {
                xtype: 'datefield',
                allowBlank:     false,
                editable:       true,
                shownInGrid:    true,
                columnConfig: {
                    width:      125,
                    editable:   false
                }
            },
            'id/curLocation/room' :{
                editable: false,
                shownInGrid: true,
                columnConfig: {
                    width:80
                }
            },
            'id/curLocation/cage':{
                editable: false,
                shownInGrid: true,
                columnConfig: {
                    width:80
                }
            },
            assignedTo:{
                editable: false
            },
            project:{
                editable:       false,
                allowBlank:     false,
                shownInGrid :   false
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
            waterSource:{
                editable:       false,
                allowBlank:     false,
                shownInGrid:    true

            },
            remarks :{
                xtype: 'ehr-remarkfield',
                shownInGrid: true
            },
            route: {
                editable:       false,
                defaultValue :  'oral',
                shownInGrid :   false

            },
            location:{
                editable: false,
                shownInGrid: false,
                defaultValue: 'animalRoom',
                lookup:{
                    schemaName: 'ehr_lookups',
                    queryName: 'water_location',
                    keyColumn: 'value',
                    displayColumn: 'title',
                    sort: 'sort_order'
                },
                columnConfig: {
                    width:80
                }
            },
            performedby:{
                allowBlank: false,
                columnConfig: {
                    width:100
                }
            },
            treatmentid: {
                hidden: true
            },
            dateOrdered:{
                hidden: true
            }

        },
    }

});