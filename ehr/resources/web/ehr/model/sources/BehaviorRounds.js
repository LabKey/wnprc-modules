/*
* Copyright (c) 2013-2014 LabKey Corporation
*
* Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
*/
EHR.model.DataModelManager.registerMetadata('BehaviorRounds', {
    allQueries: {
        performedby: {
            lookup: {
                schemaName: 'core',
                queryName: 'users',
                keyColumn: 'DisplayName',
                displayColumn: 'DisplayName',
                columns: 'UserId,DisplayName,FirstName,LastName',
                sort: 'Type,DisplayName'
            },
            editorConfig: {
                anyMatch: true,
                listConfig: {
                    innerTpl: '{[values.DisplayName + (values.LastName ? " (" + values.LastName + (values.FirstName ? ", " + values.FirstName : "") + ")" : "")]}',
                    getInnerTpl: function(){
                        return this.innerTpl;
                    }
                }
            }
        }
    },
    byQuery: {
        'study.clinremarks': {
            s: {
                hidden: true,
                height: 60
            },
            o: {
                hidden: true,
                height: 60
            },
            a: {
                hidden: true,
                height: 60
            },
            p: {
                hidden: true,
                height: 60
            },
            remark: {
                columnConfg: {
                    width: 360
                },
                height: 60
            }
        }
    }
});