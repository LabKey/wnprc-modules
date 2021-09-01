/**
 * This describes a Data Entry client store that looks for slave client stores, checks what they want to subscribe to,
 * and updates those values.
 */

Ext4.define('WNPRC.ext.data.SingleAnimal.MasterSectionClientStore', {
    extend: 'EHR.data.DataEntryClientStore',

    constructor: function() {
        this.callParent(arguments);

        // Define a member object.
        this.subscribedFields = null;

        this.addEventListeners();
    },

    onUpdate: function (record, operation, modifiedFieldNames) {
        var self = this;

        if ((self.subscribedFields == null) && ('storeCollection' in self)) {
            self.subscribeToAll();
        }

        if (self.subscribedFields != null) {
            Ext4.suspendLayouts();
            // Update any subscribed stores.
            jQuery.each(modifiedFieldNames, function(i, fieldName) {
                if (fieldName in self.subscribedFields) {
                    var newVal = record.get(fieldName);
                    var storesToUpdate = self.subscribedFields[fieldName];

                    jQuery.each(storesToUpdate, function(storeId) {
                        var store = self.storeCollection.clientStores.getByKey(storeId);
                        store.each(function(record) {
                            if (fieldName in record.getData()) {
                                record.set(fieldName, newVal);
                            }
                        });
                    })
                }
            });
            Ext4.resumeLayouts(true);
        }

        this.callParent(arguments);
    },

    subscribeToClientStore: function(clientStore) {
        var self = this;
        if (WNPRC.ExtUtils.isInstanceOf(clientStore, WNPRC.ext.data.SingleAnimal.SlaveSectionClientStore) ||
                WNPRC.ExtUtils.isInstanceOf(clientStore, WNPRC.ext.data.SingleAnimal.WaterApprenticeSectionClientStore)) {
            var key = self.storeCollection.getKey(clientStore);
            if (self.subscribedFields == null) {
                self.subscribedFields = {};
            }

            jQuery.each(clientStore.getSlaveFields(), function(index, fieldname) {
                self.subscribedFields[fieldname] = self.subscribedFields[fieldname] || {};
                self.subscribedFields[fieldname][key] = true;
            });
        }
    },

    removeSubscriptionToClientStore: function(clientStore) {
        var self = this;
        var key = self.storeCollection.getKey(clientStore);

        jQuery.each(self.subscribedFields, function(index, field) {
            var subscribers = self.subscribedFields[field] || {};

            delete subscribers[key];

            // If we just removed the last entry in the lookup, remove the object.
            if (_.keys(subscribers).length === 0) {
                delete self.subscribedFields[field];
            }
        });
    },

    addEventListeners: function() {
        var self = this;

        if (!('storeCollection' in self)) {
            return;
        }

        var clientStores = self.storeCollection.clientStores;

        // Listen to additions.
        clientStores.addListener('add', function(index, addedStore, key) {
            self.subscribeToClientStore(addedStore);
        });

        // Listen for the collection to be cleared.
        clientStores.addListener('clear', function() {
            self.subscribedFields = null;
        });

        // Listen for substitutions in the collection.
        clientStores.addListener('replace', function(key, oldStore, newStore) {
            self.removeSubscriptionToClientStore(oldStore);
            self.subscribeToClientStore(newStore);
        });


        // Listen for removals from the collection.
        clientStores.addListener('remove', function(removedStore, key) {
            self.removeSubscriptionToClientStore(removedStore);
        });

        // Subscribe to all.
        self.subscribeToAll();
    },

    subscribeToAll: function() {
        var self = this;
        if ('storeCollection' in self) {
            var clientStores = self.storeCollection.clientStores.getRange();

            self.subscribedFields = {};
            jQuery.each(clientStores, function(index, store) {
                self.subscribeToClientStore(store);
            });
        }
    }
});