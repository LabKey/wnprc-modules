// noinspection JSUnresolvedVariable: Ext4 is pulled in by other code in the browser
(function (Ext4) {
    // noinspection JSUnusedGlobalSymbols: the functions are called by ExtJS
    Ext4.define('WNPRC.breeding.ChildRecordsPanel', {
        alias: 'widget.wnprc-breeding-childrecords',
        childRecords: [],
        extend: 'Ext.panel.Panel',
        layout: 'fit',
        loadFromStore: function (store) {
            // create a scoped helper object to co-ordinate the async functions from each of the children. essentially
            // a poor-man's 'promise' library, which will only work in-so-far as all the calls to 'promise' happen
            // before any of the calls to 'resolve' (which--in this instance--they _should_, but still be advised that
            // there is no protection currently for an instance where they do interleave)
            const loader = function (callback) {
                var promises = 0;
                return {
                    resolve: function () {
                        if ((--promises) === 0) callback();
                    },
                    promise: function () {
                        promises++;
                        return this.resolve;
                    }
                };
            }(this.fireEvent.bind(this, 'childload'));
            // set the style for the child divs
            const style = 'margin: 0px 0px 10px 0px';

            // noinspection JSUnresolvedVariable: LABKEY.Filter defined in the LabKey code
            const params = { PARENT_RECORD_ID: store.getAt(0).get('objectid') };
            (this.childRecords || []).forEach(function (c, i) {
                // create the new element into which to render each child
                const childId = this.id + '-child-' + i;
                Ext4.DomHelper.append(this.body, {tag: 'div', id: childId, style: style});
                // add the filter for the participant id and the success handler
                Ext4.apply(c, {
                    failure: LABKEY.Utils.onError,
                    parameters: params,
                    success: (function(cb) {
                        return {
                            // in the success callback, hide the message area in each child (which shows the query
                            // params) then call the 'childload' callback to alert the parent
                            callback: function() {
                                // noinspection JSUnresolvedFunction: 'this' is assumed to be a LABKEY.Query.DataRegion
                                this.hideMessage(true);
                                cb();
                            }
                        };
                    })(loader.promise()).callback
                });
                // noinspection JSUnresolvedFunction: LABKEY.QueryWebPart defined in the LabKey code
                (new LABKEY.QueryWebPart(c)).render(childId);
            }, this);
        }
    });
})(Ext4);