/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('Necropsy', {
    allQueries: {
    },
    byQuery: {
        'study.encounters': {
            type: {
                defaultValue: 'Necropsy',
                hidden: true
            },
            chargetype: {
                allowBlank: true
            },
            assistingstaff: {
                allowBlank: true,
                hidden: true
            },
            caseno: {
                xtype: 'ehr-pathologycasenofield',
                hidden: false,
                editorConfig: {
                    casePrefix: 'A',
                    encounterType: 'Necropsy'
                }
            },
            remark: {
                hidden: true
            }
        }
    }
});