// noinspection JSUnresolvedVariable: Ext4 provided by LabKey
(function (Ext) {
    const CHILD_LOAD_EVENT_NAME = 'childLoad';
    Ext.define('WNPRC.ext4.ChildRecordPanel', {
        alias: 'widget.wnprc-childrecordpanel',
        extend: 'Ext.panel.Panel',
        childRecords: [],
        layout: 'fit',
        initComponent: function () {
            this.addEvents(CHILD_LOAD_EVENT_NAME);
            this.callParent(arguments);
        },
        loadFromStore: function (store) {
            // set the style for the child divs
            const style = 'margin: 0px 0px 10px 0px';
            // get the first record for the filtering
            const record = store.getAt(0);
            // loop over each of the child record configs passed to the component and generate a new QueryWebPart to
            // display the data for the child record. that involves creating a blank div into which to render, adding
            // the parameters and the success handler, then creating and rendering the web part
            const callbacks = (this.childRecords || []).map(function (c, i) {
                // noinspection JSUnresolvedFunction: requires native/polyfill ES6 Promise
                return new Promise((function (resolve, reject) {
                    // create the new element into which to render each child
                    const childId = this.id + '-child-' + i;
                    Ext.DomHelper.append(this.body, {tag: 'div', id: childId, style: style});
                    // add the filter for the participant id and the success handler
                    // noinspection JSUnresolvedVariable, JSUnresolvedFunction: standardButtons defined in the LABKEY code
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
            }, this);
            // wait for the child grids to load, then fire the child load event
            // noinspection JSUnresolvedVariable: requires native/polyfill ES6 Promise
            Promise.all(callbacks).then((function () {
                // pass an explicit 'null' as the argument so the handlers know there is no error
                this.fireEvent(CHILD_LOAD_EVENT_NAME, null);
            }).bind(this)).catch((function (e) {
                // pass the error along to any handlers
                this.fireEvent(CHILD_LOAD_EVENT_NAME, e);
            }).bind(this));
        }
    });
})(Ext4);