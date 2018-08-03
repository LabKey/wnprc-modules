/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('WNPRC.ext.data.RequestStoreCollection', (function() {
    var QCStateFieldName = "QCState";
    var requestIdFieldName = 'requestid';

    return  {
        extend: 'EHR.data.RequestStoreCollection',

        getRequestRecord: function() {
            var requestStore = this.getServerStoreForQuery('ehr', 'requests');
            var requestRecords = requestStore.getRange(); // This should always return an array of one.

            return (requestRecords.length > 0) ? requestRecords[0] : null;
        },

        getRequestQCState: function() {
            var requestRec = this.getRequestRecord();

            return (requestRec == null) ? null : requestRec.get('qcstate');
        },

        setClientModelDefaults: function(model) {
            if ( this.getRequestQCState() !== null && model.get(QCStateFieldName) ) {
                model.suspendEvents();
                model.set(QCStateFieldName, this.getRequestQCState());
                model.resumeEvents();
            }

            return this.callParent(arguments);
        },

        commitChanges: function() {
            var self = this;
            var QCState = this.getRequestQCState();

            var hasField = function(store, field) {
                return store.getFields().get(field) !== null;
            };

            // Ensure all records associated with the task have the same QCState
            if (QCState !== null) {
                self.clientStores.each(function(store) {
                    if (hasField(store, QCStateFieldName)) {
                        store.each(function(record) {
                            if (QCState != record.get(QCStateFieldName)) {
                                record.beginEdit();
                                record.set(QCStateFieldName, QCState);
                                record.endEdit(true);
                            }
                        });
                    }
                });

                self.serverStores.each(function(store) {
                    if (hasField(store, QCStateFieldName)) {
                        store.each(function(record) {
                            if (record.isRemovedRequest){
                                return;  //do not check these records.  they have deliberately been separated.
                            }

                            if (QCState != record.get(QCStateFieldName)) {
                                record.beginEdit();
                                record.set(QCStateFieldName, QCState);
                                record.endEdit(true);
                            }
                        });
                    }
                });
            }

            var linkedRequestField = Ext4.ComponentQuery.query('field[itemId=linkedRequestField]')[0];
            if (linkedRequestField && linkedRequestField.value) {
                var linkedRequestId = linkedRequestField.value;
                self.clientStores.each(function(store) {
                    if (hasField(store, requestIdFieldName)) {
                        if (store.keyFieldName == requestIdFieldName) {
                            store.removeAll();
                            store.sync();
                        } else {
                            store.each(function (record) {
                                if (linkedRequestId != record.get(requestIdFieldName)) {
                                    record.beginEdit();
                                    record.set(requestIdFieldName, linkedRequestId);
                                    record.endEdit(true);
                                }
                            });
                        }
                    }
                });

                self.serverStores.each(function(store) {
                    if (hasField(store, requestIdFieldName)) {
                        if (store.queryName == 'requests') {
                            store.removeAll();
                            store.sync();
                        } else {
                            store.each(function (record) {
                                if (linkedRequestId != record.get(requestIdFieldName)) {
                                    record.beginEdit();
                                    record.set(requestIdFieldName, linkedRequestId);
                                    record.endEdit(true);
                                }
                            });
                        }
                    }
                });
            }

            return this.callParent(arguments);
        }
    };
})());