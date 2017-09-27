/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('WNPRC.ext.data.TaskStoreCollection', (function() {
    var QCStateFieldName = "QCState";

    return  {
        extend: 'EHR.data.TaskStoreCollection',

        getTaskRecord: function() {
            var taskStore = this.getServerStoreForQuery('ehr', 'tasks');
            var taskRecords = taskStore.getRange(); // This should always return an array of one.

            return (taskRecords.length > 0) ? taskRecords[0] : null;
        },

        getTaskQCState: function() {
            var taskRec = this.getTaskRecord();

            return (taskRec == null) ? null : taskRec.get('qcstate');
        },

        setClientModelDefaults: function(model) {
            if ( this.getTaskQCState() !== null && model.get(QCStateFieldName) ) {
                model.suspendEvents();
                model.set(QCStateFieldName, this.getTaskQCState());
                model.resumeEvents();
            }

            return this.callParent(arguments);
        },

        commitChanges: function() {
            var self = this;
            var QCState = this.getTaskQCState();

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

            return this.callParent(arguments);
        }
    };
})());