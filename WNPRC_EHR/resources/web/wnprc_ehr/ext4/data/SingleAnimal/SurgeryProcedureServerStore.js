Ext4.define('WNPRC.ext.data.SurgeryProcedureServerStore', {
    extend: 'EHR.data.DataEntryServerStore',
    alias: 'store.wnprc-surgeryprocedureserverstore',

    constructor: function(){
        this.callParent(arguments);
    },
});