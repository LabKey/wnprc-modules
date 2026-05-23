/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('WNPRC.ext.data.NecropsyServerStore', {
    extend: 'EHR.data.DataEntryServerStore',
    alias: 'store.wnprc-necropsyserverstore',

    constructor: function(){
        this.callParent(arguments);
    },

    //private
    //this method performs simple checks client-side
    validateRecords: function(records, validateOnServer){
        Ext4.Array.forEach(records, function(r){
            r.validate();
        }, this);

        //Do not kick off server side validations on every user input
        this.fireEvent('validation', this, records);
    }
});