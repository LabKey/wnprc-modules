/*
 * Copyright (c) 2010-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.namespace('EHR.ext', 'EHR.Utils');

/**
 * @namespace Utils static class to provide miscellaneous utility functions.
 * @name EHR.Utils
 */

EHR.Utils = new function(){
    return {

        /**
         * Helper to test whether the current user is a member of at least one of the provided groups
         * @param {array} groups A list of groups to test.
         * @param {function} success The success callback function
         * @returns {boolean} True/false depending on whether the current user is a member of at least one of the supplied groups
         */
        isMemberOf: function(groups, successCallback){
            if (typeof(groups) != 'object')
                groups = [groups];

            LABKEY.Security.getGroupsForCurrentUser({
                successCallback: function (results){
                    for(var i=0;i<results.groups.length;i++){
                        if (groups.contains(results.groups[i].name)){
                            successCallback();
                            return true;
                        }
                    }
                }
            });
        },


        /**
         * A generic error handler.  This function will insert a record into the audit table, which provides a mechanism to monitor client-side errors.
         * Can be used directly as the failure callback for asyc calls (ie. failure: EHR.Utils.onError).  However, this could also be used directly by passing in an object with the property 'exception'.
         * @param {object} error The error object passed to failure callbacks.
         */
        onError: function(error){
            Ext.Msg.hide();
            console.log('ERROR: ' + error.exception);
            console.log(error);


            LABKEY.Query.insertRows({
                 //it would be nice to store them in the current folder, but we cant guarantee they have write access..
                 containerPath: '/shared',
                 schemaName: 'auditlog',
                 queryName: 'audit',
                 rows: [{
                    EventType: "Client API Actions",
                    Key1: "Client Error",
                    //NOTE: labkey should automatically crop these strings to the allowable length for that field
                    Key2: window.location.href,
                    Key3: (error.stackTrace && Ext4.isArray(error.stackTrace) ? error.stackTrace.join('\n') : null),
                    Comment: (error.exception || error.statusText || error.message),
                    Date: new Date()
                 }],
                 success: function(){
                     console.log('Error successfully logged')
                 },
                 failure: function(error){
                    console.log('Problem logging error');
                    console.log(error)
                 }
            });
        },

        /**
         * A utility designed to recursively merge two objects, applying properties from the second only if they do not exist in the first.
         * @param {object} o The first object
         * @param {object} c Object that will be applied to the first
         * @param {integer} maxDepth The maximum depth to recurse
         * @returns {object} The merged object
         */
        rApplyIf: function(o, c, maxDepth, depth){
            maxDepth = maxDepth || 50;
            depth = depth || 1;
            o = o || {};
            if (depth>maxDepth){
                console.log('Warning: rApplyIf hit : '+depth);
            }

            for (var p in c){
                if (!Ext4.isDefined(o[p]) || depth >= maxDepth)
                    o[p] = c[p];
                else if (Ext4.isObject(o[p])){
                    EHR.Utils.rApplyIf(o[p], c[p], maxDepth, depth+1);
                }
            }

            return o;
        },

        /**
         * A utility designed to recursively merge two objects.
         * @param {object} o The first object
         * @param {object} c Object that will be applied to the first
         * @param {integer} maxDepth The maximum depth to recurse
         * @returns {object} The merged object
         */
        rApply: function(o, c, maxDepth, depth){
            maxDepth = maxDepth || 50;
            depth = depth || 1;
            if(depth>=maxDepth){
                console.log('Warning: rApply hit max: '+depth);
            }
            o = o || {};

            for (var p in c){
                if (!Ext4.isObject(o[p]) || !Ext4.isObject(c[p]) || depth >= maxDepth){
                        o[p] = c[p];
                }
                else {
                    EHR.Utils.rApply(o[p], c[p], maxDepth, depth+1);
                }
            }
            return o;
        },

        /**
         * A utility designed to recursively merge two objects, applying properties from the second only if they do not exist in the first and returning a deep copy of the first object.
         * @param {object} o The first object
         * @param {object} c Object that will be applied to the first
         * @param {integer} maxDepth The maximum depth to recurse
         * @returns {object} The cloned object
         */
        rApplyCloneIf: function(o, c, maxDepth, depth){
            maxDepth = maxDepth || 50;
            depth = depth || 1;
            o = o || {};
            if(depth>=maxDepth){
                console.log('Warning: rApplyCloneIf hit max: '+depth);
            }

            for(var p in c){
                if ((!Ext4.isDefined(o[p]) && !Ext4.isObject(c[p])) || depth >= maxDepth)
                    o[p] = c[p];
                else if (!Ext4.isDefined(o[p]) && Ext4.isObject(c[p])){
                    o[p] = {};
                    EHR.Utils.rApplyClone(o[p], c[p], maxDepth, depth+1);
                }
                else if (Ext4.isObject(o[p])){
                    EHR.Utils.rApplyCloneIf(o[p], c[p], maxDepth, depth+1);
                }
            }

            return o;
        },

        /**
         * A utility designed to recursively merge two objects, returning a deep copy of the first.
         * @param {object} o The first object
         * @param {object} c Object that will be applied to the first
         * @param {integer} maxDepth The maximum depth to recurse
         * @returns {object} The cloned object
         */
        rApplyClone: function(o, c, maxDepth, depth){
            maxDepth = maxDepth || 50;
            depth = depth || 1;
            if (depth>maxDepth){
                console.log('Warning: rApplyClone hit max: '+depth);
            }
            o = o || {};

            for (var p in c){
                if(!Ext4.isObject(c[p]) || depth >= maxDepth)
                        o[p] = c[p];
                else {
                    if (!Ext4.isObject(o[p]))
                        o[p] = {};
                    EHR.Utils.rApplyClone(o[p], c[p], maxDepth, depth+1);
                }
            }
            return o;
        },


        /**
         * A utility designed to test whether an object is empty (ie. {})
         * @param {object} o The object to test
         * @returns {boolean} True/false depending on whether the object is empty
         */
        isEmptyObj: function(ob){
           for (var i in ob)
               return false;
           return true;
        },

        //private
        //this object provides a numeric hierarchy to the error severities returned by the server
        errorSeverity: {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            FATAL: 4
        },


        //private
        //a helper that will compare two errors and return the most severe
        maxError: function(severity1, severity2){
            if (!severity1 || EHR.Utils.errorSeverity[severity1] < EHR.Utils.errorSeverity[severity2])
                return severity2;
            else
                return severity1;
        },


        /**
         * A utility that convert an input string to title case
         * @param {string} string The input string
         * @returns {string} The string converted to title case
         */
        toTitleCase: function(str){
            return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        },


        /**
         * A utility that will take an input value and pad with left-hand zeros until the string is of the desired length
         * @param {number} input The input number
         * @param {integer} length The desired length of the string.  The input will be padded with zeros until it reaches this length
         * @returns {number} The padded number
         */
        padDigits: function(n, totalDigits){
            n = n.toString();
            var pd = '';
            if (totalDigits > n.length){
                for (var i=0; i < (totalDigits-n.length); i++){
                    pd += '0';
                }
            }
            return pd + n;
        },


        /**
         * A utility that will create or update task, potentially including child records based on a supplied config.
         * @param {object} config The configuration object.
         * @param {string} [config.taskId] The GUID to use for this panel.  If blank a new GUID will be created.
         * @param {boolean} [config.doUpdateTask] If true, this command will update an existing task (based on the provided taskId), rather than create a new one.
         * @param {string} [config.initialQCState] The initial QCState to use for any new records.  Defaults to 'In Progress'
         * @param {string} [config.containerPath] The container path used by the stores in this form.  Defaults to the current container.
         * @param {array} [config.childRecords] An array of objects to be used to create records in any child stores.  Each of these objects must have the following properties:
         * <li>schemaName: The name of the schema</li>
         * <li>queryName: The name of the query</li>
         * <li>Rows: An array of row objects that will be passed to LABKEY.Query.insertRows</li>
         * @param {object} [config.taskRecord] An object with initial values for the record used task.  This will be passed to either insertRows or updateRows, depending on the value of doUpdateTask
         * @param {object} [config.existingRecords] An map of pairs containing the name of a dataset and an array of LSIDs from that dataset that match existing records that should be added to this task.  This option is used by blood and clinpath requests.  In this situation a task is simultaneously created and existing requested blood draws are added to it.
         */
        createTask: function(config){
            config.initialQCState = config.initialQCState || 'In Progress';
            config.taskRecord = config.taskRecord || {};
            config.taskId = config.taskRecord.taskId || config.taskId || LABKEY.Utils.generateUUID().toUpperCase();
            config.taskRecord.taskId = config.taskId;

            if (!config.doUpdateTask)
                config.taskRecord.QCStateLabel = config.initialQCState;

            config.containerPath = config.containerPath || LABKEY.ActionURL.getContainer();
            config.childRecords = config.childRecords || [];

            var commands = [];
            if (!config.doUpdateTask){
                commands.push({
                    schemaName: 'ehr',
                    queryName: 'tasks',
                    command: 'insertWithKeys',
                    rows: [{values: config.taskRecord}]
                });
            }
            else {
                commands.push({
                    schemaName: 'ehr',
                    queryName: 'tasks',
                    command: 'updateChangingKeys',
                    rows: [{values: config.taskRecord, oldKeys: {taskid: config.taskId}}]
                });
            }

            if (config.childRecords.length){
                Ext4.each(config.childRecords, function(r){
                    var rows = [];
                    Ext4.each(r.rows, function(row){
                        row.taskId = config.taskId;
                        delete row.QCState;
                        delete row.qcstate;
                        row.QCStateLabel = config.initialQCState;
                        rows.push({values: row});
                    }, this);

                    commands.push({
                        schemaName: r.schemaName,
                        queryName: r.queryName,
                        command: 'insertWithKeys',
                        rows: rows
                    });
                });
            }

            if (config.existingRecords){
                for (var dataset in config.existingRecords){
                    var rows = [];
                    var row;
                    Ext4.each(config.existingRecords[dataset], function(lsid){
                        var row = {};
                        if (Ext4.isObject(lsid)){
                            row = lsid;
                            lsid = row.lsid;
                        }

                        row = Ext4.apply(row, {taskId: config.taskId, lsid: lsid, QCStateLabel: config.initialQCState});
                        rows.push({values: row, oldKeys: {lsid: lsid}});
                    }, this);

                    commands.push({
                        schemaName: 'study',
                        queryName: dataset,
                        command: 'updateChangingKeys',
                        rows: rows
                    });
                }
            }

            if (commands.length){
                LABKEY.Ajax.request({
                    url : LABKEY.ActionURL.buildURL('query', 'saveRows', config.containerPath),
                    method : 'POST',
                    success: function(response, options){
                        if(config.success){
                            config.success.call((config.scope || this), response, options, config);
                        }
                    },
                    failure: LDK.Utils.getErrorCallback({
                        callback: config.failure,
                        scope: config.scope
                    }),
                    scope: this,
                    jsonData : {
                        containerPath: config.containerPath,
                        commands: commands
                    },
                    headers : {
                        'Content-Type' : 'application/json'
                    }
                });
            }
        },


        /**
         * A sorter function that can be used to sort an Ext store.  This is useful because it allows a store to be sorted on the displayValue of a field.
         * @param {array} fieldList An ordered array of objects describing sorts to be applied to a store.  Each object has the following properties:
         * <li>storeId: The Id of the lookup store</li>
         * <li>displayField: The displayfield (ie. the field holding the value displayed to the user</li>
         * <li>valueField: The field that corresponds to the value that is stored in the record</li>
         * @returns {function} The sorter function that can be passed to the sort() method of an Ext.data.Store or subclass of this.

         */
        sortStore: function(fieldList){
            return function(a, b){
                var retVal = 0;
                Ext4.each(fieldList, function(item){
                    var val1 = '';
                    var val2 = '';
                    if(!item.storeId){
                        val1 = a.get(item.term) || '';
                        val2 = b.get(item.term) || '';
                    }
                    else {
                        var store = Ext.StoreMgr.get(item.storeId);
                        var rec1;
                        var rec2;
                        rec1 = store.find(item.valueField, a.get(item.term));
                        if(rec1 != -1){
                            rec1 = store.getAt(rec1);
                            val1 = rec1.get(item.displayField) || '';
                        }
                        rec2 = store.find(item.valueField, b.get(item.term));
                        if(rec2 != -1){
                            rec2 = store.getAt(rec2);
                            val2 = rec2.get(item.displayField) || '';
                        }
                    }

                    if(val1 < val2){
                        retVal = -1;
                        return false;
                    }
                    else if (val1 > val2){
                        retVal = 1;
                        return false;
                    }
                    else {
                        retVal = 0;
                    }
                }, this);
                return retVal;
            }
        },


        /**
         * Returns the value for the EHR containerPath on this server.  If the property has not been set, and if the Id of a element
         * is provided,  it will write a message to that element.
         * @returns {Object}
         */
        getEHRContext: function(msgTarget, requiredProps){
            var ctx = LABKEY.getModuleContext('ehr');
            var requiredProps = requiredProps || ['EHRStudyContainer'];
            var missingProps = [];
            for (var i=0;i<requiredProps.length;i++){
                if(!ctx[requiredProps[i]])
                    missingProps.push(requiredProps[i]);
            }

            if (missingProps.length > 0){
                if (msgTarget)
                    Ext4.get(msgTarget).update('The following module properties for the EHR have not been set: ' + missingProps.join(', ') + '.  Please ask you administrator to configure this under the folder settings page.');
                return null;
            }

            return ctx;
        },

        /**
         * Returns the list of links that have been registered to appear on a given page
         * @param config A config object
         * @param {array} config.linkTypes
         * @param {function} config.success The success callback.
         * @param {function} config.failure The failure callback.  Note: this will be called for a failure on each individual query, as opposed to one failure callback for the entire set, so it could potentially be called more than once.
         * @param {object} config.scope The scope of the callbacks.
         */
        getReportLinks: function(config){
            if (!config || !config.linkTypes){
                alert('Must provide an array of linkTypes');
                return;
            }

            return LABKEY.Ajax.request({
                url : LABKEY.ActionURL.buildURL('ehr', 'getReportLinks', config.containerPath, {linkTypes: config.linkTypes}),
                method : 'POST',
                success: LABKEY.Utils.getCallbackWrapper(function(response){
                    var map = {};
                    Ext4.each(response.items, function(item){
                        var type = item.type;
                        if (!map[type])
                            map[type] = {};

                        if (!item.category)
                            return;

                        if (!map[type][item.category])
                            map[type][item.category] = [];

                        map[type][item.category].push(item);
                    }, this);

                    var domSpec = [];
                    var ctx = EHR.Utils.getEHRContext();
                    var types = Ext4.Object.getKeys(map);
                    types = types.sort();

                    var ret = {};
                    Ext4.each(types, function(type){
                        ret[type] = {
                            domSpec: null,
                            sections: {}
                        };

                        var domSpec = [];
                        var categories = Ext4.Object.getKeys(map[type]);
                        categories = categories.sort();
                        if (categories.length){
                            Ext4.each(categories, function(c, idx){
                                ret[type].sections[c] = map[type][c];

                                var toAdd = [];
                                toAdd.push({
                                    tag: 'h3',
                                    html: '<b>' + c + ':</b>'
                                });

                                toAdd.push({
                                    tag: 'ul',
                                    children: []
                                });

                                var sorted = LDK.Utils.sortByProperty(map[type][c], 'label');
                                Ext4.each(sorted, function(item){
                                    toAdd[1].children.push({
                                        tag: 'li',
                                        html: '<a href="' + (item.url || LABKEY.ActionURL.buildURL(item.controller, item.action, ctx['EHRStudyContainer'], item.params)) + '">' + item.label + '</a>'
                                    })
                                }, this);

                                domSpec = domSpec.concat(toAdd);
                            }, this);
                        }

                        ret[type].domSpec = domSpec;
                    }, this);

                    var callback = LABKEY.Utils.getOnSuccess(config);
                    if (callback)
                        callback.call((config.scope || this), ret);
                }),
                failure: LDK.Utils.getErrorCallback()
            });
        },

        /**
         * Retrieve the list of available data entry forms
         * @param [config.includeFormElements] true to include form elements (which is slower).  defaults to false.
         * @param [config.containerPath] the container to test
         * @param config.success Success callback
         * @param config.scope Scope for the callback
         */
        getDataEntryItems: function(config){
            config = config || {};

            LABKEY.Ajax.request({
                url : LABKEY.ActionURL.buildURL('ehr', 'getDataEntryItems', config.containerPath),
                method : 'POST',
                scope: config.scope,
                failure: LDK.Utils.getErrorCallback({
                    callback: config.failure,
                    scope: config.scope
                }),
                success: LABKEY.Utils.getCallbackWrapper(LABKEY.Utils.getOnSuccess(config), config.scope),
                params: {
                    includeFormElements: !!config.includeFormElements
                }
            });
        },

        roundToNearest: function(val, round){
            if (!val || !round){
                return val;
            }

            var remainder = val % round;
            var remainderPct = remainder / round;
            var base = Math.floor(val / round);
            if (remainder === 0){
                return val;
            }
            //note: JS seems to handle division poorly in situations like 4 / 0.1
            else if (remainderPct < 0.5 || remainderPct > 0.9999){
                return (base * round);
            }
            else {
                return (base * round) + round;
            }
        },

        editUIButtonHandler: function(schemaName, queryName, dataRegionName, paramMap, copyFilters){
            var params = {
                schemaName: schemaName,
                'query.queryName': queryName,
                showImport: true
            };

            if (copyFilters !== false && dataRegionName){
                var array = LABKEY.DataRegions[dataRegionName].getUserFilterArray();
                if (array && array.length){
                    for (var i=0;i<array.length;i++){
                        var filter = array[i];
                        params[filter.getURLParameterName()] = filter.getURLParameterValue();
                    }
                }

                //append non-removeable filters
                if (LABKEY.DataRegions[dataRegionName].qwp && LABKEY.DataRegions[dataRegionName].qwp.filters){
                    var array = LABKEY.DataRegions[dataRegionName].qwp.filters;
                    for (var i=0;i<array.length;i++){
                        var filter = array[i];
                        params[filter.getURLParameterName()] = filter.getURLParameterValue();
                    }
                }
            }

            if (paramMap != null){
                for (var param in paramMap){
                    if (LABKEY.ActionURL.getParameter(param)){
                        params[paramMap[param]] = LABKEY.ActionURL.getParameter(param);
                    }
                }
            }

            window.location = LABKEY.ActionURL.buildURL('ehr', 'updateQuery', null, params);
        },

        showFlagPopup: function(id, el){
            var ctx = EHR.Utils.getEHRContext() || {};
            Ext4.create('Ext.window.Window', {
                title: 'Flag Details: ' + id,
                width: 880,
                modal: true,
                bodyStyle: 'padding: 5px;',
                items: [{
                    xtype: 'grid',
                    cls: 'ldk-grid', //variable row height
                    border: false,
                    store: {
                        type: 'labkey-store',
                        containerPath: ctx['EHRStudyContainer'],
                        schemaName: 'study',
                        queryName: 'flags',
                        columns: 'Id,date,enddate,flag/category,flag/value,remark,performedby',
                        filterArray: [LABKEY.Filter.create('Id', id), LABKEY.Filter.create('isActive', true)],
                        autoLoad: true
                    },
                    viewConfig: {
                        //loadMask: !(Ext4.isIE && Ext4.ieVersion <= 8)
                    },
                    columns: [{
                        header: 'Category',
                        dataIndex: 'flag/category'
                    },{
                        header: 'Meaning',
                        dataIndex: 'flag/value',
                        tdCls: 'ldk-wrap-text',
                        width: 200
                    },{
                        header: 'Date Added',
                        dataIndex: 'date',
                        xtype: 'datecolumn',
                        format: 'Y-m-d',
                        width: 110
                    },{
                        header: 'Date Removed',
                        dataIndex: 'enddate',
                        xtype: 'datecolumn',
                        format: 'Y-m-d',
                        width: 110
                    },{
                        header: 'Remark',
                        dataIndex: 'remark',
                        tdCls: 'ldk-wrap-text',
                        width: 210
                    },{
                        header: 'Entered By',
                        dataIndex: 'performedby',
                        width: 110
                    }],
                    border: false
                }],
                buttons: [{
                    text: 'Close',
                    handler: function(btn){
                        btn.up('window').close();
                    }
                }]
            }).show(el);
        }
    }
};