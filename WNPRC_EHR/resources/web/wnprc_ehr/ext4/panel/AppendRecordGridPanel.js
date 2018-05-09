Ext4.define('WNPRC.grid.AppendRecordGridPanel', {
    extend: 'EHR.grid.Panel',
    alias: 'widget.wnprc-appendrecordgridpanel',

    /** @type {Function[]} */
    _queue: [],

    /** @override */
    initComponent: function () {
        this.callParent(arguments);

        const plugin = Ext4.create('WNPRC.plugin.ButtonHotKeyPlugin', {
            buttonId: 'appendRecordBtn',
            keyCode: 187,
            shift: true
        });

        this.plugins = this.plugins || [];
        this.plugins.push(plugin);

        this.mon(this, 'afterrender', plugin.execute, plugin, {single: true, delay: 500});

        this.mon(this, 'beforeedit', this._flush, this);
        this.mon(this, 'edit', this._flush, this);
        this.mon(this, 'validateedit', this._flush, this);
        this.mon(this, 'canceledit', this._flush, this);
    },

    /**
     * Enqueues the passed action in the list of actions that will get executed on the next edit event.
     * @param {Function} lambda
     */
    enqueueEditAction: function (lambda) {
        this._queue.push(lambda);
    },

    /**
     * Executes all the actions currently in the edit action queue, clearing the queue as it goes.
     * @private
     */
    _flush: function () {
        while (this._queue.length) this._queue.shift()();
    }
});