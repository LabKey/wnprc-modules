/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('Weight', {
    byQuery: {
        'study.drug': {
            reason: {
                defaultValue: 'Weight'
            },
            volume: {
                shownInGrid: false
            },
            vol_units: {
                shownInGrid: false
            }
        }
    }
});