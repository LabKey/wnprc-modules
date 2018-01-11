// noinspection JSUnresolvedVariable: Ext4 provided by LabKey
(function (Ext) {
    // noinspection JSUnusedGlobalSymbols: Ext.Component.initComponent (1.1.0)
    Ext.define('WNPRC.ext4.ParentChildDetailPanel', {
        alias: 'widget.wnprc-parentchilddetailpanel',
        extend: 'LDK.panel.WebpartPanel',

        initComponent: function () {
            // creates a scoped helper object to co-ordinate the async functions from each of the children. essentially
            // a poor-man's 'promise' library, which will only work in-so-far as all the calls to 'promise' happen
            // before any of the calls to 'resolve' (which--in this instance--they _should_, but still be advised that
            // there is no protection currently for an instance where they do interleave)
            const onLoad = function (callback) {
                var promises = 0;
                return {
                    promise: function () {
                        promises++;
                        return this.resolve;
                    },
                    resolve: function () {
                        if ((--promises) === 0) callback();
                    }
                };
            };

            // create the loader instance to turn off the 'loading' mask and resume
            // rendering of the components (to make it a more pleasing visual experience)
            const loader = onLoad(function () {
                Ext.defer(this.table.unmask, 500, this.table);
                // noinspection JSUnresolvedFunction: Ext.resumeLayouts (4.1.0)
                Ext.resumeLayouts(true);
            }.bind(this));

            // define the handler for loading the child records after the initial loading is complete
            const DETAIL_PANEL_XTYPE = 'wnprc-detailpanel';
            const CHILD_RECORD_XTYPE = 'wnprc-childrecordspanel';
            const onStoreLoad = function (store) {
                // noinspection JSUnresolvedFunction: Ext.suspendLayouts (4.1.1)
                Ext.suspendLayouts();
                this.query(DETAIL_PANEL_XTYPE + ', ' + CHILD_RECORD_XTYPE).forEach(function (i) {
                    i.loadFromStore(store);
                }, this);
            };

            // noinspection JSUnresolvedExtXType: Ext.panel.Panel (2.3.0)
            Ext.apply(this, {
                items: [{
                    border: false,
                    items: [{
                        bodyStyle: 'padding: 5px;',
                        border: false,
                        columnWidth: 0.25,
                        xtype: DETAIL_PANEL_XTYPE
                    }, {
                        border: false,
                        childRecords: this.childRecords,
                        columnWidth: 0.75,
                        listeners: {
                            'childload': loader.promise()
                        },
                        margin: '0 0 0 20',
                        xtype: CHILD_RECORD_XTYPE
                    }],
                    layout: 'column',
                    minHeight: 300,
                    xtype: 'panel'
                }],
                listeners: {
                    'render': function () {
                        this.table.mask('Loading...');
                    }
                }
            });
            this.callParent(arguments);

            // make sure the store was actually created rather than simply being the store _configuration_ (which is
            // what we might get sometimes), then add the 'load' handlers to:
            //   a) load the details and the child records and
            //   b) resolve one of the promises in the loader to indicate the main load has finished
            this.store = this.store.events ? this.store
                    : Ext.create('LABKEY.ext4.data.Store', Ext.apply(this.store, {autoLoad: false}));
            this.mon(this.store, 'load', onStoreLoad, this, {single: true});
            this.mon(this.store, 'load', loader.promise(), null, {single: true});
            this.store.load();
        }
    });
})(Ext4);