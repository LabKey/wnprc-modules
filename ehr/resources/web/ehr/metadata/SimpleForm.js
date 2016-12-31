/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This is the default metadata applied any record when displayed in the context of a single record (ie. not part of a task or request)
 */
EHR.Metadata.registerMetadata('SimpleForm', {
    allQueries: {
        QCState: {
            hidden: false
            ,editable: true
            ,setInitialValue: function(v){
                var qc;
                if(!v && EHR.Security.getQCStateByLabel('In Progress'))
                    qc = EHR.Security.getQCStateByLabel('In Progress').RowId;
                return v || qc;
            }
            ,editorConfig: {
                editable: true,
                disabled: false
            }
        }
        ,taskid: {
//            parentConfig: {
//                storeIdentifier:  {queryName: 'tasks', schemaName: 'ehr'}
//                ,dataIndex: 'taskid'
//            }
            hidden: true
        }
    },
    byQuery: {
        tasks: {
            category: {
                defaultValue: 'Generic Form'
            }
        },
        'Clinical Remarks': {
            remark: {
                hidden: true
            }
        }
    }
});