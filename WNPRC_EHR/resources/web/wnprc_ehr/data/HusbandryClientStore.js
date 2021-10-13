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