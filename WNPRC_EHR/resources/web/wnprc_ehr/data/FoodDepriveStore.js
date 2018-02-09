Ext4.define('EHR.data.FoodDepriveStore',{
    extend: 'EHR.data.TaskStoreCollection',

    constructor: function(){
        this.callParent(arguments);
        this.on('update', this.onRecordUpdate, this);
    },
    getRemarksStore: function(){
        if (this.remarkStore){
            return this.remarkStore;
        }

        this.remarkStore = this.getClientStoreByName('foodDeprives');
        LDK.Assert.assertNotEmpty('Unable to find food deprives store in FoodDepriveStore', this.remarkStore);

        return this.remarkStore;
    },

    getRemarksRec: function(){
        var remarkStore = this.getRemarksStore();
        if (remarkStore){
            return remarkStore;
            /*LDK.Assert.assertTrue('More than 1 record found in food deprive store, actual: ' + remarkStore.getCount(), remarkStore.getCount() <= 1);
            if (remarkStore.getCount() == 1){
                return remarkStore.getAt(0);
            }*/
        }
    },
})