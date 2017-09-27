/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This is the default metadata applied any record when displayed in the context of an encounter.  An encounter is the special situation in which
 * a task only refers to one ID.  In these cases, there is a single study.Clinical Encounters record, and Id/Date/Project are inherited from this record to children.
 */
EHR.Metadata.registerMetadata('Encounter', {
    allQueries: {
        Id: {
            parentConfig: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                dataIndex: 'Id'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,date: {
            parentConfig: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                dataIndex: 'date'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,parentid: {
            parentConfig: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                dataIndex: 'objectid'
            }
            ,hidden: true
            ,shownInGrid: false
            ,allowBlank: false
        }
        ,project: {
            parentConfig: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                dataIndex: 'project'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,account: {
            parentConfig: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                dataIndex: 'account'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,restraint: {
            parentConfig: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                dataIndex: 'restraint'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,restraintDuration: {
            parentConfig: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                dataIndex: 'restraintDuration'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,begindate: {
            setInitialValue: function(v, rec){
                var field = rec.fields.get('begindate');
                var store = Ext.StoreMgr.get('study||Clinical Encounters||||');
                if(store)
                    var record = store.getAt(0);
                if(record)
                    var date = record.get('date');
                if(date)
                    date = new Date(date.getFullYear(), date.getMonth(), date.getDate());

                return v || date;
            }
        }
        ,title:{
            allowDuplicateValue: false
        }
    },
    byQuery: {
        'Treatment Orders': {
            date: {
                parentConfig: false,
                hidden: false,
                allowBlank: false,
                setInitialValue: function(v, rec)
                {
                    return v ? v : new Date()
                },
                shownInGrid: true
            }
        },
        'Drug Administration': {
            HeaderDate: {
                parentConfig: {
                    storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                    dataIndex: 'date'
                }
            }
            ,begindate: {
                hidden: false
                ,allowBlank: false
            }
            ,performedby: {
                allowBlank: true,
                hidden: true
            }
        },
        'Clinical Encounters': {
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
                hidden: false,
                label: 'Start Time'
            },
            project: {
                parentConfig: null,
                allowBlank: false,
                hidden: false
            },
            restraint: {
                parentConfig: null,
                hidden: false
            },
            restraintDuration: {
                parentConfig: null,
                hidden: false
            },
            type: {
                hidden: false
            },
            remark: {
                label: 'Procedures or Remarks',
                height: 200,
                width: 600,
                editorConfig: {
                    style: null
                }
            },
            title: {
                parentConfig: {
                    storeIdentifier:  {queryName: 'tasks', schemaName: 'ehr'}
                    ,dataIndex: 'title'
                },
                hidden: true
            }
        },
        'Clinical Remarks': {
//            so: {
//                hidden: true
//            },
//            a: {
//                hidden: true
//            },
//            p: {
//                hidden: true
//            }
            remark: {
                label: 'Other Remark'
            }
        },
        Housing: {
            date: {
                parentConfig: false,
                hidden: false,
                shownInGrid: true
            },
            performedby: {
                allowBlank: false
            }
        },
        tasks: {
            duedate: {
                parentConfig: {
                    storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                    dataIndex: 'date'
                }
                ,hidden: true
                ,shownInGrid: false
            }
        }
    }
});