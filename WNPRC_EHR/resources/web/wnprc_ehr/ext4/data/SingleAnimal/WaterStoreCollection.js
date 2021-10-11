Ext4.define('WNPRC.ext.data.WaterStoreCollection', {
    extend: 'WNPRC.ext.data.TaskStoreCollection',

    //Set a custom type (wnprc-waterserverstore) for the storeConfig
    addServerStoreFromConfig: function(config){
        var storeConfig = Ext4.apply({}, config);
        Ext4.apply(storeConfig, {
            type: 'wnprc-waterserverstore',
            autoLoad: false,
            storeId: this.collectionId + '||' + LABKEY.ext4.Util.getLookupStoreId({lookup: config})
        });

        var store = this.serverStores.get(storeConfig.storeId);
        if (store){
            return store;
        }

        store = Ext4.create('WNPRC.ext.data.WaterServerStore', storeConfig);
        //this.getErrorMessages(false);

        this.addServerStore(store);

        return store;
    },
    //Overwritting the getErrorMessages to display INFO messages.
    getErrorMessages: function (){
        let ret = this.callParent(false);
        return ret;


    }
});