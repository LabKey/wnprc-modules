/*
 * Copyright (c) 2011-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.namespace('EHR.Security', 'EHR.Utils');

/**
 * @namespace EHR Security Reporting and Helper class.
 * This class provides several static methods and data members for
 * calling the EHR-specific security-related APIs, and interpreting the results.
 */
EHR.Security = new function(){
    /* private variables and functions */
    var classPrefix = 'org.labkey.api.ehr.security';
    var permissionMap;
    var hasLoaded = false;
    var schemaMap = {};
    var datasetInfo = {};
    var qcMap;

    //A helper to return a map of QCStates and their properties.
    function getQCStateMap(config){
        if (!config || !config.success){
            throw "Must provide a success callback"
        }

        var ctx = EHR.Utils.getEHRContext();
        LABKEY.Query.selectRows({
            containerPath: ctx ? ctx['EHRStudyContainer'] : null,
            schemaName: 'study',
            queryName: 'qcState',
            columns: '*',
            scope: this,
            success: function(data){
                var qcmap = {
                    label: {},
                    rowid: {}
                };

                var row;
                if (data.rows && data.rows.length){
                    for (var i=0;i<data.rows.length;i++){
                        row = data.rows[i];

                        var prefix = classPrefix + '.EHR'+(row.Label).replace(/[^a-zA-Z0-9-]/g, '');
                        row.adminPermissionName = prefix+'AdminPermission';
                        row.insertPermissionName = prefix+'InsertPermission';
                        row.updatePermissionName = prefix+'UpdatePermission';
                        row.deletePermissionName = prefix+'DeletePermission';
                        qcmap.label[row.Label] = row;
                        qcmap.rowid[row.RowId] = row;
                    }
                }
                config.success.apply(config.scope || this, [qcmap]);
            },
            failure: LDK.Utils.getErrorCallback()
        });
    };


    /** @scope EHR.Security */
    return {
        // public functions

        /**
         * Query the server and load the permission / QCState information necessary to manage EHR permissions
         * @description
         * A helper to return a map of QCStates and their properties, along with the effective permissions of the current user on all
         * EHR datasets.  The helper calls LABKEY.Security.getSchemaPermissions and EHR.Security.getQCStateMap and merges the results into the config object
         * described below.  The results are cached, and can be queried using the helpers EHR.Security.hasPermission() or EHR.Security.getQueryPermissions().
         * Pages expecting to enforce EHR-specific security should call .init() immediately on load.
         *
         * @param config Configuration properties.
         * @param [config.success] The success callback.  The callback will be called when the permission map has loaded.  No arguments are passed; however, EHR.Security.hasPermission() can be used to test permissions
         * @param [config.failure] The failure callback.  The callback will be passed an Ext.Ajax.request error object
         * @param [config.scope] The scope to be used in callbacks
         */
        init: function(config) {
            var schemaName = 'study';

            //if already loaded, we reuse it
            if (permissionMap){
                //console.log('reusing existing permission map')
                if (config.success)
                    config.success.apply(config.scope || this, []);

                return;
            }

            var ctx = EHR.Utils.getEHRContext();
            var multi = new LABKEY.MultiRequest();

            multi.add(getQCStateMap, {
                containerPath: ctx ? ctx['EHRStudyContainer'] : null,
                scope: this,
                success: function(results){
                    qcMap = results;
                },
                failure: LDK.Utils.getErrorCallback()
            });

            //TODO: eventually accept other schemas
            multi.add(LABKEY.Security.getSchemaPermissions, {
                containerPath: ctx ? ctx['EHRStudyContainer'] : null,
                schemaName: schemaName,
                scope: this,
                success: function(map){
                    schemaMap = map;
                },
                failure: LDK.Utils.getErrorCallback()
            });

            // Load up names and labels as aliases for the permission map
            multi.add(LABKEY.Query.selectRows, {
                containerPath: ctx ? ctx['EHRStudyContainer'] : null,
                schemaName: 'study',
                queryName: 'datasets',
                columns: ['Name', 'Label'],
                success: function(data) {
                    datasetInfo = data;
                },
                failure: LDK.Utils.getErrorCallback()
            });

            function onSuccess(){
                // Copy the permission information from the label (which is how LABKEY.Security.getSchemaPermissions
                // assembles them) to the name so we can look it up with either value
                Ext4.each(datasetInfo.rows, function(row)
                {
                    var queryInfo = schemaMap.schemas['study'].queries[row.Label];
                    if (queryInfo)
                    {
                        schemaMap.schemas['study'].queries[row.Name] = schemaMap.schemas['study'].queries[row.Label];
                    }
                });

                for (var qcState in qcMap.label){
                    var qcRow = qcMap.label[qcState];
                    qcRow.permissionsByQuery = {
                        admin: [],
                        insert: [],
                        update: [],
                        'delete': []
                    };
                    qcRow.effectivePermissions = {};

                    //LDK.Assert.assertNotEmpty('schemaMap was empty in Security.js', schemaMap.schemas);
                    if (schemaMap.schemas && schemaMap.schemas[schemaName] && schemaMap.schemas[schemaName].queries){
                        var queryCount = 0;
                        for (var queryName in schemaMap.schemas[schemaName].queries){
                            var query = schemaMap.schemas[schemaName].queries[queryName];
                            queryCount++;
                            query.permissionsByQCState = query.permissionsByQCState || {};
                            query.permissionsByQCState[qcState] = {};

                            //iterate over each permission this user has on this query
                            Ext4.each(query.effectivePermissions, function(p){
                                if (p == qcRow.adminPermissionName){
                                    qcRow.permissionsByQuery.admin.push(queryName);
                                    query.permissionsByQCState[qcState].admin = true;
                                }
                                if (p == qcRow.insertPermissionName){
                                    qcRow.permissionsByQuery.insert.push(queryName);
                                    query.permissionsByQCState[qcState].insert = true;
                                }
                                if (p == qcRow.updatePermissionName){
                                    qcRow.permissionsByQuery.update.push(queryName);
                                    query.permissionsByQCState[qcState].update = true;
                                }
                                if (p == qcRow.deletePermissionName){
                                    qcRow.permissionsByQuery['delete'].push(queryName);
                                    query.permissionsByQCState[qcState]['delete'] = true;
                                }
                            }, this);
                        }
                    }

                    qcRow.effectivePermissions.admin = (qcRow.permissionsByQuery.admin.length == queryCount);
                    qcRow.effectivePermissions.insert = (qcRow.permissionsByQuery.insert.length == queryCount);
                    qcRow.effectivePermissions.update = (qcRow.permissionsByQuery.update.length == queryCount);
                    qcRow.effectivePermissions['delete'] = (qcRow.permissionsByQuery['delete'].length == queryCount);
                }

                permissionMap = {
                    qcMap: qcMap,
                    schemaMap: schemaMap
                };

                hasLoaded = true;

                if (config.success)
                    config.success.apply(config.scope || this);
            }

            multi.send(onSuccess, this);
        },

        /**
         * A helper method designed to test whether the current user has the provided permission over the QCState and query or queries provided.
         * NOTE: EHR.Security.init() must have been called and returned prior to calling hasPermission();
         * @param {String} qcStateLabel The label of the QCState to test
         * @param {String} permission The permission to test (admin, insert, update or delete)
         * @param {Array} queries An array of objects in the format: {queryName: 'myQuery', schemaName: 'study'}
         * @return {Boolean} True/false depending on whether the user has the specified permission for the QCState provides against
         * all of the queries specified in the queries param
         */
        hasPermission: function(qcStateLabel, permission, queries){
            if (!qcStateLabel || !permission)
                throw "Must provide a QC State label and permission name";

            if (!hasLoaded){
                LDK.Utils.logToServer({
                    level: 'ERROR',
                    message: "EHR.Security.init() has not been called or returned prior to this call"
                });
                throw "EHR.Security.init() has not been called or returned prior to this call";
            }

            if (queries && !Ext4.isArray(queries))
                queries = [queries];

            if (!queries.length){
                console.log('Must provide an array of query objects');
                return false;
            }

            var result = true;
            Ext4.each(queries, function(query){
                //if this schema isnt present, it's not securable, so we allow anything
                if (!schemaMap.schemas[query.schemaName])
                    return true;

                var sm = schemaMap.schemas[query.schemaName].queries[query.queryName];
                if (!sm){
                    LDK.Utils.logToServer({
                        level: 'ERROR',
                        message: "EHR.Security.hasPermission() has been called for a query that doesnt exist: " + query.queryName
                    });
                }

                if (!sm || !sm.permissionsByQCState[qcStateLabel] || !sm.permissionsByQCState[qcStateLabel][permission]){
                    result = false;
                }
            }, this);

            return result;
        },

        /**
         * Will return a map of the effective permissions for the current user against the provided schema/query.
         * NOTE: EHR.Security.init() must have been called and returned prior to calling getQueryPermissions();
         * @param {String} qcStateLabel The label of the QCState to test
         * @param {String} permission The permission to test (admin, insert, update or delete)
         * @param {Array} queries An array of objects in the format: {queryName: 'myQuery', schemaName: 'study'}
         * @return {Boolean} True/false depending on whether the user has the specified permission for the QCState provides against all of the queries specified in the queries param
         */
        getQueryPermissions: function(schemaName, queryName){
            if (!hasLoaded)
                throw "EHR.Security.init() has not been called or returned prior to this call";

            if (!schemaMap.schemas[schemaName] ||
                !schemaMap.schemas[schemaName].queries[queryName] ||
                !schemaMap.schemas[schemaName].queries[queryName].permissionsByQCState
            )
                return {};

            return schemaMap.schemas[schemaName].queries[queryName].permissionsByQCState;
        },

        /**
         * Will return a map of attributes for QCState associated with the supplied Label.  Often used to translate between RowId and Label.
         * @return {Object} A map of properties associated with the requested QCState, including:
         * <li>Description: the description, as provided from study.QCState</li>
         * <li>Label: the label, as provided from study.QCState</li>
         * <li>PublicData: whether this QCState is considered public, as provided from study.QCState</li>
         * <li>RowId: the rowid, as provided from study.QCState</li>
         * <li>adminPermissionName: the name of the admin permission associated with this QCState, which is returned by LABKEY.Security.getPermissions</li>
         * <li>deletePermissionName: the name of the delete permission associated with this QCState, which is returned by LABKEY.Security.getPermissions</li>
         * <li>insertPermissionName: the name of the insert permission associated with this QCState, which is returned by LABKEY.Security.getPermissions</li>
         * <li>updatePermissionName: the name of the update permission associated with this QCState, which is returned by LABKEY.Security.getPermissions</li>
         * <li>permissionsByQuery: a map with the following keys: admin, delete, insert and update.  Each pair consists of the name of the permission and the datasets for which the user has this permission.
         * <li>effectivePermissions: similar to permissionsByQuery, except this map reports the effective permissions across all datasets.  The map has the keys: admin, delete, insert and update.  Each pair consists of the permission name and true/false depending on whether the current user has this permission across all datasets.
         */
        getQCStateByLabel: function(label){
            if (!hasLoaded)
                throw "EHR.Security.init() has not been called or returned prior to this call";

            if (!qcMap.label[label]){
                console.log('ERROR: QCLabel '+label+' not found');
                return null;
            }

            return qcMap.label[label];
        },

        /**
         * Will return a map of attributes for QCState associated with the supplied RowId.  Often used to translate between RowId and Label.
         * @return {Boolean} True/false depending on whether EHR.Security has loaded permission information.
         */
        getQCStateByRowId: function(rowid){
            if (!hasLoaded)
                throw "EHR.Security.init() has not been called or returned prior to this call";

            if (!qcMap.rowid[rowid]){
                console.log('ERROR: QC State associated with the rowId '+label+' not found');
                return null;
            }

            return qcMap.rowid[rowid];
        },

        /**
         * This is a helper to test whether the QCState and permission informaiton necessary to manage EHR security has loaded.  See EHR.Security.init() for more information.
         * @return {Boolean} True/false depending on whether EHR.Security.init() has been called and has returned.
         */
        hasLoaded: function(){
            return hasLoaded;
        },

        getPermissionName: function(qcLabel, permissionName){
            return classPrefix + '.EHR'+(qcLabel).replace(/[^a-zA-Z0-9-]/g, '') + Ext4.String.capitalize(permissionName) + 'Permission';
        },

        /**
         * Returns the package name, used as a prefix, to identify custom EHR permissions
         * @returns {string}
         */
        getClassPrefix: function(){
            return classPrefix;
        },

        Permissions: {
            DATA_ENTRY: classPrefix + '.EHRDataEntryPermission',
            DATA_ADMIN: classPrefix + '.EHRDataAdminPermission',
            VET: classPrefix + '.EHRVeternarianPermission',
            PROCEDURE_MANAGEMENT: classPrefix + '.EHRProcedureManagementPermission',
            SURGERY_ENTRY: classPrefix + '.EHRSurgeryEntryPermission',
            CLINICAL_ENTRY: classPrefix + '.EHRClinicalEntryPermission',
            LOCATION_EDITOR: classPrefix + '.EHRLocationEditPermission',
            HOUSING_EDITOR: classPrefix + '.EHRHousingTransferPermission',
            PROJECT_EDITOR: classPrefix + '.EHRProjectEditPermission',
            PROTOCOL_EDITOR: classPrefix + '.EHRProtocolEditPermission',
            TEMPLATE_CREATOR: classPrefix + '.EHRTemplateCreatorPermission'
        },

        hasVetPermission: function(){
            var ctx = EHR.Utils.getEHRContext();
            if (!ctx || !ctx.EHRStudyContainerInfo)
                return false;

            return ctx.EHRStudyContainerInfo.effectivePermissions.indexOf(EHR.Security.Permissions.VET) > -1;

        },

        hasProcedureManagementPermission: function(){
            var ctx = EHR.Utils.getEHRContext();
            if (!ctx || !ctx.EHRStudyContainerInfo)
                return false;

            return ctx.EHRStudyContainerInfo.effectivePermissions.indexOf(EHR.Security.Permissions.PROCEDURE_MANAGEMENT) > -1;

        },

        hasSurgeryEntryPermission: function(){
            var ctx = EHR.Utils.getEHRContext();
            if (!ctx || !ctx.EHRStudyContainerInfo)
                return false;

            return ctx.EHRStudyContainerInfo.effectivePermissions.indexOf(EHR.Security.Permissions.SURGERY_ENTRY) > -1;

        },

        hasClinicalEntryPermission: function(){
            var ctx = EHR.Utils.getEHRContext();
            if (!ctx || !ctx.EHRStudyContainerInfo)
                return false;

            return ctx.EHRStudyContainerInfo.effectivePermissions.indexOf(EHR.Security.Permissions.CLINICAL_ENTRY) > -1;

        },

        /**
         * Same permissions as housing editor, but can also edit cage type
         */
        hasLocationEditorPermission: function(){
            var ctx = EHR.Utils.getEHRContext();
            if (!ctx || !ctx.EHRStudyContainerInfo)
                return false;

            return ctx.EHRStudyContainerInfo.effectivePermissions.indexOf(EHR.Security.Permissions.LOCATION_EDITOR) > -1;
        },

        /**
         * Can edit ehr.project table and associated records
         */
        hasProjectEditorPermission: function(){
            var ctx = EHR.Utils.getEHRContext();
            if (!ctx || !ctx.EHRStudyContainerInfo)
                return false;

            return ctx.EHRStudyContainerInfo.effectivePermissions.indexOf(EHR.Security.Permissions.PROJECT_EDITOR) > -1;
        },

        /**
         * Can edit ehr.protocol table and associated records
         */
        hasProtocolEditorPermission: function(){
            var ctx = EHR.Utils.getEHRContext();
            if (!ctx || !ctx.EHRStudyContainerInfo)
                return false;

            return ctx.EHRStudyContainerInfo.effectivePermissions.indexOf(EHR.Security.Permissions.PROTOCOL_EDITOR) > -1;
        },

        /**
         * Can perform transfers and edit dividers, but not cage type
         */
        hasHousingEditorPermission: function(){
            var ctx = EHR.Utils.getEHRContext();
            if (!ctx || !ctx.EHRStudyContainerInfo)
                return false;

            return ctx.EHRStudyContainerInfo.effectivePermissions.indexOf(EHR.Security.Permissions.HOUSING_EDITOR) > -1;
        },

        isDataAdmin: function(){
            var ctx = EHR.Utils.getEHRContext();
            if (!ctx || !ctx.EHRStudyContainerInfo)
                return false;

            return ctx.EHRStudyContainerInfo.effectivePermissions.indexOf(EHR.Security.Permissions.DATA_ADMIN) > -1;
        },

        isTemplateCreator: function(){
            var ctx = EHR.Utils.getEHRContext();
            if (!ctx || !ctx.EHRStudyContainerInfo)
                return false;

            return LABKEY.Security.currentUser.isAdmin || ctx.EHRStudyContainerInfo.effectivePermissions.indexOf(EHR.Security.Permissions.TEMPLATE_CREATOR) > -1;
        }
    }
}