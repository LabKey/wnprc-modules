Ext4.define('WNPRC.ext.plugins.AnimalField', {
    extend: 'Ext4.util.Observable',
    alias: 'plugin.wnprc-animalfield',

    init: function(component) {
        Ext.apply(component, {
            participantMap: new Ext.util.MixedCollection,
            validationDelay: 1000,
            validationEvent: 'blur',
            validator: function(val) {
                if (!val) {
                    //we let the field's allowBlank handle this
                    return true;
                }

                // Force lowercase
                val = val.toLowerCase();

                // Trim whitespace
                val = val.replace(/^\s+|\s+$/g,"");

                // Update the field with any changes we just made
                if ( val !== this.getValue() ) {
                    this.setValue(val);
                }

                var species;
                if (val.match(/(^rh([0-9]{4})$)|(^r([0-9]{5})$)|(^rh-([0-9]{3})$)|(^rh[a-z]{2}([0-9]{2})$)/)) {
                    species = 'Rhesus';
                }
                else if (val.match(/(^cy?([0-9]{4,5})$)|(^c([0-9]{5})$)/)) {
                    console.log ("change species from participant");
                    species = 'Cynomolgus';
                }
                else if (val.match(/(^cj([0-9]{4})$)|(^cja([0-9]{3})$)/)) {
                    species = 'Marmoset';
                }
                else if (val.match(/^pd([0-9]{4})$/) || val.match(/^pdtemp/i) ) {
                    species = ''; // Prenatal death
                }
                else if (val.match(/^test([0-9]+)$/)) {
                    species = 'Rhesus';
                }
                else {
                    return "Unrecognized Id pattern.";
                }

                return true;
            }
        });

        // The following actually trigger the animal abstract pane to update.
        var ANIMAL_CHANGE_EVENT = 'animalchange';

        component.addEvents(ANIMAL_CHANGE_EVENT);
        component.enableBubble(ANIMAL_CHANGE_EVENT);

        component.on('change', function(field, val, oldVal) {
            component.fireEvent(ANIMAL_CHANGE_EVENT, val);
        }, this, {buffer: 200});
    }
});