/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('Pathology', {
    allQueries: {
        performedby: {
            allowBlank: true
        },
        codesRaw: {
            hidden: false,
            shownInInsertView: true, //note: this is added in order to make it show in record duplicator window
            xtype: 'ehr-snomedcodeseditor',
            allowDuplicateValue: true,
            columnConfig: {
                xtype: 'ehr-snomedcolumn',
                editable: true,
                width: 500
            }
        }
    },
    byQuery: {
        'study.encounters': {
            title: {
                hidden: true
            },
            chargetype: {
                allowBlank: false
            },
            procedureid: {
                hidden: false,
                lookup: {
                    filterArray: [
                        LABKEY.Filter.create('category', 'Pathology', LABKEY.Filter.Types.EQUAL),
                        LABKEY.Filter.create('active', true, LABKEY.Filter.Types.EQUAL)
                    ]
                }
            },
            instructions: {
                hidden: true
            },
            performedby: {
                hidden: true
            },
            remark: {
                header: 'Summary Comments',
                label: 'Summary Comments',
                height: 300,
                editorConfig: {
                    width: 1000
                }
            }
        },
        'ehr.encounter_summaries': {
            Id: {
                hidden: true
            },
            date: {
                hidden: true
            },
            category: {
                defaultValue: 'Pathology Notes',
                hidden: true
            },
            remark: {
                height: 300,
                editorConfig: {
                    fieldLabel: 'Notes',
                    width: 1000
                }
            }
        },
        'study.drug': {
            project: {
                allowBlank: true,
                hidden: true
            },
            chargetype: {
                defaultValue: 'DCM: Pathology Services'
            }
        },
        'study.grossFindings': {
            remark: {
                height: 300,
                editorConfig: {
                    fieldLabel: 'Notes',
                    width: 1000
                }
            },
            Id: {
                hidden: true
            },
            date: {
                hidden: true
            }
        },
        //NOTE: this would toggle the behavior of the SNOMED code popup window
//        'study.histology': {
//            codesRaw: {
//                columnConfig: {
//                    defaultSubset: 'Organ/Tissue'
//                }
//            }
//        },
        'onprc_billing.miscCharges': {
            chargetype: {
                defaultValue: 'DCM: Pathology Services'
            }
        }
    }
});