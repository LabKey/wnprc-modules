/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @param fieldConfigs
 */
Ext4.define('EHR.data.FoodDepriveClientStore', {
    extend: 'EHR.data.DataEntryClientStore',

    constructor: function(){
        this.callParent(arguments);

    },

    processServerRecords:  function(sc, changedRecords){
        var map = this.getClientToServerRecordMap();
        var clientKeyField = this.getKeyField();

        for (var table in map){
            var serverStore = sc.getServerStoreByName(table);
            LDK.Assert.assertNotEmpty('Unable to find server store: ' + table, serverStore);

            var fieldMap = map[table];
            Ext4.Array.forEach(this.getRange(), function(clientModel){
                //find the corresponding server record
                var key = clientModel.get(clientKeyField);
                //LDK.Assert.assertNotEmpty('No key present for clientModel: ' + (clientModel.store ? clientModel.store.storeId : 'no store'), key)
                var serverModel = serverStore.findRecord(clientKeyField, key, clientModel.internalId);
                if (!serverModel){
                    //TODO: determine whether to auto-create the record
                    //ALSO: we have a problem if the PK of the table isnt
                    serverModel = serverStore.addServerModel({});
                    serverModel._clientModelId = clientModel.internalId;
                }

                if (serverModel){
                    var serverFieldName;
                    for (var clientFieldName in fieldMap){
                        serverFieldName = fieldMap[clientFieldName];

                        var clientVal = Ext4.isEmpty(clientModel.get(clientFieldName)) ? null : clientModel.get(clientFieldName);
                        var serverVal = Ext4.isEmpty(serverModel.get(serverFieldName)) ? null : serverModel.get(serverFieldName);
                        if (serverVal != clientVal){
                            serverModel.set(serverFieldName, clientVal);
                            serverModel.phantom = clientModel.phantom;
                            serverModel.setDirty(true);

                            if (!changedRecords[serverStore.storeId])
                                changedRecords[serverStore.storeId] = {};

                            changedRecords[serverStore.storeId][serverModel.id] = serverModel;
                        }
                    }
                }
            }, this);

            var removed = this.getRemovedRecords();
            if (removed.length){
                Ext4.Array.forEach(removed, function(clientModel){
                    //find the corresponding server record
                    var key = clientModel.get(clientKeyField);
                    var serverModel = serverStore.findRecord(clientKeyField, key, clientModel.internalId);
                    if (serverModel){
                        if (clientModel.isRemovedRequest){
                            this.prepareServerModelForDelete(serverModel);
                        }
                        else {
                            LDK.Assert.assertTrue('Server model not found, remove() will not be successful: ' + key, serverStore.indexOf(serverModel) > -1);

                            serverStore.remove(serverModel);

                            // Strip out any records that are part of the server model that should be just ignored
                            // instead of deleted when saved
                            if (clientModel.isNonDelete) {
                                var serverRemoved = serverStore.getRemovedRecords();
                                for (var i = 0; i < serverRemoved.length; i++) {
                                    if (serverRemoved[i] == serverModel) {
                                        serverRemoved.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }, this);
            }

            //bug has been fixed and this assert is causing false positives on team city during initial page load
            // if we have a 1:1 store mapping, verify record count is the same
            // Note: on the very first storeCollection load we can get false positives, so skip then
            //if (sc.hasLoaded && Ext4.Object.getKeys(map).length == 1){
            //    LDK.Assert.assertEquality('Client/Server stores do not have the same record count: ' + this.storeId + ' (' + this.getCount() + ') / ' + serverStore.storeId + ' (' + serverStore.getCount() + ')', this.getCount(), serverStore.getCount());
            //}
        }
    }

});
/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @param fieldConfigs
 */
Ext4.define('EHR.data.FoodDepriveClientStore', {
    extend: 'EHR.data.DataEntryClientStore',

    constructor: function(){
        this.callParent(arguments);

    },

    processServerRecords:  function(sc, changedRecords){
        var map = this.getClientToServerRecordMap();
        var clientKeyField = this.getKeyField();

        for (var table in map){
            var serverStore = sc.getServerStoreByName(table);
            LDK.Assert.assertNotEmpty('Unable to find server store: ' + table, serverStore);

            var fieldMap = map[table];
            Ext4.Array.forEach(this.getRange(), function(clientModel){
                //find the corresponding server record
                var key = clientModel.get(clientKeyField);
                //LDK.Assert.assertNotEmpty('No key present for clientModel: ' + (clientModel.store ? clientModel.store.storeId : 'no store'), key)
                var serverModel = serverStore.findRecord(clientKeyField, key, clientModel.internalId);
                if (!serverModel){
                    //TODO: determine whether to auto-create the record
                    //ALSO: we have a problem if the PK of the table isnt
                    serverModel = serverStore.addServerModel({});
                    serverModel._clientModelId = clientModel.internalId;
                }

                if (serverModel){
                    var serverFieldName;
                    for (var clientFieldName in fieldMap){
                        serverFieldName = fieldMap[clientFieldName];

                        var clientVal = Ext4.isEmpty(clientModel.get(clientFieldName)) ? null : clientModel.get(clientFieldName);
                        var serverVal = Ext4.isEmpty(serverModel.get(serverFieldName)) ? null : serverModel.get(serverFieldName);
                        if (serverVal != clientVal){
                            serverModel.set(serverFieldName, clientVal);
                            serverModel.phantom = clientModel.phantom;
                            serverModel.setDirty(true);

                            if (!changedRecords[serverStore.storeId])
                                changedRecords[serverStore.storeId] = {};

                            changedRecords[serverStore.storeId][serverModel.id] = serverModel;
                        }
                    }
                }
            }, this);

            var removed = this.getRemovedRecords();
            if (removed.length){
                Ext4.Array.forEach(removed, function(clientModel){
                    //find the corresponding server record
                    var key = clientModel.get(clientKeyField);
                    var serverModel = serverStore.findRecord(clientKeyField, key, clientModel.internalId);
                    if (serverModel){
                        if (clientModel.isRemovedRequest){
                            this.prepareServerModelForDelete(serverModel);
                        }
                        else {
                            LDK.Assert.assertTrue('Server model not found, remove() will not be successful: ' + key, serverStore.indexOf(serverModel) > -1);

                            serverStore.remove(serverModel);

                            // Strip out any records that are part of the server model that should be just ignored
                            // instead of deleted when saved
                            if (clientModel.isNonDelete) {
                                var serverRemoved = serverStore.getRemovedRecords();
                                for (var i = 0; i < serverRemoved.length; i++) {
                                    if (serverRemoved[i] == serverModel) {
                                        serverRemoved.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }, this);
            }

            //bug has been fixed and this assert is causing false positives on team city during initial page load
            // if we have a 1:1 store mapping, verify record count is the same
            // Note: on the very first storeCollection load we can get false positives, so skip then
            //if (sc.hasLoaded && Ext4.Object.getKeys(map).length == 1){
            //    LDK.Assert.assertEquality('Client/Server stores do not have the same record count: ' + this.storeId + ' (' + this.getCount() + ') / ' + serverStore.storeId + ' (' + serverStore.getCount() + ')', this.getCount(), serverStore.getCount());
            //}
        }
    }

});
