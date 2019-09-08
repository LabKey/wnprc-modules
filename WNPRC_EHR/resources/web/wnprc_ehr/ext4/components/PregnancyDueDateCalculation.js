Ext4.define('WNPRC.ext.plugins.PregnancyDueDateCalculation', {
    extend: 'Ext4.util.Observable',
    alias: 'plugin.wnprc-pregnancyduedatecalculation',

    init: function(component) {
        Ext.apply(component, {
            validationDelay: 1000,
            validationEvent: 'blur',
        });

        // The following actually trigger the animal abstract pane to update.
        let PREGNANCY_DUE_DATE_CHANGE_EVENT = 'pregnancydatechange_';
        let fieldName = component.name;

        component.addEvents(PREGNANCY_DUE_DATE_CHANGE_EVENT + fieldName);
        component.enableBubble(PREGNANCY_DUE_DATE_CHANGE_EVENT + fieldName);

        component.on('change', function(field, val, oldVal) {
            component.fireEvent(PREGNANCY_DUE_DATE_CHANGE_EVENT + fieldName, field.name, val, oldVal);
        }, this, {buffer: 200});
    }
});