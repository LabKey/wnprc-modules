/**
 * @external Ext4
 */
/**
 * @external Promise
 * @prop finally
 */
/**
 * @typedef {Object} Component
 * @prop mask
 * @prop unmask
 * @prop setTitle
 * @prop doLayout
 */
Ext4.define('WNPRC.ext4.ChildRecordsPanel', {
    alias: 'widget.wnprc-childrecordspanel',
    extend: 'Ext.panel.Panel',
    cls: 'wnprc-child-records-panel',
    bodyCls: 'labkey-main',
    border: false,
    layout: 'fit',
    listeners: {
        'render': function () {
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
                : Ext4.create('LABKEY.ext4.data.Store', Ext4.apply(this.store, {autoLoad: false}));
        this.mon(this.store, 'load', function (/** @type {{getAt}} **/ store) {
            // get the first record for filtering and such
            const record = store.getAt(0);
            // dynamically update the title to show the dam's id
            this.setTitle((this.title && (this.title + ' - ')) + record.get('Id'));
            // set the style for the child divs
            const style = 'margin: 10px 0px 0px 0px';
            // loop over each of the child record configs passed to the component and generate a new QueryWebPart to
            // display the data for the child record. that involves creating a blank div into which to render, adding
            // the parameters and the success handler, then creating and rendering the web part
            Promise.all((this.childRecords || []).map(function (/** @type {{filterArrayFactory, parametersFactory}} */ c, i) {
                return new Promise((function (resolve, reject) {
                    // create the new element into which to render each child
                    const childId = this.Id + '-child-' + i;
                    Ext4.DomHelper.append(this.body, {tag: 'div', Id: childId, cls: c.cls, style: style});
                    // add the filter for the participant id and the success handler
                    Ext4.merge(c, {
                        failure: reject,
                        filterArray: c.filterArrayFactory ? c.filterArrayFactory(record) : null,
                        parameters: c.parametersFactory ? c.parametersFactory(record) : null,
                        success: function () {
                            this.hideMessage(true);
                            resolve();
                        }
                    });
                    (new LABKEY.QueryWebPart(c)).render(childId);
                }).bind(this));
            }, this)).catch(function (e) {
                console.error('error loading child records panel: ' + e);
            }).finally(Ext4.defer.bind(this, function () {
                this.fireEvent(CHILD_LOAD_EVENT, this);
                this.doLayout();
                Ext4.defer(this.unmask, 300, this);
            }, 500, this));
        }, this, {single: true});
        this.store.load();
    }
});