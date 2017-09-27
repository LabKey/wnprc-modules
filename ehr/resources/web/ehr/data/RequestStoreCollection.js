/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.data.RequestStoreCollection', {
    extend: 'EHR.data.StoreCollection',

    getRequestId: function(){
        var model = this.getServerStoreForQuery('ehr', 'requests').getAt(0);
        if (model)
            return model.get('requestid');
    },

    setClientModelDefaults: function(model){
        if (!model.get('requestid')){
            model.suspendEvents();
            model.set('requestid', this.getRequestId());
            model.resumeEvents();
        }

        return this.callParent([model]);
    },

    commitChanges: function(){
        // ensure all records are using this requestid and alert if not
        var requestid = this.getRequestId();
        if (requestid){
            this.clientStores.each(function(cs){
                if (cs.getFields().get('requestid') != null){
                    cs.each(function(r){
                        if (requestid != r.get('requestid')){
                            LDK.Assert.assertEquality('Incorrect requestid for client store:' + cs.storeId, requestid, r.get('requestid'));
                            r.beginEdit();
                            r.set('requestid', this.getRequestId());
                            r.endEdit(true);
                        }
                    }, this);
                }
            }, this);

            this.serverStores.each(function(cs){
                if (cs.getFields().get('requestid') != null){
                    cs.each(function(r){
                        if (r.isRemovedRequest){
                            return;  //do not check these records.  they have deliberately been separated.
                        }

                        if (requestid != r.get('requestid')){
                            LDK.Assert.assertEquality('Incorrect requestid for server store:' + cs.storeId, requestid, r.get('requestid'));
                            r.beginEdit();
                            r.set('requestid', this.getRequestId());
                            r.endEdit(true);
                        }
                    }, this);
                }
            }, this);
        }

        return this.callParent(arguments);
    }
});