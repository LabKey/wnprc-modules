// noinspection JSUnresolvedVariable: Ext4 provided by LabKey
(function (Ext) {
    // noinspection JSUnusedGlobalSymbols: Ext.Component.initComponent (1.1.0)
    Ext.define('WNPRC.ext4.ParentChildDetailPanel', {
        alias: 'widget.wnprc-parentchilddetailpanel',
        extend: 'LDK.panel.WebpartPanel',
        initComponent: function () {
            const DETAIL_LOAD_EVENT_NAME = 'detailLoad';
            const DETAIL_PANEL_XTYPE = 'wnprc-detailpanel';
            const CHILD_RECORD_XTYPE = 'wnprc-childrecordpanel';
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
            this.addEvents(DETAIL_LOAD_EVENT_NAME);
            this.callParent(arguments);
            // noinspection JSUnresolvedFunction: requires native/polyfill ES6 Promise
            const callbacks = [
                // make sure the store was actually created rather than simply being the store _configuration_ (which is
                // what we might get sometimes), then add the 'load' handlers to:
                //   a) load the details and the child records and
                //   b) resolve one of the promises in the loader to indicate the main load has finished
                new Promise((function (resolve) {
                    this.store = this.store.events ? this.store
                            : Ext.create('LABKEY.ext4.data.Store', Ext.apply(this.store, {autoLoad: false}));
                    this.mon(this.store, 'load', function (store) {
                        // noinspection JSUnresolvedFunction: Ext.suspendLayouts (4.1.1)
                        Ext.suspendLayouts();
                        this.query(DETAIL_PANEL_XTYPE + ', ' + CHILD_RECORD_XTYPE).forEach(function (i) {
                            i.loadFromStore(store);
                        }, this);
                        resolve();
                    }, this, {single: true});
                    this.store.load();
                }).bind(this)),
                // wait for each of the child record grids to load (the panel will fire an event)
                new Promise((function (resolve, reject) {
                    this.mon(this.down(CHILD_RECORD_XTYPE), 'childLoad', function (e) {
                        if (e) {
                            // there was an error, so head for the catch handler
                            reject(e);
                        }
                        else {
                            // no argument means no problem, proceed as normal
                            resolve();
                        }
                    }, this, {single: true});
                }).bind(this))
            ];
            // noinspection JSUnresolvedVariable: requires native/polyfill ES6 Promise
            Promise.all(callbacks).catch((function (e) {
                log.error('error loading child detail panel: ' + e);
            }).bind(this)).finally((function () {
                Ext.defer(this.table.unmask, 500, this.table);
                Ext.defer(this.fireEvent, 500, this, [DETAIL_LOAD_EVENT_NAME, this]);
                // noinspection JSUnresolvedFunction: Ext.resumeLayouts (4.1.0)
                Ext.resumeLayouts(true);
            }).bind(this));
        }
    });
})(Ext4);