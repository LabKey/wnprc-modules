Ext4.define('EHR.data.FoodDepriveStore',{
    extend: 'EHR.data.TaskStoreCollection',

    constructor: function(){
        this.callParent(arguments);
        this.on('update', this.onRecordUpdate, this);
    },
    getFoodDepriveStore: function(){
        if (this.foodDepriveStore){
            return this.foodDepriveStore;
        }

        this.foodDepriveStore = this.getClientStoreByName('foodDeprives');
        LDK.Assert.assertNotEmpty('Unable to find food deprives store in FoodDepriveStore', this.foodDepriveStore);

        return this.foodDepriveStore;
    },
    getFoodDepriveRec: function(){
        console.log ("call Food deprive");
        var foodDepriveStore = this.getFoodDepriveStore();
        if (foodDepriveStore){
            return foodDepriveStore;
            /*LDK.Assert.assertTrue('More than 1 record found in food deprive store, actual: ' + remarkStore.getCount(), remarkStore.getCount() <= 1);
            if (remarkStore.getCount() == 1){
                return remarkStore.getAt(0);
            }*/
        }
    },
})