/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('EncounterChild', {
    allQueries: {
        Id: {
            editable: false,
            columnConfig: {
                editable: false
            }
        },
        date: {
            inheritDateFromParent: true
        },
        project: {
            inheritFromParent: true
        },
        chargetype: {
            inheritFromParent: true
        }
    },
    byQuery: {
        'study.treatment_order': {
            date: {
                inheritDateFromParent: false
            }
        },
        'study.blood': {
            project: {
                inheritFromParent: false
            }
        },
        'onprc_billing.miscCharges': {
            project: {
                inheritFromParent: false
            }
        }
    }
});