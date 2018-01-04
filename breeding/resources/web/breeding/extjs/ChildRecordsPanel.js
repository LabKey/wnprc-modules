// noinspection JSUnresolvedVariable: Ext4 provided by LabKey
(function (Ext) {
    Ext.define('WNPRC.ext4.ChildRecordsPanel', {
        alias: 'widget.wnprc-childrecordspanel',
        childRecords: [],
        extend: 'Ext.panel.Panel',
        layout: 'fit',
        loadFromStore: function (store) {
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

            // creates and returns a new handler function for the success handler that closes over the passed resolve
            // function argument so that each instance of the handler can resolve its own unique promise instance
            const onSuccess = function (resolve) {
                return function () {
                    // noinspection JSUnresolvedFunction: 'this' is assumed to be a LABKEY.Query.DataRegion
                    this.hideMessage(true);
                    resolve();
                };
            };

            const loader = onLoad(this.fireEvent.bind(this, 'childload'));
            // set the style for the child divs
            const style = 'margin: 0px 0px 10px 0px';
            // get the first record for the filtering
            const record = store.getAt(0);
            // loop over each of the child record configs passed to the component and generate a new QueryWebPart to
            // display the data for the child record. that involves creating a blank div into which to render, adding
            // the parameters and the success handler, then creating and rendering the web part
            (this.childRecords || []).forEach(function (c, i) {
                // create the new element into which to render each child
                const childId = this.id + '-child-' + i;
                Ext.DomHelper.append(this.body, {tag: 'div', id: childId, style: style});
                // add the filter for the participant id and the success handler
                // noinspection JSUnresolvedVariable, JSUnresolvedFunction: standardButtons defined in the LABKEY code
                Ext.apply(c, {
                    buttonBar: {
                        items: [
                            LABKEY.QueryWebPart.standardButtons.insertNew,
                            LABKEY.QueryWebPart.standardButtons.exportRows,
                            LABKEY.QueryWebPart.standardButtons.print
                        ]
                    },
                    failure: LABKEY.Utils.onError,
                    filterArray: c.filterArrayFactory ? c.filterArrayFactory(record) : null,
                    parameters: c.parametersFactory ? c.parametersFactory(record) : null,
                    success: onSuccess(loader.promise())
                });
                // noinspection JSUnresolvedFunction: LABKEY.QueryWebPart defined in the LabKey code
                (new LABKEY.QueryWebPart(c)).render(childId);
            }, this);
        }
    });
})(Ext4);