/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('Anesthesia', {
    allQueries: {

    },
    byQuery: {
        'study.encounters': {
            type: {
                defaultValue: 'Procedure',
                hidden: true
            },
            instructions: {
                hidden: true
            },
            performedby: {
                defaultValue: LABKEY.Security.currentUser.displayName
            }
        },
        'study.anesthesia': {

        }
    }
});