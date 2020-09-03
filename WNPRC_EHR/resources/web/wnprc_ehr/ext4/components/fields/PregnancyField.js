Ext4.define('WNPRC.ext.components.fields.PregnancyField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.wnprc-pregnancyfield',
    constructor: function() {
        console.log('constructing pregnancy field');
        this.callParent(arguments);
    },
    initComponent: function () {
        console.log('initializing pregnancy field');
        this.callParent(arguments);
    }
});