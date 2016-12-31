/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('Menses', {
    byQuery: {
        'study.clinical_observations': {
            category: {
                defaultValue: 'Menses'
            },
            observation: {
                defaultValue: 'M'
            }
        }
    }
});