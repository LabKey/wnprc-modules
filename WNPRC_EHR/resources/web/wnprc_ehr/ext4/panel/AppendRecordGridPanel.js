/**
 * @external Ext4
 */
(function () {
    /**
     * Executes all the actions currently in the edit action queue, clearing the queue as it goes.
     * @private
     */
    function _flush() {
        while (this._queue.length) this._queue.shift()();
    }

    Ext4.define('WNPRC.grid.AppendRecordGridPanel', {
        extend: 'EHR.grid.Panel',
        alias: 'widget.wnprc-appendrecordgridpanel',

        /** @type {Function[]} */
        _queue: [],

        /** @override */
        initComponent: function () {
            this.callParent(arguments);

            const plugin = Ext4.create('WNPRC.plugin.ButtonHotKeyPlugin', { // from ButtonHotKeyPlugin.js
                buttonId: 'appendRecordBtn',                                // from AppendRecordButton.js
                keyCode: 187, // the '=' key, next to delete/backspace
                shift: true
            });

            this.plugins = this.plugins || [];
            this.plugins.push(plugin);

            // the plugin needs to execute after a slight delay in order to allow for the store collection
            // to set the default values for the model that would be created. for some reason, if it races
            // into this handler, that function does not properly fill the "perfomed by" field
            //   - clay, 09 May 2018
            this.mon(this, 'afterrender', plugin.execute, plugin, {single: true, delay: 500});

            this.mon(this, 'beforeedit',    _flush, this);
            this.mon(this, 'edit',          _flush, this);
            this.mon(this, 'validateedit',  _flush, this);
            this.mon(this, 'canceledit',    _flush, this);
        },

        /**
         * Enqueues the passed action in the list of actions that will get executed on the next edit event.
         * @param {Function} lambda
         */
        enqueueEditAction: function (lambda) {
            this._queue.push(lambda);
        }
    });
})();