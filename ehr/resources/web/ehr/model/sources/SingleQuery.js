/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('SingleQuery', {
    allQueries: {
        objectid: {
            allowBlank: false
        }
    },
    byQuery: {
        'study.clinremarks': {

        },
        'study.treatment_order': {
            frequency: {
                lookup: {
                    //added to allow legacy frequencies
                    storeId: 'study||treatment_frequency||rowid||meaning||unfiltered',
                    filterArray: []
                }
            },
            category: {
                defaultValue: 'Clinical'
            }
        },
        'study.drug': {
            chargetype: {
                hidden: false
            }
        }
    }
});