Ext4.define('WNPRC.ext.data.SingleAnimal.WaterApprenticeSectionClientStore', {
    extend: 'WNPRC.ext.data.SingleAnimal.SlaveSectionClientStore',

    getExtraContext: function(){

        var clientWaterMap = {};

        var  waterGivenRecords;
        var  waterAmountRecords;

         Ext4.data.StoreManager.each( function(store){
             if (store.queryName == 'waterGiven'){
                 waterGivenRecords = store.data;
             }else if (store.queryName == 'waterAmount'){
                 waterAmountRecords = store.data;
             }
         })
         console.log('Print allRecords '+ waterGivenRecords);

         for(var idx = 0; idx < waterGivenRecords.getCount(); idx++){
             var record = waterGivenRecords.getAt(idx).data;
             if( record.volume != null && record.volume) {
                 console.log(record.volume);

                 if(!clientWaterMap[record.Id]){
                     clientWaterMap[record.Id] = [];
                 }

                 clientWaterMap[record.Id].push({
                     objectid: record.objectid,
                     volume: record.volume,
                     qcstate: record.QCState
                 });
             }
         }

        for(var idx = 0; idx < waterAmountRecords.getCount(); idx++){
            var record = waterAmountRecords.getAt(idx).data;
            if( record.volume != null && record.volume) {
                if(!clientWaterMap[record.Id]){
                    clientWaterMap[record.Id] = [];
                }

                clientWaterMap[record.Id].push({
                    objectid: record.objectid,
                    volume: record.volume,
                    qcstate: record.QCState
                });
            }
        }
         if (!LABKEY.Utils.isEmptyObj(clientWaterMap)){
             clientWaterMap = Ext4.encode(clientWaterMap);

             return{
                 waterInForm : clientWaterMap
             }
         }

         return null;


    }

});