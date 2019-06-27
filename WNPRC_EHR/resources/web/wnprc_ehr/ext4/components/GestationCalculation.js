Ext4.define('WNPRC.ext.plugins.GestationCalculation', {
    extend: 'Ext4.util.Observable',
    alias: 'plugin.wnprc-gestationcalculation',

    init: function(component) {
        Ext.apply(component, {
            validationDelay: 1000,
            validationEvent: 'blur',
        });

        // The following actually trigger the animal abstract pane to update.
        let GESTATION_CHANGE_EVENT = 'gestationchange_';

        let fieldName = component.name;
        if (fieldName.endsWith('_mm')) {
            fieldName = fieldName.slice(0, -3);
        }
        fieldName += '_gest_day';

        component.addEvents(GESTATION_CHANGE_EVENT + fieldName);
        component.enableBubble(GESTATION_CHANGE_EVENT + fieldName);

        component.on('change', function(field, val, oldVal) {
            component.fireEvent(GESTATION_CHANGE_EVENT + fieldName, field.name, val, oldVal);
        }, this, {buffer: 200});
    }
});