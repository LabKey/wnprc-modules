/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @param fieldConfigs
 */
Ext4.define('EHR.data.HousingClientStore', {
    extend: 'EHR.data.DataEntryClientStore',

    //TODO: automatically populate roommates column

    getExtraContext: function(){
        var map = {};
        var allRecords = this.getRange();
        for (var idx = 0; idx < allRecords.length; ++idx){
            var record = allRecords[idx];

            var date = record.get('date');
            var id = record.get('Id');
            var room = record.get('room');
            if (!id || !date)
                continue;

            if (!map[id])
                map[id] = [];

            map[id].push({
                Id: id,
                objectid: record.get('objectid'),
                date: date,
                enddate: record.fields.get('enddate') ? record.get('enddate') : null,
                qcstate: record.get('QCState'),
                room: record.get('room'),
                cage: record.get('cage'),
                divider: record.fields.get('divider') ? record.get('divider') : null
            });
        }

        if (!LABKEY.Utils.isEmptyObj(map)){
            map = Ext4.encode(map);

            return {
                housingInTransaction: map
            }
        }

        return null;
    }
});
