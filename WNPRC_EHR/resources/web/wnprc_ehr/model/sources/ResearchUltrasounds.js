/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('ResearchUltrasounds', {
    allQueries: {

    },
    byQuery: {
        'study.research_ultrasounds': {
            QCState: {
                shownInGrid: false,
                hidden: true
            },
            pregnancyid: {
                xtype: 'wnprc-pregnancyidfield'
            }
        },
        'study.ultrasound_measurements': {

        },
        'study.ultrasound_review': {
            Id: {
                shownInGrid: false,
                hidden: true
            },
            QCState: {
                shownInGrid: false,
                hidden: true
            }
        },
        'study.restraints': {
            Id: {
                shownInGrid: false,
                hidden: true
            },
            date: {
                shownInGrid: false,
                hidden: true
            },
            project: {
                shownInGrid: false,
                hidden: true
            },
            QCState: {
                shownInGrid: false,
                hidden: true
            }
        }
    }
});