/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This is the default metadata applied to records in the context of anesthesia.  It was originally created for the purpose of adding recovery observations
 * to an MPR form; however, the hope is to perform these using paper.
 */
EHR.Metadata.registerMetadata('Anesthesia', {
    allQueries: {

    },
    byQuery: {
        'Clinical Observations': {
            area: {
                hidden: true,
                //preventMark: true,
                xtype: 'displayfield',
                allowBlank: true,
                defaultValue: 'Anesthesia'
            }
            ,code: {
                hidden: true
            }
            ,observation: {
                xtype: 'ehr-remoteradiogroup',
                //defaultValue: 'Normal',
                allowBlank: true,
                //includeNullRecord: false,
                editorConfig: {
                    columns: 1
                },
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'observations_anesthesia_recovery',
                    displayColumn: 'value',
                    keyColumn: 'value',
                    sort: 'sort_order'
                }
            }
            ,date: {
                parentConfig: null
                ,hidden: false
                ,shownInGrid: true
            }
        }

    }
});