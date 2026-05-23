/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/*
 * Overrides for the Blood Draws form.
 */
EHR.model.DataModelManager.registerMetadata('BloodDraws', {
    allQueries: {
        remark: {
            shownInGrid: false
        }
    },
    byQuery: {
        // Blood Draws Section
        'study.blood': {
            performedby: {
                shownInGrid: false
            },
            restraintDuration: {
                shownInGrid: false
            },
            restraint: {
                shownInGrid: false
            },
            restraintTime: {
                shownInGrid: false
            },
            assayCode: {
                shownInGrid: false
            },
            billedby: {
                shownInGrid: false
            },
            account: {
                shownInGrid: true,
                columnConfig: {
                    displayAfterColumn: 'project'
                }
            },
            p_s: {
                hidden: true
            },
            a_v: {
                hidden: true
            },
            daterequested: {
                columnConfig: {
                    displayAfterColumn: 'additionalServices',
                    width: 130
                }
            }
        },
        // Treatments Section
        'study.drug': {
            enddate: {
                hidden: false,
                shownInGrid: false
            },
            account: {
                shownInGrid: true,
                columnConfig: {
                    displayAfterColumn: 'project'
                }
            },
            restraintTime: {
                shownInGrid: false
            },
            performedby: {
                shownInGrid: false
            }
        }
    }
});