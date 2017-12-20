// noinspection JSUnresolvedVariable: Ext4 is pulled in by other code in the browser
(function (Ext4) {
    var CHILD_RECORD_STYLE = 'margin: 0px 0px 10px 0px';
    // noinspection JSUnusedGlobalSymbols: the functions are called by ExtJS
    Ext4.define('WNPRC.breeding.PregnancyChildRecordsPanel', {
        alias: 'widget.wnprc-pregnancychildrecords',
        extend: 'Ext.panel.Panel',
        layout: 'fit',
        renderTpl: [
            '<div id="{id}-body">',
            '<div id="{id}-ultrasounds" style="'+CHILD_RECORD_STYLE+'"></div>',
            '<div id="{id}-history"     style="'+CHILD_RECORD_STYLE+'"></div>',
            '{%this.renderContainer(out,values);%}',
            '</div>'
        ],
        loadFromStore: function (store) {
            var loader = function(callback) {
                var promises = 0;
                return {
                    resolve: function() { if ((--promises) === 0) callback(); },
                    promise: function() { promises++; return this.resolve; }
                };
            }(this.fireEvent.bind(this, 'childload'));

            var animalId = store.getAt(0).get('Id');
            // the relevant ultrasounds for the animal
            new LABKEY.QueryWebPart({
                filterArray: [LABKEY.Filter.create('Id', animalId, LABKEY.Filter.Types.EQUAL)],
                queryName: 'ultrasounds',
                renderTo: this.id + '-ultrasounds',
                schemaName: 'study',
                sort: '-date',
                success: loader.promise(),
                title: 'Ultrasounds'
            });
            // the animal's previous pregnancies/other history
            new LABKEY.QueryWebPart({
                filterArray: [LABKEY.Filter.create('Id', animalId, LABKEY.Filter.Types.EQUAL)],
                queryName: 'PregnancyInfo',
                renderTo: this.id + '-history',
                schemaName: 'study',
                success: loader.promise(),
                title: 'Pregnancy History',
                viewName: 'history'
            });
        }
    });
})(Ext4);