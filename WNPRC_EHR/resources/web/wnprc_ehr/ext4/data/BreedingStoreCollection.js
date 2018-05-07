// noinspection JSUnusedGlobalSymbols
Ext4.define('WNPRC.ext.data.BreedingStoreCollection', {
    extend: 'EHR.data.StoreCollection',

    addServerStoreFromConfig: function(config) {
        try {
            const params = Ext4.Object.fromQueryString(window.location.search.substring(1));
            const modded = Ext4.apply({}, config);
            if (params.pregnancyid) {
                modded.filterArray = (modded.filterArray || []);
                modded.filterArray.push(LABKEY.Filter.create("pregnancyId", params.pregnancyid, LABKEY.Filter.Types.EQUAL));
            }
            this.callParent([modded]);
        } catch (e) {
            console.error("error setting pregnancy id filter on server store, falling back to parent class behavior");
            console.error(e);
            this.callParent([config]);
        }
    }
});