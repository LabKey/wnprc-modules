/**
 * This describes a Data Entry client store that looks for slave client stores, checks what they want to subscribe to,
 * and updates those values.
 */

Ext4.define('WNPRC.ext.data.SingleAnimal.WaterClientStore', {
    extend: 'WNPRC.ext.data.SingleAnimal.MasterSectionClientStore',

    getExtraContext : function(){
        var self = this;
        var extraContent = this.callParent(arguments) || {};

        var waterMap = {};

        var allRecords = this.getRange();
        for (var idx = 0; idx < allRecords.length; ++idx){
            var record = allRecords[idx];
            if (record.get('volume') > 0){
                var id = record.get('Id');
                var date = record.get('date');
                if (!id || !date)
                    continue;

                date = date.format(LABKEY.extDefaultDateFormat);

                if (!waterMap[id])
                    waterMap[id] = [];

                waterMap[id].push({
                    objectid: record.get('objectid'),
                    treatmentId: record.get('treatmentId'),
                    date: date,
                    qcstate: record.get('qcstate'),
                    volume: record.get('volume'),
                    assignedto: record.get('assignedto'),
                    datasource: record.raw.dataSource,
                    //remove waterobjects and use treamentIds to complete
                    waterObjects: record.raw.waterObjects
                });
            }
        }

        if (!LABKEY.Utils.isEmptyObj(waterMap)){
            waterMap = Ext4.encode(waterMap);

            return {
                waterInTransaction: waterMap
            }
        }

        return extraContent;


    }


});