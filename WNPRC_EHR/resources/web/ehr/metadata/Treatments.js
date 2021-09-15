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
                header: 'Vol',
                colModel: {
                    width: 40
                }
            },
            vol_units: {
                header: 'V.Units',
                colModel: {
                    width: 50
                }
            },
            concentration:{
                header: 'Conc',
                shownInGrid: true,
                compositeField: 'Drug Conc',
                colModel: {
                    width: 45
                }
            },
            conc_units:{
                header: 'C.Units',
                shownInGrid: true,
                compositeField: 'Drug Conc',
                colModel: {
                    width: 70
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
                shownInGrid: true,
                colModel: {
                    width: 50
                }
            }
        }
    }
});