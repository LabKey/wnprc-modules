Ext4.define('WNPRC.ext.plugins.ProcedureField', {
    extend: 'Ext4.util.Observable',
    alias: 'plugin.wnprc-procedurefield',

    init: function(component) {
        let PROCEDURE_CHANGE_EVENT = 'procedurechange';

        component.addEvents(PROCEDURE_CHANGE_EVENT);
        component.enableBubble(PROCEDURE_CHANGE_EVENT);

        component.on('change', function(field, val, oldVal) {
            component.fireEvent(PROCEDURE_CHANGE_EVENT, val);
        }, this, {buffer: 200});
    }
});