// noinspection JSUnresolvedVariable: Ext4 provided by LabKey
(function (Ext) {
    // noinspection JSUnusedGlobalSymbols: Ext.Component.initComponent (1.1.0)
    Ext.define('WNPRC.ext4.ChildRecordsPanel', {
        alias: 'widget.wnprc-childrecordspanel',
        extend: 'Ext.panel.Panel',
        cls: 'wnprc-child-records-panel',
        bodyCls: 'labkey-main',
        border: false,
        layout: 'fit',
        listeners: {
            'render': function() {
                this.mask('Loading...', 'loading-indicator');
            }
        },
        unstyled: true,
        initComponent: function () {
            const CHILD_LOAD_EVENT = 'childLoad';
            this.addEvents(CHILD_LOAD_EVENT);
            this.callParent(arguments);
            // make sure the store was actually created rather than simply being the store _configuration_ (which is
            // what we might get sometimes), then add the 'load' handlers to:
            //   a) load the details and the child records and
            //   b) resolve one of the promises in the loader to indicate the main load has finished
            this.store = this.store.events ? this.store
                    : Ext.create('LABKEY.ext4.data.Store', Ext.apply(this.store, {autoLoad: false}));
            this.mon(this.store, 'load', function (store) {
                // get the first record for filtering and such
                const record = store.getAt(0);
                // dynamically update the title to show the dam's id
                this.setTitle((this.title && (this.title + ' - ')) + record.get('id'));
                // set the style for the child divs
                const style = 'margin: 10px 0px 0px 0px';
                // loop over each of the child record configs passed to the component and generate a new QueryWebPart to
                // display the data for the child record. that involves creating a blank div into which to render, adding
                // the parameters and the success handler, then creating and rendering the web part
                // noinspection JSUnresolvedVariable: requires native/polyfill ES6 Promise
                Promise.all((this.childRecords || []).map(function (c, i) {
                    // noinspection JSUnresolvedFunction: requires native/polyfill ES6 Promise
                    return new Promise((function (resolve, reject) {
                        // create the new element into which to render each child
                        // noinspection JSUnresolvedVariable
                        const childId = this.id + '-child-' + i;
                        Ext.DomHelper.append(this.body, {tag: 'div', id: childId, cls: c.cls, style: style});
                        // add the filter for the participant id and the success handler
                        // noinspection JSUnresolvedVariable, JSUnresolvedFunction, JSUnusedGlobalSymbols
                        Ext.merge(c, {
                            failure: reject,
                            filterArray: c.filterArrayFactory ? c.filterArrayFactory(record) : null,
                            parameters: c.parametersFactory ? c.parametersFactory(record) : null,
                            success: function () {
                                // noinspection JSUnresolvedFunction: 'this' is assumed to be a LABKEY.Query.DataRegion
                                this.hideMessage(true);
                                resolve();
                            }
                        });
                        // noinspection JSUnresolvedFunction: LABKEY.QueryWebPart defined in the LabKey code
                        (new LABKEY.QueryWebPart(c)).render(childId);
                    }).bind(this));
                }, this)).catch(function (e) {
                    console.error('error loading child records panel: ' + e);
                }).finally(Ext.defer.bind(this, function () {
                    this.fireEvent(CHILD_LOAD_EVENT, this);
                    this.doLayout();
                    Ext.defer(this.unmask, 300, this);
                }, 500, this));
            }, this, {single: true});
            this.store.load();
        }
    });
})(Ext4);