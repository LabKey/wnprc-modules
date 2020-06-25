Ext4.define('WNPRC.ext.data.ResearchUltrasoundsServerStore', {
    extend: 'EHR.data.DataEntryServerStore',
    alias: 'store.wnprc-researchultrasoundsserverstore',

    constructor: function(){
        this.callParent(arguments);
    },
    //
    // //private
    // //this method performs simple checks client-side
    // validateRecords: function(records, validateOnServer){
    //     Ext4.Array.forEach(records, function(r){
    //         r.validate();
    //     }, this);
    //
    //     //Do not kick off server side validations on every user input
    //     this.fireEvent('validation', this, records);
    // }
});