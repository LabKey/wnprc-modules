/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
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