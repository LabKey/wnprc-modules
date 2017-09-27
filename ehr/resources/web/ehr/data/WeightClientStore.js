/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @param fieldConfigs
 */
Ext4.define('EHR.data.WeightClientStore', {
    extend: 'EHR.data.DataEntryClientStore',

    getExtraContext: function(){
        var weightMap = {};
        var allRecords = this.getRange();
        for (var idx = 0; idx < allRecords.length; ++idx){
            var record = allRecords[idx];
            if (record.get('weight') > 0){
                var id = record.get('Id');
                var date = record.get('date');
                if (!id || !date)
                    continue;

                date = date.format('Y-m-d');

                if (!weightMap[id])
                    weightMap[id] = [];

                weightMap[id].push({
                    objectid: record.get('objectid'),
                    date: date,
                    qcstate: record.get('QCState'),
                    weight: record.get('weight')
                });
            }
        }

        if (!LABKEY.Utils.isEmptyObj(weightMap)){
            weightMap = Ext4.encode(weightMap);

            return {
                weightInTransaction: weightMap
            }
        }

        return null;
    }
});
