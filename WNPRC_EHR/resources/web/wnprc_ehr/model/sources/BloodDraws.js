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