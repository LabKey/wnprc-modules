/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This is the default metadata applied to records in the context of a necropsy task.  Among other things, it configured a parent/child relationship
 * between the study.necropsies record and other dataset records.  It is similar to Encounter, except the parent record is from study.Necropsies.
 */
EHR.Metadata.registerMetadata('Necropsy', {
    allQueries: {
        Id: {
            parentConfig: {
                storeIdentifier: {queryName: 'Necropsies', schemaName: 'study'},
                dataIndex: 'Id'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,date: {
            parentConfig: {
                storeIdentifier: {queryName: 'Necropsies', schemaName: 'study'},
                dataIndex: 'date'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,begindate: {
            setInitialValue: null
            ,hidden: false
            ,allowBlank: false
        }
        ,parentid: {
            parentConfig: {
                storeIdentifier: {queryName: 'Necropsies', schemaName: 'study'},
                dataIndex: 'objectid'
            }
            ,hidden: true
            ,shownInGrid: false
            ,allowBlank: false
        }
        ,project: {
            parentConfig: {
                storeIdentifier: {queryName: 'Necropsies', schemaName: 'study'},
                dataIndex: 'project'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,account: {
            parentConfig: {
                storeIdentifier: {queryName: 'Necropsies', schemaName: 'study'},
                dataIndex: 'account'
            }
            ,hidden: true
            ,shownInGrid: false
        }
    },
    byQuery: {
        Necropsies: {
            parentid: {
                parentConfig: false,
                allowBlank: true
            },
            Id: {
                parentConfig: null,
                hidden: false,
                allowAnyId: true,
                xtype: 'trigger',
                editorConfig: {
                    plugins: ['ehr-participantfield'],
                    triggerClass: 'x-form-search-trigger',
                    onTriggerClick: function (){
                        Ext.Msg.confirm('Find Next PD Number In Series', 'Clicking OK will find the next available PD number for infant deaths.', function(v){
                            if(v == 'yes'){
                                var prefix = 'pd';
                                var year = new Date().getFullYear().toString().slice(2);
                                var sql = "SELECT cast(SUBSTRING(MAX(id), 5, 6) AS INTEGER) as num FROM study.prenatal WHERE Id LIKE '" + prefix + year + "%'";
                                LABKEY.Query.executeSql({
                                    schemaName: 'study',
                                    sql: sql,
                                    scope: this,
                                    success: function(data){
                                        var caseno;
                                        if(data.rows && data.rows.length==1){
                                            caseno = data.rows[0].num;
                                            caseno++;
                                        }
                                        else {
                                            //console.log('no existing IDs found');
                                            caseno = 1;
                                        }

                                        caseno = EHR.Utils.padDigits(caseno, 2);
                                        var val = prefix + year + caseno;
                                        this.setValue(val);
                                        this.fireEvent('change', val)
                                    },
                                    failure: EHR.Utils.onError
                                });
                            }
                        }, this);
                    }
                }
            },
            date: {
                parentConfig: null,
                hidden: false
                //label: 'Start Time'
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
            },
            mannerofdeath: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
            }
        },
        Deaths: {
            date: {
                parentConfig: null,
                hidden: false
            },
            caseno: {
                parentConfig: {
                    storeIdentifier: {queryName: 'Necropsies', schemaName: 'study'},
                    dataIndex: 'caseno'
                },
                xtype: 'displayfield'
            }
        },
        'Drug Administration': {
            begindate: {
                hidden: false
            }
            ,performedby: {
                allowBlank: true,
                hidden: true
            }
        },
        Alopecia: {
            head: {defaultValue: 'NA', hiddden: true},
            dorsum: {defaultValue: 'NA', hiddden: true},
            rump: {defaultValue: 'NA', hiddden: true},
            shoulders: {defaultValue: 'NA', hiddden: true},
            upperArms: {defaultValue: 'NA', hiddden: true},
            lowerArms: {defaultValue: 'NA', hiddden: true},
            hips: {defaultValue: 'NA', hiddden: true},
            upperLegs: {defaultValue: 'NA', hiddden: true},
            lowerLegs: {defaultValue: 'NA', hiddden: true},
            other: {defaultValue: 'NA', hiddden: true}

        },
        tasks: {
            duedate: {
                parentConfig: {
                    storeIdentifier: {queryName: 'Necropsies', schemaName: 'study'},
                    dataIndex: 'date'
                }
                ,hidden: true
                ,shownInGrid: false
            }
        },
        Weight: {
            date: {
                parentConfig: {
                    storeIdentifier: {queryName: 'Necropsies', schemaName: 'study'},
                    dataIndex: 'timeofdeath'
                }
                ,hidden: false
                ,shownInGrid: false
            }
        }
    }
});