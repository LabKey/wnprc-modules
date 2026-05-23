/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.data.HusbandryClientStore', {
    extend: 'EHR.data.DataEntryClientStore',

    constructor: function(){
        this.callParent(arguments);
    },

    getExtraContext: function(){
        var frequencyLabel = {};
        var allRecords = this.getRange();
        for (var idx = 0; idx < allRecords.length; ++idx){

            var record = allRecords[idx];
            var id = record.get('Id');
            var label = record.get('frequency/meaning');



            frequencyLabel[id].push({
                Id : id,
                label: label
            })
        }

        if (!LABKEY.Utils.isEmptyObj(frequencyLabel)){
            map = Ext4.encode(frequencyLabel);

            return {
                frequencyLabels : frequencyLabel
            }
        }
        return null;
    }

});