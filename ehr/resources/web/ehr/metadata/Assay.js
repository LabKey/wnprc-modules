/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This is the default metadata applied to records in the context of an assay, which currently is used by the ClinPath task.
 */
EHR.Metadata.registerMetadata('Assay', {
    allQueries: {
        project: {
//            parentConfig: {
//                storeIdentifier: {queryName: 'Clinpath Runs', schemaName: 'study'},
//                recordIdentifier: function(parentRecord, childRecord){
//                    console.log(parentRecord);
//                    console.log(childRecord);
//                    if(!childRecord || !parentRecord){
//                        return;
//                    }
//                    if(childRecord.get('Id') && childRecord.get('Id') == parentRecord.get('Id')){
//                        return true;
//                    }
//                },
//                dataIndex: 'project'
//            }
            hidden: true
            ,shownInGrid: false
        }
        ,account: {
//            parentConfig: {
//                storeIdentifier: {queryName: 'Clinpath Runs', schemaName: 'study'},
//                recordIdentifier: function(parentRecord, childRecord){
//                    console.log(parentRecord);
//                    console.log(childRecord);
//                    if(!childRecord || !parentRecord){
//                        return;
//                    }
//                    if(childRecord.get('Id') && childRecord.get('Id') == parentRecord.get('Id')){
//                        return true;
//                    }
//                },
//                dataIndex: 'account'
//            }
            hidden: true
            ,shownInGrid: false
        }
        ,performedby: {
            hidden: true
        }
//        ,serviceRequested: {
//            xtype: 'displayfield'
//        }
    },
    byQuery: {
        'Clinpath Runs': {
            parentid: {
                parentConfig: false,
                allowBlank: true
            },
            Id: {
                parentConfig: null,
                hidden: false
            },
            date: {
                parentConfig: null,
                hidden: false
            },
            project: {
                parentConfig: null,
                hidden: false
            },
            account: {
                parentConfig: null,
                hidden: false
            }
        }
    }
});