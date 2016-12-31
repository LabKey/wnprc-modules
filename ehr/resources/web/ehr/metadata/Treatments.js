/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.Metadata.registerMetadata('Treatments', {
    allQueries: {

    },
    byQuery: {
        'Drug Administration': {
            'id/curlocation/location': {
                shownInGrid: true
            },
            code: {
                editorConfig: {
                    defaultSubset: 'Drugs and Procedures'
                },
                colModel: {
                    width: 120
                }
            },
            volume: {
                colModel: {
                    width: 50
                }
            },
            vol_units: {
                colModel: {
                    width: 50
                }
            },
            performedby: {
                shownInGrid: false,
                defaultValue: null
            },
            remark: {
                shownInGrid: true
            },
            date: {
                editorConfig: {
                    dateConfig: {
                        editable: false,
                        hideTrigger: true,
                        onTriggerClick: Ext.emptyFn
                    }
                }
            },
            route: {
                shownInGrid: true
            }
        }
    }
});