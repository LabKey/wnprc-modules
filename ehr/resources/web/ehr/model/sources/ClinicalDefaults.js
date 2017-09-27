/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('ClinicalDefaults', {
    allQueries: {
        performedby: {
            allowBlank: true
        },
        project: {
            getInitialValue: function(v, rec){
                //return a default value only if this field is visible
                var shouldReturn = false;
                if (rec){
                    var meta = rec.fields.get('project');
                    if (meta){
                        shouldReturn = meta.hidden == false
                    }
                }
                return v ? v : shouldReturn ? EHR.DataEntryUtils.getDefaultClinicalProject() : null;
            }
        }
    },
    byQuery: {
        'study.treatment_order': {
            category: {
                defaultValue: 'Clinical'
            }
        },
        'ehr.snomed_tags': {
            code: {
                editorConfig: {
                    xtype: 'ehr-snomedcombo',
                    defaultSubset: 'Diagnostic Codes'
                }
            },
            set_number: {
                hidden: true
            },
            sort: {
                hidden: true
            }
        },
        'study.drug': {
            reason: {
                defaultValue: 'N/A'
            },
            category: {
                defaultValue: 'Clinical'
            },
            chargetype: {
                allowBlank: false,
                defaultValue: 'No Charge'
            }
        },
        'study.encounters': {
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
                header: 'Narrative',
                label: 'Narrative',
                columnConfig: {
                    width: 400
                }
            },
            procedureid: {
                lookup: {
                    filterArray: [
                        LABKEY.Filter.create('category', 'Procedure', LABKEY.Filter.Types.EQUAL),
                        LABKEY.Filter.create('active', true, LABKEY.Filter.Types.EQUAL)
                    ]
                }
            },
            chargetype: {
                defaultValue: 'No Charge',
                allowBlank: false
            },
            instructions: {
                hidden: true
            }
        },
        'study.clinremarks': {
            category: {
                defaultValue: 'Clinical',
                hidden: true
            },
            hx: {
                hidden: false
            },
            p2: {
                //hidden: true
            },
            remark: {
                hidden: true
            }
        },
        'study.blood': {
            reason: {
                defaultValue: 'Clinical'
            },
            instructions: {
                hidden: true
            },
            chargetype: {
                allowBlank: false,
                defaultValue: 'No Charge'
            }
        }
    }
});