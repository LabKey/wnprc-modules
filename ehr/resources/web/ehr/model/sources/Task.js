/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This is the default metadata applied to all Tasks when using getTableMetadata().
 * Among other things, it sets of the parent/child relationship for cild records to inherit taskId from the ehr.tasks record.
 */
EHR.model.DataModelManager.registerMetadata('Task', {
    allQueries: {
        QCState: {
            hidden: false
        },
        taskid: {
            inheritance: {
                storeIdentifier:  {queryName: 'tasks', schemaName: 'ehr'},
                sourceField: 'taskid',
                recordIdx: 0
//                recordSelector: {
//                    taskid: 'taskid'
//                }
            },
            hidden: true
        }
    },
    byQuery: {
        'ehr.tasks': {
            category: {defaultValue: 'Task'}
        },
        'study.blood': {
            performedby: {allowBlank: true},  //consider what behavior we want here
            tube_type: {allowBlank: false},
            daterequested: {
                hidden: false,
                xtype: 'datefield',
                editorConfig: {
                    readOnly: true
                }
            }
        }
    }
});