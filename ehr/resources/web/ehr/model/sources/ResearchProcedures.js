/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('ResearchProcedures', {
    allQueries: {
        performedby: {
            allowBlank: true
        }
    },
    byQuery: {
        'study.encounters': {
            instructions: {
                hidden: true
            },
            chargetype: {
                defaultValue: 'Research Staff',
                allowBlank: false
            },
            performedby: {
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            type: {
                defaultValue: 'Procedure',
                hidden: true
            },
            title: {
                hidden: true
            },
            caseno: {
                hidden: true
            },
            remark: {
                columnConfig: {
                    width: 400
                }
            },
            procedureid: {
                lookup: {
                    filterArray: [
                        LABKEY.Filter.create('category', 'Surgery', LABKEY.Filter.Types.NEQ),
                        LABKEY.Filter.create('active', true, LABKEY.Filter.Types.EQUAL)
                    ]
                }
            }
        },
        'study.blood': {
            chargetype: {
                defaultValue: 'Research Staff',
                allowBlank: false
            },
            instructions: {
                hidden: true
            },
            reason: {
                defaultValue: 'Research'
            }
        },
        'study.drug': {
            category: {
                defaultValue: 'Research',
                editable: false
            },
            project: {
                allowBlank: false
            },
            code: {
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Drugs and Procedures'
                }
            },
            chargetype: {
                defaultValue: 'Research Staff',
                allowBlank: false
            }
        },
        'study.treatment_order': {
            category: {
                defaultValue: 'Research',
                editable: false
            },
            code: {
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Drugs and Procedures'
                }
            }
        }
    }
});