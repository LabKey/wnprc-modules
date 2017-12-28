// noinspection JSUnresolvedVariable: Ext4 provided by LabKey
(function (Ext) {
    // noinspection JSUnusedGlobalSymbols: Ext.Component.initComponent (1.1.0)
    Ext.define('WNPRC.breeding.PregnancyDetailPanel', {
        alias: 'widget.wnprc-breeding-pregnancy',
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
            const simpleDetailId = 'simpledetail';
            const childRecordsId = 'childrecords';
            const onStoreLoad = function (store) {
                // noinspection JSUnresolvedFunction: Ext.suspendLayouts (4.1.1)
                Ext.suspendLayouts();
                [simpleDetailId, childRecordsId].forEach(function (id) {
                    this.down('#' + id)[0].loadFromStore(store);
                }, this);
            };

            // configure the queries for the child records. these are all assumed to be
            // parameterized queries that take the id of the 'parent' record (in this
            // case a pregnancy.objectid) as the PARENT_RECORD_ID parameter
            const children = [{
                queryName: '_UltrasoundInfoByParentRecordId',
                schemaName: 'study',
                title: 'Ultrasounds'
            }, {
                queryName: '_PregnancyInfoByParentRecordId',
                schemaName: 'study',
                title: 'Pregnancy History'
            }];

            // noinspection JSUnresolvedExtXType: Ext.panel.Panel (2.3.0)
            Ext.apply(this, {
                items: [{
                    border: false,
                    items: [{
                        bodyStyle: 'padding: 5px;',
                        border: false,
                        columnWidth: 0.25,
                        itemId: simpleDetailId,
                        xtype: 'wnprc-breeding-detail'
                    }, {
                        border: false,
                        childRecords: children,
                        columnWidth: 0.75,
                        itemId: childRecordsId,
                        listeners: {
                            'childload': loader.promise()
                        },
                        margin: '0 0 0 20',
                        xtype: 'wnprc-breeding-childrecords'
                    }],
                    layout: 'column',
                    minHeight: 300,
                    xtype: 'panel'
                }],
                listeners: {
                    'render': function () {
                        this.table.mask('Loading...');
                    }
                },
                title: 'Pregnancy Detail'
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