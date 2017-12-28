// noinspection JSUnresolvedVariable: Ext4 provided by LabKey
(function (Ext) {
    Ext.define('WNPRC.breeding.ChildRecordsPanel', {
        alias: 'widget.wnprc-breeding-childrecords',
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

            // this funky-looking business generates a distinct success handler closure for each child
            // record config, complete with its own 'promise' for the scoped loader object generated above.
            // it looks strange (with the whole function-returning-an-object-with-a-function thing) because
            // that enables us to create a _new_ closure for each child configuration instead of re-using
            // an existing one by accident, which is necessary for us to chain up the call to 'hideMessage'
            // (if we only needed to resolve the 'promise' call, we could just pass the promise in itself)
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
            // set up the parameters for the child record queries, which are all assumed to be parameterized queries
            // taking a single 'PARENT_RECORD_ID' as the parameter (which the query would then know what to do with)
            const params = {PARENT_RECORD_ID: store.getAt(0).get('objectid')};
            // loop over each of the child record configs passed to the component and generate a new QueryWebPart to
            // display the data for the child record. that involves creating a blank div into which to render, adding
            // the parameters and the success handler, then creating and rendering the web part
            (this.childRecords || []).forEach(function (c, i) {
                // create the new element into which to render each child
                const childId = this.id + '-child-' + i;
                Ext.DomHelper.append(this.body, {tag: 'div', id: childId, style: style});
                // add the filter for the participant id and the success handler
                Ext.apply(c, {
                    failure: LABKEY.Utils.onError,
                    parameters: params,
                    success: onSuccess(loader.promise())
                });
                // noinspection JSUnresolvedFunction: LABKEY.QueryWebPart defined in the LabKey code
                (new LABKEY.QueryWebPart(c)).render(childId);
            }, this);
        }
    });
})(Ext4);