/*
 * Copyright (c) 2020-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This is the default metadata applied to records in the context of a Surgery task.
 */
EHR.Metadata.registerMetadata('Surgery', {
    allQueries: {

    },
    byQuery: {
        'Clinical Encounters': {
            type: {
                defaultValue: 'Surgery'
            },
            major: {
                allowBlank: false
            }
        },
        'Drug Administration': {
            category: {
                hidden: false
            }
        }
    }
});