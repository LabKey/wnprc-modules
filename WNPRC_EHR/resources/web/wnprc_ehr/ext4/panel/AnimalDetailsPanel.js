Ext4.define('WNPRC.ext4.panel.AnimalDetailsPanel', {
    extend: 'EHR.panel.AnimalDetailsPanel',
    alias: 'widget.wnprc-animaldetailspanel',

    getItems: function() {
        var items = this.callParent(arguments);

        items[0].items[1].items.splice(3, 0, {
            fieldLabel: "Medical",
            name: "medical"
        });

        return items;
    },

    getFieldsToSet: function(id, demographicsMap) {
        return {
            'medical': demographicsMap.getProperty("medical")
        }
    }
});