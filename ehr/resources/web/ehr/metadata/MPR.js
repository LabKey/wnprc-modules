/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This is the default metadata applied to records in the context of an MPR task.
 */
EHR.Metadata.registerMetadata('MPR', {
    allQueries: {

    },
    byQuery: {
        'Clinical Encounters': {
            type: {
                defaultValue: 'Procedure'
            }
        },
        'Drug Administration': {
            amount: {
                shownInGrid: true,
                header: 'Amount',
                colModel: {
                    width: 50
                }
            },
            amount_units: {
                shownInGrid: true,
                header: 'Amt Units',
                colModel: {
                    width: 60
                }
            },
            vol_units: {
                header: 'Vol Units',
                colModel: {
                    width: 50
                }
            },
            volume: {
                colModel: {
                    width: 50
                }
            },
            category: {
                hidden: false
            },
            date: {
                hidden: true
            },
            begindate: {
                hidden: false
            }
        }
    }
});