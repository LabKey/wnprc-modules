/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('LabworkChild', {
    allQueries: {
        Id: {
            editable: false
        },
        testid: {
            editorConfig: {
                plugins: [{
                    ptype: 'ldk-usereditablecombo',
                    allowChooseOther: false
                }]
            }
        }
    }
});