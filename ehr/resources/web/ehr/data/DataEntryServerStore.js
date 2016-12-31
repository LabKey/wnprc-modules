/*
 * Copyright (c) 2013-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * The primary feature of this store is that it will validate records, which is essentially mock-saving the
 * records in order to run server-side validation and identify errors.  For this to work correctly, the tables
 * being used must also support validation.
 */
Ext4.define('EHR.data.DataEntryServerStore', {
    extend: 'LDK.data.LabKeyStore',
    alias: 'store.ehr-dataentryserverstore',

    constructor: function(){
        Ext4.apply(this, {
            pruneModifiedRecords: true,
            errors: new Ext4.util.MixedCollection(),
            doServerValidation: true
        });

        this.callParent(arguments);

        Ext4.override(this.proxy, {
            getRowData: function (record){
                var ret = this.callOverridden(arguments);
                ret._recordId = record.internalId;

                return ret;
            }
        });
    },

    ensureServerErrors: function(record){
        record.serverErrors = record.serverErrors || Ext4.create('EHR.data.Errors', {
            record: record.serverErrors
        });
    },

    onLoad : function(store, records, success) {
        if (records){
            for (var i=0;i<records.length;i++){
                this.ensureServerErrors(records[i]);
            }
        }

        this.callParent(arguments);
    },

    generateBaseParams: function(config){
        var baseParams = this.callParent(arguments);
        baseParams.apiVersion = 13.2;

        return baseParams;
    },

    findRecord: function(fieldName, value, clientModelInternalId){
        if (Ext4.isEmpty(value) && clientModelInternalId){
            var ret;
            this.each(function(sr){
                if (sr._clientModelId == clientModelInternalId){
                    ret = sr;
                    return false;
                }
            }, this);

            if (ret){
                return ret;
            }
        }

        var idx = this.findExact(fieldName, value);
        if (idx != -1){
            return this.getAt(idx);
        }
    },

    onUpdate: function(store, record, operation){
        this.callParent(arguments);
    },

    getCommands: function(records, forceUpdate, validateOnly){
        var commands = [];
        var recordsPerCommand = [];

        //batch records into CRUD operations
        var recMap = {
            create: [],
            update: [],
            destroy: []
        };

        //only commit changed records
        if (!records){
            recMap.create = this.getNewRecords() || [];
            recMap.update = this.getUpdatedRecords() || [];

            if (!validateOnly){
                var removed = this.getRemovedRecordsToSync();
                if (removed.destroy.length)
                    recMap.destroy = removed.destroy;
                if (removed.update.length)
                    recMap.update = recMap.update.concat(removed.update);
            }
        }
        else {
            var r;
            for (var i=0; i<records.length;i++){
                r = records[i];
                if (r.phantom){
                    recMap.create.push(r);
                }
                else if (forceUpdate || !LABKEY.Utils.isEmptyObj(r.modified)){
                    var v = r.get(this.proxy.reader.getIdProperty());
                    LDK.Assert.assertNotEmpty('Record passed as update which lacks keyfield for store: ' + this.storeId + '/' + this.proxy.reader.idProperty + '/' + Ext4.encode(r.modified), v);
                    if (v){
                        recMap.update.push(r);
                    }
                    else {
                        r.phantom = true;
                        recMap.create.push(r);
                    }
                }
            }

            var removed = this.getRemovedRecordsToSync();
            if (!validateOnly){
                if (removed.destroy.length)
                    recMap.destroy = removed.destroy;
                if (removed.update.length){
                    for (var i=0;i<removed.update.length;i++){
                        LDK.Assert.assertNotEmpty('Deleted record passed as delete/update which lacks keyfield for store: ' + this.storeId + '/' + this.proxy.reader.idProperty, removed.update[i].get(this.proxy.reader.idProperty));
                    }

                    recMap.update = recMap.update.concat(removed.update);
                }
            }
        }

        //NOTE: this is debugging code designed to track down the 'row not found' error.  ultimately we should fix this underlying issue and remove this
        if (recMap.update.length){
            var key = this.proxy.reader.getIdProperty();
            LDK.Assert.assertNotEmpty('Unable to find key field for: ' + this.storeId, key);
            var toRemove = [];
            Ext4.Array.forEach(recMap.update, function(r){
                LDK.Assert.assertNotEmpty('Record passed as update which lacks keyfield for store: ' + this.storeId + '/' + key, r.get(key));
                if (!r.get(key)){
                    r.phantom = true;
                    recMap.create.push(r);
                    toRemove.push(r);
                }
            }, this);

            if (toRemove.length){
                for (var i=0;i<toRemove.length;i++){
                    recMap.update.remove(toRemove[i]);
                }
            }
        }

        for (var action in recMap){
            if (!recMap[action].length)
                continue;

            var operation = Ext4.create('Ext.data.Operation', {
                action: action,
                records: recMap[action]
            });

            commands.push(this.proxy.buildCommand(operation));
            recordsPerCommand.push(operation.records);
        }

        return {
            commands: commands,
            records: recordsPerCommand
        };
    },

    getRemovedRecordsToSync: function(){
        var records = this.getRemovedRecords();
        var ret = {
            destroy: [],
            update: []
        };
        Ext4.Array.forEach(records, function(r){
            if (!r.phantom){
                if (r.isRemovedRequest)
                    ret.update.push(r);
                else
                    ret.destroy.push(r);
            }
        }, this);

        return ret;
    },

    removePhantomRecords: function(){
        this.each(function(r){
            if (r.phantom){
                this.remove(r);
            }
        }, this);
    },

    validateRecord: function(record, validateOnServer){
        this.validateRecords([record], validateOnServer);
    },

    //private
    //this method performs simple checks client-side then will submit the record for server-validation if selected
    validateRecords: function(records, validateOnServer){
        Ext4.Array.forEach(records, function(r){
            r.validate();
        }, this);

        if(validateOnServer){
            this.validateRecordsOnServer(records);
        }
        else {
            this.fireEvent('validation', this, records);
        }
    },

    //private
    validateRecordsOnServer: function(records){
        if(!records || !records.length)
            return;

        var commands = [];
        var recordArr = [];
        Ext4.Array.forEach(records, function(record){
            //NOTE: we remove saveOperationInProgress b/c this transaction is going to fail
            //therefore we do not want this flag to block a legitimate future save attempt.
            delete record.saveOperationInProgress;
            record.serverValidationInProgress = true;

            //build one command per record so failures on one dont block subsequent records
            var result = this.getCommands([record], true, true);
            commands = commands.concat(result.commands);
            recordArr = recordArr.concat(result.records);

        }, this);

        if (!commands.length){
            return false;
        }

        //add a flag per command to make sure this record fails
        this.storeCollection.sendRequest(recordArr, commands, {
            silent: true,
            targetQCState: null
        }, true);
    },

    processResponse: function(records, command){
        //clear server errors
        Ext4.Array.forEach(records, function(record){
            this.ensureServerErrors(record);
            record.serverErrors.clear();
        }, this);

        // NOTE: allow this to run first, so the LabKey store will handle changing keys in the manner it expects
        // The code below is being left in place for now, but may be unnecessary.  if there are no changes to apply, no edits should be made
        this.callParent(arguments);

        if (command.command != 'delete'){
            var idProp = this.proxy.reader.getIdProperty();
            Ext4.Array.forEach(command.rows, function(row){
                var record;
                if (row.oldKeys){
                    //NOTE: always test both upper and lower case.  somewhat ugly, but the DB can alter the case of GUIDs
                    if (!Ext4.isEmpty(row.oldKeys[idProp])){
                        var lc = new String(row.oldKeys[idProp]).toLowerCase();
                        var recordIdx = this.findBy(function (record){
                            return record.get(idProp) === (row.oldKeys[idProp]) || (!Ext4.isEmpty(record.get(idProp)) && new String(record.get(idProp)).toLowerCase() === lc);
                        });
                        if (recordIdx != -1){
                            record = this.getAt(recordIdx);
                        }
                    }

                    if (!record && !Ext4.isEmpty(row.values[idProp])){
                        var recordIdx = this.findBy(function(record){
                            return record.get(idProp) === row.values[idProp];
                        });
                        if (recordIdx != -1){
                            record = this.getAt(recordIdx);
                            console.log('found by new value');
                        }
                    }

                    if (!record && row.values.internalId){
                        var recordIdx = this.findBy(function(record){
                            return record.internalId === row.oldKeys.internalId;
                        });
                        if (recordIdx != -1){
                            record = this.getAt(recordIdx);
                            console.log('found by internal id');
                        }
                    }
                }

                LDK.Assert.assertNotEmpty('Unable to find record using key: ' + idProp + (row.oldKeys ? ', with value: ' + row.oldKeys[idProp] + '.  keys were: ' + Ext4.Object.getKeys(row.oldKeys).join(';') : ''), record);
                if (record){
                    var toSet = {};
                    for (var fieldName in row.values){
                        var field = record.fields.get(fieldName);
                        if (field){
                            var newVal = field.convert(row.values[fieldName]);
                            if (field.type.type == 'date'){
                                if (!Ext4.Date.isEqual(newVal, record.get(fieldName))){
                                    toSet[fieldName] = row.values[fieldName];
                                }
                            }
                            else if (newVal !== record.get(fieldName)){
                                toSet[fieldName] = row.values[fieldName];
                            }
                        }
                    }

                    if (!Ext4.Object.isEmpty(toSet)){
                        record.set(toSet);
                    }
                }
            }, this);
        }
    },

    handleServerErrors: function(errors, records, requestId){
        //clear all server errors
        Ext4.Array.forEach(records, function(record){
            this.ensureServerErrors(record);
            record.serverErrors.clear();
        }, this);

        if (errors.errors){
            Ext4.Array.forEach(errors.errors, function(rowError, idx){
                var record = records[rowError.rowNumber];
                if (rowError.row){
                    var found;
                    var idProp = this.proxy.reader.getIdProperty();
                    if (idProp && rowError.row[idProp]){
                        found = this.findRecord(idProp, rowError.row[idProp]);
                        // this is a hack to deal w/ SQLServer converting GUIDs into uppercase, even if generated initially as lowercase
                        // we should not be creating GUIDs in upper case, but retain this check as a fallback
                        if (!found){
                            found = this.findRecord(idProp, new String(rowError.row[idProp]).toLowerCase());
                        }

                        //NOTE: the value could be set on the server, so also try to find by internal ID
                        if (!found && rowError.row._recordid){
                            found = this.getById(rowError.row._recordid);
                        }

                        if (!found && rowError.row._recordid){
                            this.each(function (cr) {
                                if (cr.internalId == rowError.row._recordid) {
                                    found = cr;
                                    return false;
                                }
                            }, this);
                        }
                    }
                    else if (this.model.prototype.fields.get('objectid')){
                        found = this.findRecord('objectid', rowError.row['objectid']);
                        //this is a hack to deal w/ SQLServer converting GUIDs into uppercase, even if generated initially as lowercase
                        if (!found && rowError.row['objectid']){
                            found = this.findRecord('objectid', rowError.row['objectid'].toLowerCase());
                        }
                    }

                    if (found && record && found != record){
                        // i believe this will happen because certain server-side errors are 1-based, not 0-based for rowNumber
                        //LDK.Assert.assertEquality('Record PK and rowNumber do not match', found, record);
                    }
                    else {
                        record = found;
                    }
                }
                else {
                    //TODO: there is some sort of inconsistency on the server when assigning rowNumber
                    record = records[rowError.rowNumber - 1];
                }

                if (!record){
                    //NOTE: disabled since I believe this is a legitmate condition.  if the record is deleted client-side prior to validation returning, this could occur.
                    //LDK.Utils.logToServer({
                    //    level: 'ERROR',
                    //    message: 'Unable to find matching record after validation.  Row # was: ' + rowError.rowNumber + '.\n' +
                    //            'storeId: ' + this.storeId + '\n' +
                    //            'Total records in store: ' + this.getCount() + '\n' +
                    //            'Total records received: ' + records.length + '\n' +
                    //            'exception: ' + rowError.exception + '\n' +
                    //            'Row Data: ' + Ext4.encode(rowError.row) + '\n'
                    //});

                    return;
                }

                if (record.lastRequestId && record.lastRequestId > requestId){
                    return;
                }

                if (rowError.errors){
                    //now iterate field errors
                    var serverErrorMap = {};
                    Ext4.Array.forEach(rowError.errors, function(fieldError, idx){
                        //this is a flag used by server-side validation scripts
                        if (fieldError.field == '_validateOnly') {
                            return;
                        }

                        var severity = 'ERROR';
                        var msg = fieldError.message;

                        //translate the default server errors
                        if (msg.match('Missing value for required property: ')){
                            msg = 'ERROR: This field is required';
                        }

                        if (msg.match(': ')){
                            severity = msg.split(': ').shift();
                        }

                        serverErrorMap[fieldError.field] = serverErrorMap[fieldError.field] || [];
                        serverErrorMap[fieldError.field].push({
                            msg: msg,
                            message: msg,
                            severity: severity,
                            fromServer: true,
                            field: fieldError.field,
                            serverRecord: record,
                            id: LABKEY.Utils.generateUUID()
                        });
                    }, this);

                    Ext4.Array.forEach(Ext4.Object.getKeys(serverErrorMap), function(field){
                        record.serverErrors.replaceErrorsForField(field, serverErrorMap[field]);
                    }, this);
                }
                else {
                    console.error('unhandled error');
                    console.log(rowError);
                }
            }, this);
        }
        else {
            console.error('unhandled error');
            console.log(errors);
        }

        this.fireEvent('validation', this, records);
    },

    getKeyField: function(){
        if (this.keyFieldName)
            return this.keyFieldName;

        var keyFields = [];
        this.getFields().each(function(f){
            if (f.isKeyField){
                //hack
                if (f.name == 'lsid')
                    keyFields.push('objectid');
                else
                    keyFields.push(f.name);
            }
        }, this);

        LDK.Assert.assertEquality('Incorrect number of key fields: ' + this.storeId + ' / ' + keyFields.join(';'), 1, keyFields.length);

        if (keyFields.length == 1){
            this.keyFieldName = keyFields[0];
            return this.keyFieldName;
        }
    },

    getMaxErrorSeverity: function(){
        var maxSeverity;
        this.each(function(r){
            r.validate().each(function(e){
                maxSeverity = EHR.Utils.maxError(maxSeverity, (e.severity));
            }, this);
        }, this);

        return maxSeverity;
    },

    transformRecordsToClient: function(sc,targetChildStores, changedStoreIDs, syncErrorsOnly){
        var fieldMap, clientStore, serverFieldName, clientKeyField, toRemove = [], toFireValidation = [];
        this.each(function(serverModel){
            var found = false;

            for (var clientStoreId in targetChildStores){
                clientStore = sc.clientStores.get(clientStoreId);
                LDK.Assert.assertNotEmpty('Unable to find client store with Id: ' + clientStoreId, clientStore);
                clientKeyField = clientStore.getKeyField();

                var clientModel = clientStore.findRecord(clientKeyField, serverModel.get(clientKeyField), serverModel._clientModelId);
                if (!clientModel && !syncErrorsOnly){
                    //first look for this model in deleted records
                    if (clientStore.getRemovedRecords().length){
                        var foundRecord;
                        Ext4.each(clientStore.getRemovedRecords(), function(rr){
                            if (rr.get(clientKeyField) === serverModel.get(clientKeyField)){
                                foundRecord = rr;
                                return false;
                            }
                        }, this);

                        if (foundRecord){
                            console.log('have server record for a removed client record, removing');
                            toRemove.push(foundRecord);
                            return;
                        }
                    }

                    if (serverModel._clientModelId){
                        var clientModelIdx = clientStore.findBy(function(record){
                            return record.internalId === serverModel._clientModelId;
                        });
                        if (clientModelIdx != -1){
                            clientModel = clientStore.getAt(clientModelIdx);
                            console.log('found by internal id')
                        }
                    }
                    else {
                        clientModel = clientStore.addClientModel({});
                        clientModel.raw = clientModel.raw || {};
                    }
                }

                if (clientModel){
                    found = true;
                    clientModel.phantom = serverModel.phantom;

                    fieldMap = targetChildStores[clientStoreId];
                    clientModel.suspendEvents();

                    var changedData = false;
                    for (var clientFieldName in fieldMap){
                        serverFieldName = fieldMap[clientFieldName];
                        LDK.Assert.assertNotEmpty('Unable to find serverField to match clientField: ' + clientFieldName, serverFieldName);

                        if (!syncErrorsOnly){
                            //transfer values
                            var clientVal = Ext4.isEmpty(clientModel.get(clientFieldName)) ? null : clientModel.get(clientFieldName);
                            var serverVal = Ext4.isEmpty(serverModel.get(serverFieldName)) ? null : serverModel.get(serverFieldName);
                            if (serverVal != clientVal){
                                changedData = true;
                                clientModel.set(clientFieldName, serverVal);
                                if (serverModel.raw && serverModel.raw[serverFieldName]){
                                    clientModel.raw[clientFieldName] = clientModel.raw[clientFieldName] || {};
                                    Ext4.apply(clientModel.raw[clientFieldName], serverModel.raw[serverFieldName]);
                                    delete clientModel.raw[clientFieldName].url;
                                }
                                changedStoreIDs[clientStore.storeId] = true;
                            }
                        }

                        //also sync server errors
                        LDK.Assert.assertNotEmpty('Server errors is null', serverModel.serverErrors);
                        var se = serverModel.serverErrors.getByField(serverFieldName) || [];
                        clientModel.serverErrors.replaceErrorsForField(clientFieldName, se);
                        changedStoreIDs[clientStore.storeId] = true;
                    }

                    clientModel.resumeEvents();
                }
            }

            if (!found && !syncErrorsOnly){
                if (serverModel.phantom){
                    //ignore
                    console.log('phantom servermodel is unable to find client record.  this probably indicates the client record it was removed');
                    this.remove(serverModel);
                }
                else {
                    console.error('unable to find client model for record');
                    console.log(serverModel);
                }
            }
        }, this);

        if (toRemove.length){
            Ext4.Array.forEach(toRemove, function(r){
                console.log('removing server record');
                this.remove(r);
            }, this);
        }

        //NOTE: this is disabled because it serverToClient() is called before clientToServer().
        //as a result, if the client already has a record (like auto-bound forms), we get a false positive
        //there is a similar check in clientStore, which should accomplish the same thing.
        //var clientStoreIds = Ext4.Object.getKeys(targetChildStores);
        //if (clientStoreIds.length == 1){
        //    var cs = sc.clientStores.get(clientStoreIds[0]);
        //    LDK.Assert.assertEquality('Server/Client stores do not have the same record count: ' + this.storeId + ' (' + this.getCount() + ') / ' + cs.storeId + ' (' + cs.getCount() + ')', cs.getCount(), this.getCount());
        //}
    },

    //creates and adds a model to the provided server store, handling any dependencies within other stores in the collection
    addServerModel: function(data){
        data = data || {};
        if (EHR.debug)
            console.log('creating server model');
        var model = this.createModel(data);
        model.serverErrors = Ext4.create('EHR.data.Errors', {
            record: model
        });

        this.add(model);

        return model;
    }
});

