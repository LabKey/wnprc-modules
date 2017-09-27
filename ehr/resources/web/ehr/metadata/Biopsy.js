/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This is the default metadata applied to records in the context of a biopsy task.  Among other things, it configured a parent/child relationship
 * between the study.biopsies record and other dataset records.  It is similar to Encounter, except the parent record is from study.biopsies.
 */
EHR.Metadata.registerMetadata('Biopsy', {
    allQueries: {
        Id: {
            parentConfig: {
                storeIdentifier: {queryName: 'Biopsies', schemaName: 'study'},
                dataIndex: 'Id'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,date: {
            parentConfig: {
                storeIdentifier: {queryName: 'Biopsies', schemaName: 'study'},
                dataIndex: 'date'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,begindate: {
            setInitialValue: function(v, rec){
                var field = rec.fields.get('begindate');
                var store = Ext.StoreMgr.get('study||Biopsies||||');
                if(store)
                    var record = store.getAt(0);
                if(record)
                    var date = record.get('date');
                if(date)
                    date = new Date(date.getFullYear(), date.getMonth(), date.getDate());

                return v || date;
            }
            ,hidden: false
            ,allowBlank: false
        }
        ,parentid: {
            parentConfig: {
                storeIdentifier: {queryName: 'Biopsies', schemaName: 'study'},
                dataIndex: 'objectid'
            }
            ,hidden: true
            ,shownInGrid: false
            ,allowBlank: false
        }
        ,project: {
            parentConfig: {
                storeIdentifier: {queryName: 'Biopsies', schemaName: 'study'},
                dataIndex: 'project'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,account: {
            parentConfig: {
                storeIdentifier: {queryName: 'Biopsies', schemaName: 'study'},
                dataIndex: 'account'
            }
            ,hidden: true
            ,shownInGrid: false
        }
    },
    byQuery: {
        Biopsies: {
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
                allowBlank: true,
                hidden: false
            },
            account: {
                parentConfig: null,
                allowBlank: false,
                hidden: false
            },
            title: {
                parentConfig: {
                    storeIdentifier:  {queryName: 'tasks', schemaName: 'ehr'}
                    ,dataIndex: 'title'
                }
            }
        },
        tasks: {
            duedate: {
                parentConfig: {
                    storeIdentifier: {queryName: 'Biopsies', schemaName: 'study'},
                    dataIndex: 'date'
                }
                ,hidden: true
                ,shownInGrid: false
            }
        }
    }
});
