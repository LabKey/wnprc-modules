/*
 * Copyright (c) 2011-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require('console');
var LABKEY = require('labkey');

var EHR = {};
exports.EHR = EHR;


EHR.Server = {};
EHR.Server.Utils = require('ehr/utils').EHR.Server.Utils;


/**
 * The server-side EHR.Server.Security is similar to the client-side version of this code.
 * Unfortunately code cannot truly be shared between client- and server-side applications at the time
 * this was written.  At the time of writing, multiRequest() was not available server-side, so this code
 * behind the server-side security API is slightly different than the client-side EHR.Security code
 * @class
 */
EHR.Server.Security = new function(){
    /* private variables and functions */
    var schemaMap;
    var hasLoaded = false;
    var _helper;

    var _qcByRowId;
    var _qcByLabel;

    function cacheQCStates(){
        var json = _helper.getJavaHelper().getQCStateJson();
        _qcByRowId = {};
        _qcByLabel = {};

        var qcArray = LABKEY.ExtAdapter.decode(json);
        for (var i=0;i<qcArray.length;i++)
        {
            var qc = qcArray[i];
            qc.RowId = parseInt(qc.RowId);

            _qcByRowId[qc.RowId] = qc;
            _qcByLabel[qc.Label] = qc;
        }
    }

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
         * @param helper The scriptHelper
         */
        init: function(helper) {
            if (hasLoaded)
                return;

            _helper = helper;

            helper.logDebugMsg('Caching security');
            cacheQCStates();
            hasLoaded = true;
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
                throw 'Must provide a QC State label and permission name';

            if (!hasLoaded)
                throw 'EHR.Security.init() has not been called or returned prior to this call';

            if (queries && !LABKEY.ExtAdapter.isArray(queries))
                queries = [queries];

            if (!queries.length){
                console.error('Must provide an array of query objects');
                return false;
            }

            var result = true;
            LABKEY.ExtAdapter.each(queries, function(query){
                //if this schema isnt present, it's not securable, so we allow anything
                if (!schemaMap.schemas[query.schemaName])
                    return true;

                if (!schemaMap.schemas[query.schemaName].queries[query.queryName] ||
                   !schemaMap.schemas[query.schemaName].queries[query.queryName].permissionsByQCState[qcStateLabel] ||
                   !schemaMap.schemas[query.schemaName].queries[query.queryName].permissionsByQCState[qcStateLabel][permission]
                ){
                    result = false;
                }
            }, this);

            return result;
        },


        /**
         * Returns the EHRQCState that corresponds to the passed label
         * @return {EHRQCState} An instance of the java class EHRQCState
         */
        getQCStateByLabel: function(label){
            if (!hasLoaded)
                throw 'EHR.Security.init() has not been called or returned prior to this call';

            var qc = _qcByLabel[label];
            if (!qc){
                console.error('ERROR: QCLabel ' + label + ' not found');
                return null;
            }
            return qc;
        },

       /**
        * Returns the EHRQCState that corresponds to the passed rowId.  Often used to translate between RowId and Label.
        * @return {EHRQCState} An instance of the java class EHRQCState
        */
        getQCStateByRowId: function(rowid){
            if (!hasLoaded)
                throw 'EHR.Security.init() has not been called or returned prior to this call';

           var qc = _qcByRowId[rowid];
           if (!qc){
                console.error('ERROR: QC State associated with the rowId ' + rowid + ' not found');
                return null;
            }
            return qc;
        },

       /**
        * This is a helper to test whether the QCState and permission informaiton necessary to manage EHR security has loaded.  See EHR.Security.init() for more information.
        * @return {Boolean} True/false depending on whether EHR.Security.init() has been called and has returned.
        */
        hasLoaded: function(){
           return hasLoaded;
        },


        /**
         * This is a helper designed to test whether the current user has permission to perform the current action on
         * the incoming row.  Because the EHR regulates permissions per QCState, the action of updating the QCState field
         * on a record from 'In Progress' to 'Completed' actually requires update permission on 'In Progress' and insert
         * permission on 'Completed'.  It is somewhat tricky to get this correct, so validation code should use and/or augment
         * this.  This is called automatically by beforeUpdate, beforeInsert and beforeDelete, so it is unlikely
         * individual scripts will need to worry about this.
         *
         * @param {string} event The type of event (ie. insert/update/delete), as passed by LabKey
         * @param {object}row The row object, as passed by LabKey
         * @param {object}oldRow The original row object (prior to update), as passed by LabKey
         */
        verifyPermissions: function(event, row, oldRow){
            EHR.Server.Security.normalizeQcState(row, oldRow);
            return (_helper.isETL() && LABKEY.Security.currentUser.isSystemAdmin) || _helper.getJavaHelper().hasPermission(_helper.getSchemaName(), _helper.getQueryName(), event, oldRow ? oldRow.QCStateLabel :  null, row.QCStateLabel);
        },

        /**
         *
         * @private
         */
        normalizeQcState: function(row, oldRow){
            if (!EHR.Server.Security.hasLoaded()){
                throw 'EHR.Server.Security.init() has not been called';
            }

            //first we normalize QCstate
            if (oldRow){
                if (oldRow.QCState){
                    var oldQc = EHR.Server.Security.getQCStateByRowId(oldRow.QCState);
                    if (oldQc){
                        oldRow.QCStateLabel = oldQc.Label;
                    }
                    else
                        console.error('Unknown QCState: ' +oldRow.QCState);

                    oldRow.QCState = null;
                }
                else if (oldRow.QCStateLabel){
                    //nothing needed
                }
                else {
                    oldRow.QCStateLabel = 'Completed';
                }
            }

            if (row.QCState){
                var qc = EHR.Server.Security.getQCStateByRowId(row.QCState);
                if (qc){
                    row.QCStateLabel = qc.Label;
                }
                else
                    console.error('Unknown QCState: ' +row.QCState);

                row.QCState = null;
            }
            else if (row.QCStateLabel){
                //nothing needed
            }
            else {
                if (_helper.isValidateOnly()){
                    row.QCStateLabel = 'In Progress';
                    row.QCState = null;
                }
                else {
                    if (oldRow && oldRow.QCStateLabel){
                        row.QCStateLabel = oldRow.QCStateLabel;
                        row.QCState = oldRow.QCState;
                    }
                    else {
                        row.QCStateLabel = 'Completed';
                        row.QCState = null;
                    }
                }
            }

            //next we determine whether to use row-level QC or the global target QCState
            //for now we always prefer the global QC
            //NOTE: we dont want this check for deletes, as this could prevent an otherwise valid delete
            if (_helper.getTargetQCStateLabel() && _helper.getEvent() != 'delete'){
                row.QCStateLabel = _helper.getTargetQCStateLabel();
            }

            //flag public status of rows
            if (oldRow && oldRow.QCStateLabel && row.QCStateLabel){
                if (!EHR.Server.Security.getQCStateByLabel(oldRow.QCStateLabel).PublicData && EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).PublicData){
                    row._becomingPublicData = true;
                }
            }

            if (row.QCStateLabel){
                if (EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).PublicData){
                    row._publicData = true;

                    //a row can be directly inserted as public
                    if (!oldRow){
                        row._becomingPublicData = true;
                    }
                }
                else {
                    row._publicData = false;
                }

            }

            if (oldRow && oldRow.QCStateLabel){
                if (EHR.Server.Security.getQCStateByLabel(oldRow.QCStateLabel).PublicData)
                    oldRow._publicData = true;
            }
        },

        getQCState: function(row){
            if (row.QCStateLabel)
                return EHR.Server.Security.getQCStateByLabel(row.QCStateLabel);
            else if (row.QCState)
                return EHR.Server.Security.getQCStateByRowId(row.QCState);
        }
    }
}