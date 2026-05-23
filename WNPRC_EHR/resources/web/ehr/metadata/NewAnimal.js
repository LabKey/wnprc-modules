/*
 * Copyright (c) 2020-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.Metadata.registerMetadata('NewAnimal', {
    allQueries: {
        project: {
            allowBlank: true
        },
        account: {
            allowBlank: true
        }
    },
    byQuery: {
        'TB Tests': {
            notPerformedAtCenter: {
                defaultValue: true
            },
            result1: {
                defaultValue: '-'
            },
            result2: {
                defaultValue: '-'
            },
            result3: {
                defaultValue: '-'
            }
        }
    }
});