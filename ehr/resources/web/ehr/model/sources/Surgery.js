/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('Surgery', {
    allQueries: {
        performedby: {
            allowBlank: true
        }
    },
    byQuery: {
        'onprc_billing.miscCharges': {
            chargeId: {
                lookup: {
                    filterArray: [
                        LABKEY.Filter.create('active', true, LABKEY.Filter.Types.EQUAL),
                        LABKEY.Filter.create('category', 'Lease Fee', LABKEY.Filter.Types.NEQ),
                        LABKEY.Filter.create('category', 'Animal Per Diem', LABKEY.Filter.Types.NEQ),
                        LABKEY.Filter.create('category', 'Small Animal Per Diem', LABKEY.Filter.Types.NEQ),
                        LABKEY.Filter.create('category', 'Timed Mated Breeders', LABKEY.Filter.Types.NEQ)
                    ]
                }
            },
            chargetype: {
                //NOTE: this will be inherited from the encounters record, so we dont want a default
                //defaultValue: 'DCM: Surgery Services',
                allowBlank: false
            }
        },
        'study.treatment_order': {
            category: {
                defaultValue: 'Surgical'
            }
        },
        'study.drug': {
            enddate: {
                hidden: false
            },
            category: {
                defaultValue: 'Surgical'
            },
            reason: {
                defaultValue: 'Procedure'
            },
            chargetype: {
                //NOTE: this will be inherited from the encounters record, so we dont want a default
                //defaultValue: 'DCM: Surgery Services',
                allowBlank: false
            }
        },
        'study.encounters': {
            type: {
                defaultValue: 'Surgery',
                hidden: true
            },
            title: {
                hidden: true
            },
            caseno: {
                hidden: true
            },
            procedureid: {
                lookup: {
                    filterArray: [
                        LABKEY.Filter.create('category', 'Surgery', LABKEY.Filter.Types.EQUAL),
                        LABKEY.Filter.create('active', true, LABKEY.Filter.Types.EQUAL)
                    ]
                }
            },
            performedby: {
                hidden: true
            },
            remark: {
                hidden: true
            },
            chargetype: {
                allowBlank: false
            },
            assistingstaff: {
                hidden: false,
                allowBlank: true //will be handled in trigger script
            },
            enddate: {
                editorConfig: {
                    getDefaultDate: function(){
                        var rec = EHR.DataEntryUtils.getBoundRecord(this);
                        if (rec){
                            if (rec.get('date')){
                                return rec.get('date');
                            }
                        }
                    }
                }
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
        'ehr.encounter_summaries': {
            category: {
                defaultValue: 'Narrative'
            }
        }
    }
});