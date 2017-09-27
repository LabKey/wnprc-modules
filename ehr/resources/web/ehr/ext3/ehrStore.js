/*
 * Copyright (c) 2010-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.namespace("EHR", "EHR.ext");

/**
 * Constructs a new EHR AdvancedStore using the supplied configuration.
 * @class
 * EHR extension to the LABKEY.ext.Store, which constructs a store, configured based on the query's metadata.
 * This class understands various LabKey metadata formats and is able to transmit data to/from the server using the saveRows() API.
 * There are several key differeces between this class and LABKEY.ext.Store:
 * <li>Many internal methods of this store have been divded to permit a collection of stores to be more easily controlled by an EHR.ext.StoreCollection</li>
 * <li>This store accepts a metadata object that will be applied directly to the server-supplied metadata.  This metadata is interpreted by other EHR/Ext components such as FormPanel to EditorGrid</li>
 * <li>This store supports the concept of 'validation' which submits a record to the server through the normal save pathway.  This record will enter the validation script; however, there is a flag to force it to fail.  This allows server-side validation / error generation to be performed and for a single code path to be used for commits and validation.</li>
 * <li>This store is designed to parse the response from the server to allow two-way communication between validation scripts and the store.</li>
 *
 * <p>If you use any of the LabKey APIs that extend Ext APIs, you must either make your code open source or
 * <a href="https://www.labkey.org/wiki/home/Documentation/page.view?name=extDevelopment">purchase an Ext license</a>.</p>
 *            <p>Additional Documentation:
 *              <ul>
 *                  <li><a href="https://www.labkey.org/wiki/home/Documentation/page.view?name=javascriptTutorial">LabKey JavaScript API Tutorial</a></li>
 *                  <li><a href="https://www.labkey.org/wiki/home/Documentation/page.view?name=labkeyExt">Tips for Using Ext to Build LabKey Views</a></li>
 *              </ul>
 *           </p>
 * @constructor
 * @augments LABKEY.ext.Store
 * @param config Configuration properties. This may contain any of the configuration properties supported by the LABKEY.ext.Store plus those listed here.
 * @param {String} [config.containerPath] The container path from which to query the server. If not specified, the current container is used.
 * @param {String} [config.schemaName] The LabKey schema to query.
 * @param {String} [config.queryName] The query name within the schema to fetch.
 * @param {String} [config.viewName] A saved custom view of the specified query to use if desired.
 * @param {Object} [config.metadata] A metadata object that will be applied to the default metadata returned by the server.  See EHR.Metadata for more information.
 * @param {Boolean} [config.doServerValidation] If true, whenever a record is modified it will be validated on the server.
 */
EHR.ext.AdvancedStore = Ext.extend(LABKEY.ext.Store, {
    constructor: function(config){
        Ext.apply(this, {
            pruneModifiedRecords: true,
            errors: new Ext.util.MixedCollection(),
            doServerValidation: true
        });

        EHR.ext.AdvancedStore.superclass.constructor.apply(this, arguments);

        /**
         * @memberOf EHR.ext.AdvancedStore#
         * @name beforemetachange
         * @event
         * @description Fires after the HTTP proxy loads metadata from the server, but before it is applied to the store
         * @param {Object} this The store object
         * @param {Object} meta The metadata object that will be applied to the store
         */
        /**
         * @memberOf EHR.ext.AdvancedStore#
         * @name validation
         * @event
         * @description This will fire whenever the store's records are validated.
         * @param {Object} this The store object
         * @param {Array} records Array of the records that were validated
         */
        this.addEvents('beforemetachange', 'validation');
        this.proxy.on("load", this.onProxyLoad, this);

        //@deprecated
        if(this.monitorPermissions){
            EHR.Security.init({
                success: Ext.emptyFn,
                failure: EHR.Utils.onError,
                scope: this
            });
            this.on('update', this.verifyPermission, this);
        }

        //TODO: remove once added to labkey.ext.store
        if(config.maxRows !== undefined){
            this.baseParams['query.maxRows'] = config.maxRows;
        }
        if(config.ignoreFilter)
            this.baseParams['query.ignoreFilter'] = 1;

        if(this.monitorValid)
            this.initMonitorValid();
    },

    //private
    //creates the listeners needed to validate records on the server
    initMonitorValid: function(){
        this.on('update', this.validateRecord, this);
        this.on('add', this.validateRecords, this);
//        this.on('load', this.validateRecords, this);
        this.on('remove', this.validationOnRemove, this);

        this.validateRecords(this);
    },

    //private
    stopMonitorValid: function(){
        this.un('update', this.validateRecord, this);
        this.un('add', this.validateRecords, this);
//        this.un('load', this.validateRecords, this);
        this.on('remove', this.validationOnRemove, this);

//        this.un('validation', this.validateRecordOnServer, this);
    },

    //private
    validationOnRemove: function(store, rec){
        //we need to remove all errors from this record
        this.errors.each(function(error){
            if(error.record==rec){
                this.errors.remove(error);
            }
        }, this);
        this.fireEvent('validation', this);
    },

    //private
    onProxyLoad: function(proxy, response, options){
        var meta = this.reader.meta;

        //provide a standardized translation
        this.translateMetaData(meta);

        Ext.each(meta.fields, function(f){
            //allow defaults for all fields
            //NOTE: perhaps move to this.fieldDefaults?
            if(this.metadata){
                if(this.metadata['fieldDefaults']){
                    EHR.Utils.rApply(f, this.metadata['fieldDefaults']);
                }

                //allow more complex metadata, per field
                if(this.metadata[f.name]){
                    EHR.Utils.rApply(f, this.metadata[f.name]);
                }
            }
        }, this);

        if(this.colModel){
            var colModel = this.reader.jsonData.columnModel;
            Ext.each(colModel, function(col){
                if(this.colModel[col.dataIndex]){
                    EHR.Utils.rApply(col, this.colModel[col.dataIndex]);
                }
            }, this);
        }

        //console.log('beforemetachange:'+this.storeId);
        if(false===this.fireEvent('beforemetachange', this, meta))
            return;

        //console.log('metachange:'+this.storeId);
        this.reader.onMetaChange(meta);
    },

    //private
    changeMetadata: function(meta){
        console.log('metachange:'+this.storeId);
        this.reader.onMetaChange(meta);
    },

    //@deprecated
    //the original intent was to enforce QCState permissions in the store, but it was never fully implemented
    verifyPermission: function(store, rec, operation){
        var qc;
        if(EHR.Security.hasLoaded() && rec.fields.get('QCState')){
            qc = rec.get('QCState');
            if(!qc)
                return;

            qc = EHR.Security.getQCStateByRowId(qc).Label;

            var command = 'insert';
            //TODO: it would be nice to be smarter about whether we test for insert or update.
            //the server will enforce it, but stopping it on the client would be more friendly

            if(!EHR.Security.hasPermission(qc, command, {schemaName: this.schemaName, queryName: this.queryName})){
                alert('You do not have permission to change this record');
                rec.reject();
            }
            /*
            else {
                //config option in store
                if(!this.allowOthersToEditRecords){
                    //one of the following must be true in order to edit
                    if(
                        //these dont exist on the server, so anyone can edit
                        !rec.phantom &&
                        //you can edit recs you created
                        rec.get('created') != LABKEY.Security.currentUser.id &&
                        //you can edit recs you modified
                        rec.get('modified') != LABKEY.Security.currentUser.id &&
                        //data admins can always edit
                        !EHR.Security.hasPermission(qc, 'admin', {schemaName: this.schemaName, queryName: this.queryName})
                    ){
                        //also allow editing of tasks assigned to you:
                        //TODO

                        alert('You do not have permission to change this record');
                        rec.reject();
                    }
                }
            }
            */
        }
    },

    //private
    //the intention of this method was to provide a standard, low-level way to translating Labkey metadata names into ext ones.
    translateMetaData: function(meta){
        Ext.each(meta.fields, function(field){
            var h = Ext.util.Format.htmlEncode;
            var lc = function(s){return !s?s:Ext.util.Format.lowercase(s);};

            //field.type = lc(field.jsonType) || lc(field.type) || lc(field.typeName) || 'string';
            field.fieldLabel = h(field.label) || h(field.caption) || h(field.header) || h(field.name);
            field.dataIndex = field.dataIndex || field.name;
            field.editable = field.userEditable && !field.readOnly;

            field.allowBlank = field.nullable;

        }, this);
    },

    /**
     * @memberOf EHR.ext.AdvancedStore#
     * @name newRecord
     * @description This method creates a new record to add to this store.  It exists (as opposed to using "new this.recordType()") such
     * that fields with an initial value generator function (see EHR.Metadata.FieldMetadata.setInitialValue()).  Records created
     * for this store should use this method.  At a future point, it might be worth investigating whether this.recordType could be
     * overridden instead.
     * @param {object} data The initial values to use for this record
     */
    //TODO: would be better to just override this.recordType
    newRecord: function(data){
        var rec;
        if(data instanceof Ext.data.Record)
            rec = data;
        else
            rec = new this.recordType(data);

        this.fields.each(function(f) {
            rec.data[f.name] = Ext.isDefined(rec.data[f.name]) ? f.convert(rec.data[f.name]) :
                               Ext.isDefined(f.defaultValue) ? f.defaultValue :
                               null;
            if(!rec.data[f.name] && Ext.isFunction(f.setInitialValue)){
                rec.data[f.name] = f.setInitialValue.call(this, rec.data[f.name], rec, f);
            }
        }, this);

        return rec;
    },

    //private
    addRecords: function(records, idx){
        if(undefined === idx)
            idx = this.getCount();

        if(!Ext.isArray(records))
            records = [records];

        Ext.each(records, function(r, idx){
            records[idx] = this.newRecord(r);
        }, this);

        //NOTE: when you add an array of records, they get added in reverse order.
        //therefore I reverse it here so it's added in the order submitted.
        //records.reverse();

        this.insert(idx, records);
        this.validateRecords(this, records);

        return records
    },

    //private
    addRecord: function(r, idx){
        if(undefined === idx)
            idx = this.getCount();

        r = this.newRecord(r);
        this.insert(idx, r);

        this.validateRecords(this, [r]);
        return r;
    },

    //private
    duplicateRecord: function(record, defaults){
        defaults  = defaults || {};
        //NOTE: this is deliberate such that defaults are applied first.  if you want the new record to have a null value, this should work
        var newData = Ext.apply({}, r.data);
        Ext.apply(newData, defaults);
        this.store.addRecord(newData);
    },

    //private
    duplicateRecords: function(records, defaults){
        Ext.each(records, function(r){
            this.duplicateRecord(r, defaults);
        }, this);
    },

    //private
    maxErrorSeverity: function(){
        var maxSeverity;
        this.errors.each(function(e){
            maxSeverity = EHR.Utils.maxError(maxSeverity, e.severity);
        }, this);

        return maxSeverity;
    },

    //private
    validateRecords: function(store, recs, fireEvent, config){
        config = config || {};

        if(recs)
            Ext.each(recs, function(r){
                this.validateRecord(this, r, config.operation, {fireEvent: false});
            }, this);
        else
            this.each(function(r){
                this.validateRecord(this, r, config.operation, {fireEvent: false});
            }, this);

        if(fireEvent !== false){
            this.fireEvent('validation', this, recs);
        }
    },

    //private
    //this method performs simple checks client-side then will submit the record for server-validation if selected
    validateRecord: function(store, r, operation, config){
        config = config || {};

        r.errors = r.errors || [];

        //remove other client-side errors for this record
        for(var i = r.errors.length-1; i >= 0; i--){
            if(!r.errors[i].fromServer){
                this.errors.remove(r.errors[i]);
                r.errors.splice(i, 1);
            }
        }

        r.fields.each(function(f) {
            //apparently the store's metadata can be updated w/o the record's, so we use that
            var meta = store.fields.map[f.name];

            //NOTE: we're drawing a distinction between LABKEY's nullable and ext's allowBlank.
            // This allows fields to be set to 'allowBlank: false', which throws a warning
            // nullable:false will throw an error when null.
            // also, if userEditable==false, we assume will be set server-side so we ignore it here
            if(meta.userEditable!==false && Ext.isEmpty(r.data[f.name])){
                if(meta.nullable === false || meta.allowBlank === false){
                    r.errors.push({
                        id: LABKEY.Utils.generateUUID(),
                        field: f.name,
                        message: 'This field is required',
                        record: r,
                        errorValue: r.get(f.dataIndex),
                        severity: (f.nullable === false ? 'ERROR' : 'WARN'),
                        fromServer: false
                    });
                }
            }

            //NOTE: if we had a reference to the field editor, i could hook into getErrors() to find other validation errors
            //should revisit in Ext 4 when validation is moved to dataModel
        },store);

        this.errors.addAll(r.errors);

        //this is designed such that validateRecords() can call validateRecord() multiple times without events firing
        if(config.fireEvent!==false){
            this.fireEvent('validation', this, [r], config);
        }

        //if(this.doServerValidation){
        if(operation=='edit' && this.doServerValidation){
            this.validateRecordOnServer.defer(500, this, [this, [r], config]);
        }
    },

    //private
    validateRecordOnServer: function(store, records, config){
        if(!records || !records.length)
            return;

        if(config && config.noServerValidation){
            console.log('skipping server validation');
            return;
        }

        var commands = this.getChanges(records);
        if (!commands.length){
            return false;
        }

        Ext.each(records, function(record){
            //NOTE: we remove saveOperationInProgress b/c this transaction is going to fail
            //therefore we do not want this flag to block a legitimate future save attempt.
            delete record.saveOperationInProgress;
            record.serverValidationInProgress = true;
        }, this);

        //add a flag per command to make sure this record fails
        this.sendRequest(records, commands, {validateOnly: true, silent: true, targetQCState: null});
    },

    /**
     * @memberOf EHR.ext.AdvancedStore#
     * @name getFormEditorConfig
     * @description This is a convenience wrapper for EHR.ext.metaHelper.getFormEditorConfig().
     * @param {string} fieldName The name of the field
     * @param {object} config Optional.  This config object will be merged with the output of getFormEditorConfig()
     */
    getFormEditorConfig: function(fieldName, config){
        var meta = this.findFieldMeta(fieldName);
        return EHR.ext.metaHelper.getFormEditorConfig(meta, config);
    },

    /**
     * @memberOf EHR.ext.AdvancedStore#
     * @name getGridEditorConfig
     * @description This is a convenience wrapper for EHR.ext.metaHelper.getGridEditorConfig().
     * @param {string} fieldName The name of the field
     * @param {object} config Optional.  This config object will be merged with the output of getGridEditorConfig()
     */
    getGridEditorConfig: function(fieldName, config){
        var meta = this.findFieldMeta(fieldName);
        return EHR.ext.metaHelper.getGridEditorConfig(meta, config);
    },

    //private
    getAllRecords: function(){
        var recs = [];
        this.each(function(r){
            recs.push(r);
        }, this);
        return recs;
    },

    //NOTE: returns true to remove unwanted checking contained in LABKEY store
    readyForSave: function(){
        return true;
    },

    //private
    //@override
    //the only reason this method is overridden is to delete record.phantom near the bottom (see note).  we also delete lastTransactionId
    processResponse : function(rows){
        var idCol = this.reader.jsonData.metaData.id;
        var row;
        var record;
        for(var idx = 0; idx < rows.length; ++idx)
        {
            row = rows[idx];

            if(!row || !row.values)
                return;

            //find the record using the id sent to the server
            record = this.getById(row.oldKeys[this.reader.meta.id]);
            if(!record)
                return;

            //apply values from the result row to the sent record
            for(var col in record.data)
            {
                //since the sent record might contain columns form a related table,
                //ensure that a value was actually returned for that column before trying to set it
                if(undefined !== row.values[col]){
                    if(!record.fields.get(col)){
                        console.log('ERROR: column not found: '+col);
                        console.log(record.fields);
                        continue;
                    }

                    var x = record.fields.get(col);
                    record.set(col, record.fields.get(col).convert(row.values[col], row.values));
                }

                //clear any displayValue there might be in the extended info
                if(record.json && record.json[col])
                    delete record.json[col].displayValue;
            }

            //if the id changed, fixup the keys and map of the store's base collection
            //HACK: this is using private data members of the base Store class. Unfortunately
            //Ext Store does not have a public API for updating the key value of a record
            //after it has been added to the store. This might break in future versions of Ext.
            if(record.id != row.values[idCol])
            {
                record.id = row.values[idCol];
                this.data.keys[this.data.indexOf(record)] = row.values[idCol];

                delete this.data.map[record.id];
                this.data.map[row.values[idCol]] = record;
            }

            //reset transitory flags and commit the record to let
            //bound controls know that it's now clean
            delete record.saveOperationInProgress;
            delete record.lastTransactionId;

            //NOTE: this could probably be removed in favor of the Ext param
            //phantom is the built-in Ext version of labkey's isNew.  I delete here so we know the record exists on the server
            delete record.isNew;
            delete record.phantom;
            record.commit();
        }
    },

    //@deprecated
    getLookupStore: function(){
        //not needed .  used in editorgridpanel.  should be shifted to metaHelper.
    },

    //@override
    // overriden to remove setting a default nullCaption.  this is moved to the combo tpl
    onLoad : function(store, records, options) {
        this.isLoading = false;

        //remeber the name of the id column
        this.idName = this.reader.meta.id;

        if(this.nullRecord)
        {
            //create an extra record with a blank id column
            //and the null caption in the display column
            var data = {};
            data[this.reader.meta.id] = "";
            data[this.nullRecord.displayColumn] = this.nullRecord.nullCaption || this.nullCaption || null;

            var recordConstructor = Ext.data.Record.create(this.reader.meta.fields);
            var record = new recordConstructor(data, -1);
            this.insert(0, record);
        }
    },

    //private
    //NOTE: split this method in two so they can be called independently
    commitChanges : function(extraContext){
        var records = this.getModifiedRecords();
        this.commitRecords(records, extraContext);
    },

    //private
    //see above
    commitRecords : function(records, extraContext){
        var commands = this.getChanges(records);

        if (!commands.length){
            if(extraContext && extraContext.silent!==true)
                Ext.Msg.alert('Alert', 'There are no changes to submit.');

            return;
        }

        for(var i=0;i<commands.length;i++){
            if(commands[i].rows.length > 0 && false === this.fireEvent("beforecommit", records, commands[i].rows))
                return [];
        }

        this.sendRequest(records, commands, extraContext);
    },

    //private
    getChanges: function(records){
        records = records || this.getModifiedRecords();

        if(!records || records.length == 0)
            return [];

        if (!this.updatable)
            throw "this LABKEY.ext.Store is not updatable!";

        //build the json to send to the server
        var record;
        var skippedRecords = [];
        var insertCommand =
        {
            schemaName: this.schemaName,
            queryName: this.queryName,
            command: "insertWithKeys",
            rows: [],
            extraContext: this.getExtraContext(records)
        };
        var updateCommand =
        {
            schemaName: this.schemaName,
            queryName: this.queryName,
            command: "updateChangingKeys",
            rows: [],
            extraContext: this.getExtraContext(records)
        };
        for(var idx = 0; idx < records.length; ++idx)
        {
            record = records[idx];

            //if we are already in the process of saving this record, just continue
            if(record.saveOperationInProgress){
                skippedRecords.push(record);
                continue;
            }

            //NOTE: this check could possibly be eliminated since the form/server should do the same thing
            if(!this.readyForSave(record)){
                skippedRecords.push(record);
                continue;
            }

            record.saveOperationInProgress = true;
            //NOTE: modified since ext uses the term phantom for any record not saved to server
            if (record.isNew || record.phantom)
            {
                insertCommand.rows.push({
                    values: this.getRowData(record),
                    oldKeys : this.getOldKeys(record)
                });
            }
            else
            {
                updateCommand.rows.push({
                    values: this.getRowData(record),
                    oldKeys : this.getOldKeys(record)
                });
            }
        }

        var commands = [];
        if (insertCommand.rows.length > 0)
        {
            commands.push(insertCommand);
        }
        if (updateCommand.rows.length > 0)
        {
            commands.push(updateCommand);
        }

        if(skippedRecords.length){
            console.log('Skipping records');
            console.log(skippedRecords)
        }
//        else {
//            console.log('sending');
//        }

        return commands;
    },

    getExtraContext: function(records){
        var ret = {
            storeId: this.storeId,
            queryName: this.queryName,
            schemaName: this.schemaName,
            keyField: this.reader.meta.id
        };

        // NOTE: this should really be left to subclasses of ehrStore to handle, rather
        // then account for each query here.  we also might want extraContext attached to the
        // top-level request, rather than only per-blood.  in this instance only Blood Draws.js
        // is using the data, but weights are a good example of something that might be
        // globally useful.
        if (this.queryName == 'Blood Draws'){
            var bloodDrawMap = {};
            var allRecords = this.getAllRecords();
            for (var idx = 0; idx < allRecords.length; ++idx){
                var record = allRecords[idx];
                if (record.get('quantity') > 0)
                {
                    var id = record.get('Id');
                    var date = record.get('date');
                    if (!id || !date)
                        continue;

                    date = date.format('Y-m-d');

                    if (!bloodDrawMap[id])
                        bloodDrawMap[id] = [];

                    bloodDrawMap[id].push({
                        objectid: record.get('objectid'),
                        date: date,
                        qcstate: record.get('QCState'),
                        quantity: record.get('quantity')
                    });
                }
            }

            if (!LABKEY.Utils.isEmptyObj(bloodDrawMap)){
                ret.bloodInTransaction = bloodDrawMap
            }
        }

        if (this.queryName == 'Housing'){
            var map = {};
            var allRecords = this.getRange();
            for (var idx = 0; idx < allRecords.length; ++idx){
                var record = allRecords[idx];

                var date = record.get('date');
                var id = record.get('Id');
                var room = record.get('room');
                if (!id || !date)
                    continue;

                if (!map[id])
                    map[id] = [];

                map[id].push({
                    Id: id,
                    objectid: record.get('objectid'),
                    date: date,
                    enddate: record.fields.get('enddate') ? record.get('enddate') : null,
                    qcstate: record.get('QCState'),
                    room: record.get('room'),
                    cage: record.get('cage'),
                    divider: record.fields.get('divider') ? record.get('divider') : null
                });
            }

            if (!LABKEY.Utils.isEmptyObj(map)){
                ret.housingInTransaction = map;
            }
        }

        return ret;
    },

    //private
    //NOTE: we append the value of the key field to the record
    getRowData : function(record) {
        var values = EHR.ext.AdvancedStore.superclass.getRowData.apply(this, arguments);
        values._recordid = record.id;
        return values;
    },

    //private
    //NOTE: split this into a separate method so validateOnServer() can call it separately
    sendRequest: function(records, commands, extraContext){
        extraContext = extraContext || {};
        extraContext.isLegacyFormat = true;

        var request = Ext.Ajax.request({
            url : LABKEY.ActionURL.buildURL("query", "saveRows", this.containerPath),
            method : 'POST',
            success: this.onCommitSuccess,
            failure: this.getOnCommitFailure(records),
            scope: this,
            jsonData : {
                containerPath: this.containerPath,
                commands: commands,
                extraContext: extraContext
            },
            headers : {
                'Content-Type' : 'application/json'
            }
        });

        Ext.each(records, function(rec){
            rec.lastTransactionId = request.tId;
        }, this);
    },

    //private
    //NOTE: overridden support different processing of exceptions and validation errors
    getOnCommitFailure : function(records) {
        return function(response, options) {

            for(var idx = 0; idx < records.length; ++idx)
                delete records[idx].saveOperationInProgress;

            var serverError = this.getJson(response);
            var msg = '';
            if(serverError && serverError.errors){
                //each error should represent 1 row.  there can be multiple errors per row
                Ext.each(serverError.errors, function(rowError){
                    //handle validation script errors and exceptions differently
                    if(rowError.errors && rowError.errors.length && rowError.row){
                        this.handleValidationErrors(rowError, response, serverError.extraContext);
                        msg = "Could not save changes due to errors. Please check the form for fields marked in red.";
                    }
                    else {
                        //if an exception was thrown, I believe we automatically only have one error returned
                        //this means this can only be called once
                        msg = 'Could not save changes due to the following error:\n' + (serverError && serverError.exception) ? serverError.exception : response.statusText;
                    }
                }, this);

                if(!serverError.errors){
                   msg = 'Could not save changes due to the following error:\n' + serverError.exception;
            }
            }

            if(false !== this.fireEvent("commitexception", msg) && (options.jsonData.extraContext && !options.jsonData.extraContext.silent)){
                Ext.Msg.alert("Error", "Error During Save. "+msg);
            }
        };
    },

    //private
    handleValidationErrors: function(serverError, response, extraContext){
        var record = this.getById(serverError.row._recordid);
        if(record){
            this.handleValidationError(record, serverError, response, extraContext);
        }
        else {
            console.log('ERROR: Record not found');
            console.log(serverError);
        }
    },

    //private
    //this will process the errors associated with 1 record.  there might be more than 1 error per record
    handleValidationError: function(record, serverError, response, extraContext){
        //verify transaction Id matches the most recent request
        if(record.lastTransactionId != response.tId){
            console.log('There has been a more recent transaction for this record.  Ignoring this one.');
            return;
        }

        //allow the server to return values for fields
        this.fields.each(function(field){
            if(field.updateValueFromServer &&
                serverError.row[field.dataIndex] &&
                serverError.row[field.dataIndex] != record.get(field.dataIndex)
            ){
                record.set(field.dataIndex, serverError.row[field.dataIndex]);
            }
        }, this);

        //remove all old errors for this record
        record.errors = [];
        this.errors.each(function(error){
            if(error.record==record){
                this.errors.remove(error);
            }
        }, this);

        Ext.each(serverError.errors, function(e){
            this.processValidationError(record, e)
        }, this);

        if(extraContext && extraContext.skippedErrors && extraContext.skippedErrors[record.id]){
            Ext.each(extraContext.skippedErrors[record.id], function(e){
                this.processValidationError(record, e, true)
            }, this);
        }
        //re-run client-side validation.
        this.validateRecord(this, record, null, {fireEvent: true, noServerValidation: true});
    },

    processValidationError: function(record, error, noParse){
        //this is a flag used by server-side validation scripts
        if(error.field=='_validateOnly')
            return;

        if(!noParse){
            var msg = error.message.split(': ');
            if(msg.length>1){
                error.severity = msg.shift();
                error.message = msg.join(': ');
            }
        }

        record.errors.push({
            id: LABKEY.Utils.generateUUID(),
            field: error.field,
            message: error.message,
            record: record,
            severity: error.severity || 'ERROR',
            errorValue: record.get(error.field),
            fromServer: true
        });
    },

    //private
    //NOTE: instead of directly deleting the records, this method converts them to a QCState of 'Delete Requested'.  This is for historic reasons
    //that no longer apply.  At some point this code should probably be changed to directly delete the records.
    requestDeleteRecords: function(records){
        if (!this.updatable)
            throw "this LABKEY.ext.Store is not updatable!";

        if(!records || records.length == 0)
            return;

        var extraContext = {
            //targetQC : 'Delete Requested',
            errorThreshold: 'SEVERE',
            importPathway: 'ehr-ext3DataEntry'
        };

        var recs = [];
        Ext.each(records, function(r){
            if(r.phantom){
                this.remove(r);
                delete r;
            }
            else {
                r.beginEdit();
                if(r.get('requestid') || r.get('requestId')){
                    //note: we reject changes since we dont want to retain modifications made in this form
                    r.reject();

                    //reset the date
                    if(r.get('daterequested'))
                        r.set('date', r.get('daterequested'));

                    //remove from this task
                    if(this.queryName!='tasks')
                        r.set('taskid', null);

                    r.set('QCState', EHR.Security.getQCStateByLabel('Request: Approved').RowId);
                }
                else {
                    r.set('QCState', EHR.Security.getQCStateByLabel('Delete Requested').RowId);
                }
                r.commit();

                recs.push(r);
            }
        }, this);

        if(recs.length){
            function onComplete(response){
                this.un('commitcomplete', onComplete);
                this.remove(recs);
            }
            this.on('commitcomplete', onComplete, this, {single: true});
            this.commitRecords(recs, extraContext);
        }
        else {
            this.fireEvent("commitcomplete");
        }
    },

    //private
    //NOTE: the following 2 methods are overriden because the old approach causes uncommitted client-side records to get destroyed on store load
    //also added QCState permission checking
    deleteRecords : function(records, extraContext) {
        if (!this.updatable)
            throw "this LABKEY.ext.Store is not updatable!";

        if(!records || records.length == 0)
            return;

        var deleteRowsKeys = [];
        var canDelete = true;
        var key;
        var qc;
        for(var idx = 0; idx < records.length; ++idx)
        {
            //server delete not required for phantom records
            //we dont worry about permissions, since we assume the current user created it
            if(records[idx].phantom){
                this.remove(records[idx]);
                delete records[idx];
            }
            else {
                if(EHR.Security.hasLoaded() && records[idx].fields.get('QCState')){
                    qc = records[idx].get('QCState');
                    qc = EHR.Security.getQCStateByRowId(qc).Label;
                    if(!EHR.Security.hasPermission(qc, 'delete', {schemaName: this.schemaName, queryName: this.queryName})){
                        canDelete = false;
                    }
                    else {
                        key = {};
                        key[this.idName] = records[idx].id;
                        deleteRowsKeys[idx] = key;
                    }
                }
            }
        }

        if(!canDelete)
            alert('You do not have permission to delete one or more of the records');

        if(deleteRowsKeys.length){
            //send the delete
            LABKEY.Query.deleteRows({
                schemaName: this.schemaName,
                queryName: this.queryName,
                containerPath: this.containerPath,
                extraContext: extraContext,
                rows: deleteRowsKeys,
                scope: this,
                successCallback: this.getDeleteSuccessHandler(records),
                failure: this.getOnCommitFailure(records),
                action: "deleteRows" //hack for Query.js bug
            });
        }
        else {
            //Question: should this really count as commitcomplete since we never hit the server?
            this.fireEvent("commitcomplete");
        }
    },

    //private
    getDeleteSuccessHandler : function(records) {
        var store = this;
        return function(results) {
            store.fireEvent("commitcomplete");
            this.remove(records);
            Ext.each(records, function(rec){
                delete rec;
            }, this);
        };
    },

    //private
    removePhantomRecords: function(){
        this.each(function(r){
            if(r.phantom){
                this.remove(r);
                delete r;
            }
        }, this);
    }

});

Ext.reg('ehr-store', EHR.ext.AdvancedStore);

