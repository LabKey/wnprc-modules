// noinspection JSUnresolvedVariable: Ext4 is pulled in by other code in the browser
(function (Ext4) {
    // noinspection JSUnusedGlobalSymbols: the functions are called by ExtJS
    Ext4.define('WNPRC.breeding.PregnancyDetailPanel', {
        alias: 'widget.wnprc-breeding-pregnancy',
        extend: 'LDK.panel.WebpartPanel',
        initComponent: function () {
            var loader = function(callback) {
                var promises = 0;
                return {
                    promise: function() { promises++; return this.resolve; },
                    resolve: function() { if (--promises === 0) callback(); }
                };
            }(function() {
                Ext4.defer(this.table.unmask, 500, this.table);
                // noinspection JSUnresolvedFunction: resumeLayouts is all good, it's ok
                Ext4.resumeLayouts(true);
            }.bind(this));
            // noinspection JSUnresolvedExtXType, JSUnusedGlobalSymbols: xtypes are fine, render is a valid event
            Ext4.apply(this, {
                items: [{
                    border: false,
                    items: [
                        {
                            border: false,
                            columnWidth: 0.25,
                            itemId: 'simpledetail',
                            xtype: 'wnprc-breeding-detail'
                        },
                        {
                            border: false,
                            childRecords: [{
                                // the relevant ultrasounds for the animal
                                queryName: '_UltrasoundInfoByParentRecordId',
                                schemaName: 'study',
                                title: 'Ultrasounds'
                            }, {
                                // the animal's previous pregnancies/other history
                                queryName: '_PregnancyInfoByParentRecordId',
                                schemaName: 'study',
                                title: 'Pregnancy History'
                            }],
                            columnWidth: 0.75,
                            itemId: 'childrecords',
                            listeners: {
                                childload: loader.promise()
                            },
                            margin: '0 0 0 20',
                            xtype: 'wnprc-breeding-childrecords'
                        }
                    ],
                    layout: 'column',
                    minHeight: 300,
                    xtype: 'panel'
                }],
                listeners: {
                    render: function () {
                        this.table.mask('Loading...');
                    }
                },
                title: 'Pregnancy Detail'
            });
            this.callParent(arguments);

            this.store = this.store.events ? this.store
                    : Ext4.create('LABKEY.ext4.data.Store', Ext4.apply(this.store, {autoLoad: false}));
            this.mon(this.store, 'load', this.onStoreLoad, this, {single: true});
            this.mon(this.store, 'load', loader.promise(), null, {single: true});
            this.store.load();
        },
        onStoreLoad: function (store) {
            // noinspection JSUnresolvedFunction: suspendLayouts is a legit Ext 4.2.1 function, don't worry
            Ext4.suspendLayouts();
            ['#simpledetail', '#childrecords'].forEach(function (id) {
                this.query(id)[0].loadFromStore(store);
            }, this);
        }
    });
})(Ext4);