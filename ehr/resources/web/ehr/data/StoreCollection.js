/*
 * Copyright (c) 2013-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 *
 * @cfg extraMetaData
 */
Ext4.define('EHR.data.StoreCollection', {
    extend: 'Ext.util.Observable',

    clientStores: null,
    serverStores: null,
    hasLoaded: false, //will be set true after initial load
    clientDataChangeBuffer: 150,
    ignoredClientEvents: {},

    constructor: function(){
        this.collectionId = Ext4.id();
        this.clientStores = Ext4.create('Ext.util.MixedCollection', false, this.getKey);
        this.serverStores = Ext4.create('Ext.util.MixedCollection', false, this.getKey);

        this.callParent(arguments);
        this.addEvents('commitcomplete', 'commitexception', 'validation', 'initialload', 'load', 'clientdatachanged', 'serverdatachanged');

        this.on('clientdatachanged', this.onClientDataChanged, this, {buffer: this.clientDataChangeBuffer});
    },

    getKey: function(o){
        return o.storeId;
    },

    getServerStoreForQuery: function(schemaName, queryName){
        var store;

        this.serverStores.each(function(s){
            if (LABKEY.Utils.caseInsensitiveEquals(s.schemaName, schemaName) && LABKEY.Utils.caseInsensitiveEquals(s.queryName, queryName)){
                store = s;
                return false;
            }
        }, this);

        return store;
    },

    loadDataFromServer: function(){
        if (this.serverStoresLoading)
            return;

        this.serverStoresLoading = {};
        this.haveStoresLoaded = false;
        this.serverStores.each(function(s){
            this.serverStoresLoading[s.storeId] = true;
            s.load();
        }, this);
    },

    getServerStoreByName: function(title){
        var parts = title.split('.');
        var queryName = parts.pop();
        var schemaName = parts.join('.');

        return this.getServerStoreForQuery(schemaName, queryName);
    },

    getClientStoreByName: function(sectionName){
        return this.clientStores.get(this.collectionId + '-' + sectionName);
    },

    addServerStoreFromConfig: function(config){
        var storeConfig = Ext4.apply({}, config);
        Ext4.apply(storeConfig, {
            type: 'ehr-dataentryserverstore',
            autoLoad: false,
            storeId: this.collectionId + '||' + LABKEY.ext4.Util.getLookupStoreId({lookup: config})
        });

        var store = this.serverStores.get(storeConfig.storeId);
        if (store){
            console.log('Store already defined: ' + store.storeId);
            return store;
        }

        store = Ext4.create('EHR.data.DataEntryServerStore', storeConfig);

        this.addServerStore(store);

        return store;
    },

    //add an instantiated server-side store to the collection
    addServerStore: function(store){
        this.mon(store, 'load', this.onServerStoreLoad, this);
        this.mon(store, 'exception', this.onServerStoreException, this);
        this.mon(store, 'validation', this.onServerStoreValidation, this, {buffer: 100});
        store.storeCollection = this;

        this.serverStores.add(store);
    },

    onServerStoreLoad: function(store){
        if (this.serverStoresLoading && this.serverStoresLoading[store.storeId]){
            store.validateRecords(store.getRange(), true);
            delete this.serverStoresLoading[store.storeId];
        }

        if (LABKEY.Utils.isEmptyObj(this.serverStoresLoading)){
            delete this.serverStoresLoading;
            this.transformServerToClient();
            this.fireEvent('load', this);

            if (!this.haveStoresLoaded){
                this.haveStoresLoaded = true;
                if (this.initialData){
                    var data = Ext4.decode(this.initialData);
                    if (data){
                        for (var storeId in data){
                            var store = this.getClientStoreByName(storeId);
                            LDK.Assert.assertNotEmpty('Unable to find client store matching: ' + storeId, store);
                            if (store){
                                Ext4.Array.forEach(data[storeId], function(r){
                                    store.addClientModel(r);
                                }, this);
                            }
                        }
                    }
                }
                this.fireEvent('initialload', this);

                //note: delay this flag until after the 1st client->server transform
                Ext4.defer(function(){
                    this.hasLoaded = true;
                }, (this.clientDataChangeBuffer * 2), this);

            }
        }
    },

    onClientStoreAdd: function(store, records){
        //NOTE: this is added in case a record is removed then re-added, such as drag/drop reorder
        if (Ext4.isArray(records)){
            Ext4.Array.forEach(records, function(record){
                var recIdx = store.removed.indexOf(record);
                if (recIdx > -1){
                    Ext4.Array.remove(store.removed, record);
                }
            }, this);
        }

        if (!this.hasIgnoredClientEvent(store.storeId, 'add', true))
            this.fireEvent('clientdatachanged', 'add');
    },

    onClientStoreRemove: function(store, record){
        //note: stores do not normally keep track of removed phantom records
        if (record.phantom && store.removed.indexOf(record) == -1) {
            store.removed.push(record);
        }

        if (!this.hasIgnoredClientEvent(store.storeId, 'remove', true)){
            this.fireEvent('clientdatachanged', 'remove');
        }
    },

    onClientStoreBulkRemove: function(store, records){
        //note: stores do not normally keep track of removed phantom records
        if (records){
            for (var i=0;i<records.length;i++){
                if (records[i].phantom && store.removed.indexOf(records[i]) == -1) {
                    store.removed.push(records[i]);
                }
            }
        }

        if (!this.hasIgnoredClientEvent(store.storeId, 'bulkremove', true)){
            this.fireEvent('clientdatachanged', 'bulkremove');
        }
    },

    onClientStoreValidation: function(store){
        if (!this.hasIgnoredClientEvent(store.storeId, 'validation', true)){
            this.fireEvent('validation', this);
        }
    },

    onClientStoreUpdate: function(store){
        if (!this.hasIgnoredClientEvent(store.storeId, 'update', true))
            this.fireEvent('clientdatachanged', 'update');
    },

    onClientStoreDataChanged: function(store){
        if (!this.hasIgnoredClientEvent(store.storeId, 'datachanged', true))
            this.fireEvent('clientdatachanged', 'datachanged');
    },

    //used to allow buffering so clientdatachange events from many sources only trigger 1 recalculation
    onClientDataChanged: function(){
        //console.log('client data changed');
        this.transformClientToServer();
    },

    onServerStoreException: function(store){
        console.log('exception');
        console.log(arguments);
    },

    transformClientToServer: function(){
        if (EHR.debug)
            console.log('client to server');

        var changedRecords = {};
        this.clientStores.each(function(clientStore){
            clientStore.processServerRecords(this, changedRecords);
        }, this);

        if (Ext4.Object.getKeys(changedRecords).length > 0){
            this.validateRecords(changedRecords);
            this.fireEvent('serverdatachanged', this, changedRecords);
        }
        else
        {
            //this really isnt the right event to fire, but it will force a recalulation of buttons on the panel
            this.fireEvent('validation', this);
        }
    },

    validateAll: function(){
        this.serverStores.each(function(serverStore){
            serverStore.validateRecords(serverStore.getRange(), true);
        }, this);
    },

    validateRecords: function(recordMap){
        for (var serverStoreId in recordMap){
            var serverStore = this.serverStores.get(serverStoreId);
            serverStore.validateRecords(Ext4.Object.getValues(recordMap[serverStoreId]), true);
        }
    },

    serverToClientDataMap: null,

    getServerToClientDataMap: function(){
        if (this.serverToClientDataMap){
            return this.serverToClientDataMap;
        }

        this.serverToClientDataMap = {};
        this.clientStores.each(function(cs){
            var map = cs.getClientToServerRecordMap();
            for (var serverStoreId in map){
                if (!this.serverToClientDataMap[serverStoreId])
                    this.serverToClientDataMap[serverStoreId] = {};

                this.serverToClientDataMap[serverStoreId][cs.storeId] = map[serverStoreId];
            }
        }, this);

        return this.serverToClientDataMap;
    },

    _sortedServerStores: null,

    getSortedServerStores: function(){
        if (this._sortedServerStores)
            return this._sortedServerStores;

        var dependencies = [];
        var arr;
        this.clientStores.each(function(s){
            arr = s.getDependencies();
            if (arr.length){
                dependencies = dependencies.concat(arr);
            }
        }, this);

        dependencies = LDK.Utils.tsort(dependencies);
        dependencies.reverse();
        this._sortedServerStores = dependencies;

        //ensure all stores represented
        this.serverStores.each(function(s){
            var name = s.schemaName + '.' + s.queryName;
            if (dependencies.indexOf(name) == -1)
                dependencies.push(name);
        }, this);

        return dependencies;
    },

    setClientModelDefaults: function(model){
        //this method is designed to be overriden by subclasses

        //TODO: apply inheritance
    },

    updateClientModelInheritance: function(clientStore, clientModel){
        var map = clientStore.getInheritingFieldMap();
        var inheritance, serverStore, serverModel;
        Ext4.Array.forEach(Ext4.Object.getValues(map), function(field){
            inheritance = field.inheritance;
            serverStore = this.getServerStoreForQuery(inheritance.storeIdentifier.schemaName, inheritance.storeIdentifier.queryName);
            serverModel = this.getServerModelForInheritance(inheritance, serverStore, clientModel);
            if (!serverModel){
                console.error('missing server model');
            }
            else {
                clientModel.set(field.name, serverModel.get(inheritance.sourceField))
            }

        }, this);
    },

    getServerModelForInheritance: function(inheritance, serverStore, clientModel){
        if (inheritance.recordSelector){
            var rs = inheritance.recordSelector;
            var idx = serverStore.findBy(function(serverModel){
                for (var clientFieldName in rs){
                    if (clientModel.get(clientFieldName) != serverModel.get(rs[clientFieldName])){
                        return false;
                    }
                }

                return true;
            });

            if (idx > -1)
                return serverStore.getAt(idx);
        }
        else if (inheritance.recordIdx){
            return serverStore.getAt(inheritance.recordIdx);
        }
    },

    transformServerToClient: function(syncErrorsOnly){
        if (EHR.debug)
            console.log('server to client');

        var map = this.getServerToClientDataMap();
        var changedStoreIDs = {};
        Ext4.Array.forEach(this.getSortedServerStores(), function(name){
            var serverStore = this.getServerStoreByName(name);
            LDK.Assert.assertNotEmpty('Unable to find store with name: ' + name, serverStore);

            serverStore.transformRecordsToClient(this, map[name], changedStoreIDs, syncErrorsOnly);
        }, this);

        this.clientStores.each(function(s){
            s.loaded = true;
        });

        this.checkForServerErrorChanges();
    },

    addIgnoredClientEvent: function(storeId, event){
        this.ignoredClientEvents[storeId] = this.ignoredClientEvents[storeId] || {};
        this.ignoredClientEvents[storeId][event] = true;
    },

    hasIgnoredClientEvent: function(storeId, event, remove){
        if (this.ignoredClientEvents[storeId] && this.ignoredClientEvents[storeId][event]){
            if (remove)
                delete this.ignoredClientEvents[storeId][event];

            return true;
        }

        return false;
    },

    getClientStoreForSection: function(dataEntryPanel, section){
        var modelName = 'EHR.model.model-' + Ext4.id();
        var fields = EHR.model.DefaultClientModel.getFieldConfigs(section.fieldConfigs, section.configSources, this.extraMetaData);
        if (!fields.length){
            return;
        }

        Ext4.define(modelName, {
            extend: section.clientModelClass,
            fields: fields,
            sectionCfg: section,
            storeCollection: this,
            dataEntryPanel: dataEntryPanel
        });

        var clazz = section.clientStoreClass || 'EHR.data.DataEntryClientStore';
        var store = Ext4.create(clazz, {
            storeId: this.collectionId + '-' + section.name,
            model: modelName,
            loaded: false
        });

        this.addClientStore(store);

        return store;
    },

    //add an instantiated client-side store to the collection
    addClientStore: function(store){
        this.mon(store, 'add', this.onClientStoreAdd, this);
        this.mon(store, 'remove', this.onClientStoreRemove, this);
        this.mon(store, 'bulkremove', this.onClientStoreBulkRemove, this);
        this.mon(store, 'update', this.onClientStoreUpdate, this);
        this.mon(store, 'validation', this.onClientStoreValidation, this);
        this.mon(store, 'datachanged', this.onClientStoreDataChanged, this);
        store.storeCollection = this;

        this.clientStores.add(store);
    },

    //private
    getCommands: function(commitAll){
        var allCommands = [];
        var allRecords = [];

        this.serverStores.each(function(s){
            var ret = s.getCommands(s.getRange(), commitAll);
            if (ret.commands.length){
                allCommands = allCommands.concat(ret.commands);
                allRecords = allRecords.concat(ret.records);
            }
        }, this);

        return {
            commands: allCommands,
            records: allRecords
        }
    },

    getExtraContext: function(extraContext){
        var ret = {
            importPathway: 'ehr-ext4DataEntry'
        };

        this.clientStores.each(function(s){
            var ctx = s.getExtraContext();
            if (ctx){
                ret = LABKEY.Utils.merge(ret, ctx);
            }
        }, this);

        if (this.formConfig && this.formConfig.extraContext){
            ret = LABKEY.Utils.merge(ret, this.formConfig.extraContext);
        }

        LABKEY.Utils.merge(ret, extraContext);

        return ret;
    },

    commitChanges: function(commitAll, extraContext){
        var changed = this.getCommands(commitAll);
        this.commit(changed.commands, changed.records, this.getExtraContext(extraContext));
    },

    //private
    commit: function(commands, records, extraContext){
        extraContext = extraContext || {};

        if(this.fireEvent('beforecommit', this, records, commands, extraContext)===false)
            return;

        if (!commands || !commands.length){
            this.onComplete(extraContext);
            return;
        }

        this.sendRequest(records, commands, extraContext);
    },

    sendRequest: function(recordsArr, commands, extraContext, validateOnly){
        if (EHR.debug)
            console.log(commands);

        var cfg = {
            url : LABKEY.ActionURL.buildURL('query', 'saveRows', this.containerPath),
            method : 'POST',
            success: this.getOnCommitSuccess(recordsArr, validateOnly),
            failure: this.getOnCommitFailure(recordsArr, validateOnly),
            scope: this,
            timeout: 5000000,  //a little extreme?
            transacted: true,
            //transacted: !validateOnly,  //not necessary for validation, and shouldnt lock up the DB
            startTime: new Date(),
            jsonData : {
                apiVersion: 13.2,
                transacted: true,
                //transacted: !validateOnly,
                containerPath: this.containerPath,
                commands: commands,
                extraContext: this.getExtraContext(extraContext)
            },
            headers : {
                'Content-Type' : 'application/json'
            }
        };

        if (validateOnly){
            cfg.jsonData.validateOnly = true;
            cfg.jsonData.extraContext.isValidateOnly = true;
        }

        var request = LABKEY.Ajax.request(cfg);

        Ext4.Array.forEach(recordsArr, function(command){
            Ext4.Array.forEach(command, function(rec){
                rec.lastRequestId = request.id;
            }, this);
        }, this);
    },

//    /**
//     * Will test whether all records in this store collection pass validation or not.
//     * @returns {Boolean} True/false depending on whether all records in this StoreCollection pass validation
//     */
//    isValid: function(){
//        var valid = true;
//        this.serverStores.each(function(s){
//            if(!s.isValid()){
//                valid = false;
//            }
//        }, this);
//        return valid;
//    },
//
    /**
     * Tests whether any records in this store collection are dirty
     * @returns {boolean} True/false depending on whether any records in the collection are dirty.
     */
    isDirty: function(){
        var dirty = false;
        this.serverStores.each(function(s){
            if (s.getModifiedRecords().length){
                dirty = true;
                return false;
            }

            if (s.getRemovedRecords().length){
                dirty = true;
                return false;
            }
        }, this);

        return dirty;
    },

    getErrorMessages: function(excludeInfo){
        var ret = {};
        this.clientStores.each(function(store){
            var messages = [];
            var field, label;
            store.each(function(record, idx){
                record.validate().each(function(e){
                    if (excludeInfo && e.message.match(/^INFO:/)){
                        return;
                    }

                    field = store.getFields().get(e.field);
                    label = field ? (field.caption || field.name) : e.field;
                    messages.push('Row ' + (idx + 1) + ', ' + label + ': ' + e.message);
                }, this);
            }, this);

            if (messages.length){
                messages = Ext4.unique(messages);
                ret[store.model.prototype.sectionCfg.label] = messages;
            }
        }, this);

        return ret;
    },

    onServerStoreValidation: function(){
        this.transformServerToClient(true);
        this.fireEvent('validation', this);
    },

    getErrors: function(){
        var errors = [];
        this.clientStores.each(function(store){
            store.each(function(r){
                errors = errors.concat(r.validate().getRange());
            }, this);
        }, this);

        return errors;
    },

    getOnCommitFailure: function(recordArr, validateOnly) {
        return function(response, options) {
            //note: should not matter which child store they belong to
            Ext4.Array.forEach(recordArr, function(command){
                Ext4.Array.forEach(command, function(r){
                    delete r.saveOperationInProgress;
                }, this);
            }, this);

            var json = this.getJson(response);
            if (json){
                //this indicates we had a typical command array that failed.  we inspect each command for errors
                if (json.result){
                    //each error should represent 1 row.  there can be multiple errors per row
                    Ext4.Array.forEach(json.result, function(command, commandIdx){
                        if (command.errors){
                            var serverStore = this.getServerStoreForQuery(command.schemaName, command.queryName);
                            LDK.Assert.assertNotEmpty('Could not find store matching: ' + command.schemaName + '.' + command.queryName, serverStore);

                            serverStore.handleServerErrors(command.errors, recordArr[commandIdx], response.requestId);
                        }
                        else {
                            //ignore.  this would occur if a multi-command request is sent and 1 of the group fails.
                        }
                    }, this);
                }
                else if (json.exception){
                    var tables = [];
                    Ext4.Array.forEach(recordArr, function(command){
                        Ext4.Array.forEach(command, function(r){
                            if (r.store && r.store.queryName){
                                tables.push(r.store.queryName);
                            }
                        }, this);
                    }, this);

                    tables = Ext4.unique(tables);

                    LDK.Utils.logToServer({
                        level: 'ERROR',
                        message: 'StoreCollection exception: ' + json.exception + ('\nTables involved: [' + tables.join(',') + ']\nValidate Only: ' + validateOnly)
                    });

                    console.error(json.exception);
                }
            }

            if ((options.jsonData && options.jsonData.validateOnly)){
                if (json && !json.result && json.exception){
                    return;
                }

                this.fireEvent('validation', this);
            }
            else {
                this.fireEvent('commitexception', this, response);
            }
        };
    },

    //private
    possiblyReportLongRequest: function(duration, response, options, json){
        var msg = ['Long running request:'];
        msg.push('Duration: ' + duration);

        // non-validation should allow more total time/transaction, since it might involve more work on the actual insert/update
        // validation could involve warming the DemographicsCache, so we allow more per-row time, but less overall time/transaction
        var perRowWarningThrehsold = 0.2;
        var totalTransactionWarningThrehsold = 45;
        var perRowValidationWarningThrehsold = 5; //could involve DemographicCache warmup
        var totalValidationTransactionWarningThrehsold = 25; //total transaction thresold is lower for validation, since we expect small batches and dont actually insert into the DB

        if (this.formConfig){
            msg.push('Form Type: ' + this.formConfig.name);

            if (this.formConfig.perRowWarningThreshold){
                perRowWarningThrehsold = this.formConfig.perRowWarningThreshold;
            }
            if (this.formConfig.totalTransactionWarningThrehsold){
                perRowWarningThrehsold = this.formConfig.totalTransactionWarningThrehsold;
            }
            if (this.formConfig.perRowValidationWarningThrehsold){
                perRowWarningThrehsold = this.formConfig.perRowValidationWarningThrehsold;
            }
            if (this.formConfig.totalValidationTransactionWarningThrehsold){
                perRowWarningThrehsold = this.formConfig.totalValidationTransactionWarningThrehsold;
            }
        }

        if (this.taskId){
            msg.push('TaskId: ' + this.taskId);
        }

        if (this.requestId){
            msg.push('RequestId: ' + this.requestId);
        }

        if (!json || !json.result){
            msg.push('Unable to decode JSON');
        }

        if (response){
            msg.push('Status: ' + response.status);
        }

        if (json){
            msg.push('Error Count: ' + json.errorCount);
        }

        var totalRows = 0;
        if (options && options.jsonData) {
            if (options.jsonData.commands) {
                msg.push('Total Commands: ' + options.jsonData.commands.length);
                msg.push('Validate Only: ' + !!options.jsonData.validateOnly);

                Ext4.Array.forEach(options.jsonData.commands, function (command) {
                    totalRows += command.rows.length;
                }, this);

                msg.push('Total Rows: ' + totalRows + (totalRows ? ' (' + (duration / totalRows) + ' sec/row)' : null));
            }

            if (options && options.jsonData && !!options.jsonData.validateOnly) {
                //note: abort if either is true.
                if (duration < totalValidationTransactionWarningThrehsold || (duration / totalRows) <= perRowValidationWarningThrehsold) {
                    return;
                }
            }
            else {
                if (duration < totalTransactionWarningThrehsold || (duration / totalRows) <= perRowWarningThrehsold) {
                    return;
                }
            }
        }

        LDK.Utils.logToServer({
            level: 'ERROR',
            message: msg.join('\n')
        });

        LDK.Utils.logMetric({
            category: 'EHR',
            metricName: 'DataEntryPanelRequest',
            numericValue1: options.jsonData.commands ? options.jsonData.commands.length : null,
            stringValue1: this.formConfig ? this.formConfig.name : null
        });
    },

    //private
    getOnCommitSuccess: function(recordArr, validateOnly){
        return function(response, options){
            var json = this.getJson(response);

            //provide logging for especially long running requests
            if (options && options.startTime){
                var duration = (new Date() - options.startTime) / 1000;
                this.possiblyReportLongRequest(duration, response, options, json);
            }

            if (!json || !json.result)
                return;

            if (json.errorCount > 0){
                var callback = this.getOnCommitFailure(recordArr, validateOnly);
                callback.call(this, response, options);
                return;
            }

            for (var i=0;i<json.result.length;i++){
                var command = json.result[i];
                var records = recordArr[i];

                var store = this.getServerStoreForQuery(command.schemaName, command.queryName);
                LDK.Assert.assertNotEmpty('Unable to find matching store: ' + command.schemaName + '.' + command.queryName, store);

                if(options.jsonData && options.jsonData.extraContext && options.jsonData.extraContext.successURL){
                    //NOTE: since this indicates we expect to navigate the page, dont bother updating the client store
                }
                else {
                    Ext4.Array.forEach(records, function(r){
                        r.serverErrors.clear();
                    }, this);

                    if (!validateOnly){
                        store.processResponse(command.rows, command);
                    }
                }
            }

            this.transformServerToClient(true);
            if (validateOnly){
                this.fireEvent('validation', this);
            }

            this.onComplete((options.jsonData ? options.jsonData.extraContext : null));
        }
    },

    //private
    onComplete: function(extraContext){
        if (extraContext && extraContext.isValidateOnly){
            this.fireEvent('validation', this);
        }
        else {
            this.transformServerToClient();
            EHR.DemographicsCache.clearCache();
            this.fireEvent('commitcomplete', this, extraContext);
        }
    },

    //private
    getJson: function(response) {
        var ret = (response && undefined != response.getResponseHeader && undefined != response.getResponseHeader('Content-Type')
                && response.getResponseHeader('Content-Type').indexOf('application/json') >= 0)
                ? Ext4.decode(response.responseText)
                : null;

        if (response && ret)
            response.json = ret;

        return ret;
    },

    //private
    deleteAllRecords: function(extraContext){
        //NOTE: we delegate the deletion to each store, and track progress here so we can fire a single event
        var storesPerformingDeletes = [];
        var failures = 0;

        this.each(function(s){
            var records = [];
            s.each(function(r){
                records.push(r);
            }, this);

            function onComplete(response){
                s.un('commitcomplete', onComplete);
                s.un('commitexception', onComplete);

                if(storesPerformingDeletes.indexOf(s.storeId)!=-1){
                    storesPerformingDeletes.remove(s.storeId)
                }

                if(!storesPerformingDeletes.length){
                    if(failures == 0){
                        this.onComplete(extraContext);
                    }
                    else {
                        this.fireEvent('commitexception', this, response);
                    }
                }
            }

            s.on('commitcomplete', onComplete, this, {single: true});
            s.on('commitexception', onComplete, this, {single: true});

            storesPerformingDeletes.push(s.storeId);
            s.deleteRecords(records, extraContext);
        }, this);
    },

    getMaxErrorSeverity: function(){
        var maxSeverity = '';
        this.clientStores.each(function(store){
            maxSeverity = EHR.Utils.maxError(maxSeverity, store.getMaxErrorSeverity());
        }, this);

        return maxSeverity;
    },

    discard: function(extraContext){
        Ext4.Msg.wait('Discarding form...') ;

        var hasPermission = true;
        this.clientStores.each(function(s){
            s.each(function(r){
                if (!r.canDelete()){
                    hasPermission = false;
                    return false;
                }
            }, this);

            if (!hasPermission)
                return false;
        }, this);

        if (!hasPermission){
            Ext4.Msg.hide();
            Ext4.Msg.alert('Error', 'You do not have permission to delete this form');
            return;
        }

        this.clientStores.each(function(s){
            s.remove(s.getRange());
        }, this);

        this.transformClientToServer();
        this.commitChanges(true, extraContext);
    },

    checkForServerErrorChanges: function(){
        this.clientStores.each(function(s){
            s.checkForServerErrorChanges();
        }, this);
    }
});