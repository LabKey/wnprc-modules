/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('ClinicalRounds', {
    allQueries: {

    },
    byQuery: {
        'study.clinremarks': {
            Id: {
                editable: false,
                columnConfig: {
                    editable: false
                }
            },
            category: {
                defaultValue: 'Clinical',
                hidden: true
            },
            hx: {
                hidden: false
            },
            s: {
                hidden: true
            },
            o: {
                hidden: true
            },
            a: {
                hidden: true
            },
            p: {
                hidden: true
            },
            remark: {
                hidden: false
            }
        },
        'study.blood': {
            reason: {
                defaultValue: 'Clinical'
            },
            instructions: {
                hidden: true
            }
        },
        'study.encounters': {
            instructions: {
                hidden: true
            }
        },
        'study.clinical_observations': {
            Id: {
                editable: false,
                columnConfig: {
                    editable: false
                }
            }
        }
    }
});