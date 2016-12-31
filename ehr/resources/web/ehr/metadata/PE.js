/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @name EHR.Metadata.Sources.PE
 * This is the default metadata applied to records in the context of physical exam.
 */
EHR.Metadata.registerMetadata('PE', {
    allQueries: {
        performedby: {
            parentConfig: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                dataIndex: 'performedby'
            }
            //,hidden: true
            ,shownInGrid: false
        }
    },
    byQuery: {
        'Clinical Observations': {
            area: {
                allowBlank: false,
                includeNullRecord: false,
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'pe_region',
                    displayColumn: 'value',
                    keyColumn: 'value',
                    sort: 'value'
                }
                ,colModel: {
                    width: 60
                }

            },
            observation: {
                defaultValue: 'Normal'
                ,colModel: {
                    width: 40
                }
            },
            remark: {
                isAutoExpandColumn: true
            },
            code: {
                hidden: true
//                colModel: {
//                    width: 120
//                }
            }
        },
        'Clinical Encounters': {
            type: {
                defaultValue: 'Physical Exam'
            },
            serviceRequested: {
                hidden: true
            },
            enddate: {
                hidden: true
            },
            major: {
                hidden: true
            },
            remark: {
                height: 100
            },
            performedby: {
                defaultValue: LABKEY.Security.currentUser.displayName,
                parentConfig: null
            }
        },
        'Clinical Remarks': {
            so: {
                shownInGrid: true
            },
            a: {
                shownInGrid: true
            },
            p: {
                shownInGrid: true
            }
        },
        'Body Condition': {
            microchip: {
                hidden: true
            },
            tag: {
                hidden: true
            }
        }
    }
});