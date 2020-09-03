Ext4.define('WNPRC.plugin.ButtonHotKeyPlugin', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.wnprc-buttonhotkeyplugin',

    /**
     * Flag indicating the hotkey should listen for a held-down alt key. Defaults to false.
     *
     * @config
     */
    alt: false,
    /**
     * Item id of the button to "click" when the hotkey is pressed.
     *
     * @config
     */
    buttonId: null,
    /**
     * Flag indicating the hotkey should listen for a held-down ctrl key. Defaults to false.
     *
     * @config
     */
    ctrl: false,
    /**
     * Default action to undertake for the key event. Defaults to stopEvent, which cancels bubbling and prevents
     * the default action.
     *
     * @config
     */
    defaultEventAction: 'stopEvent',
    /**
     * Key code for the hotkey for which to listen.
     *
     * @config
     */
    keyCode: 0,
    /**
     * Plugin id for later lookup
     *
     * @config
     * @override
     */
    pluginId: 'buttonHotKeyPlugin',
    /**
     * Flag indicating the hotkey should listen for a held-down shift key. Defaults to false.
     *
     * @config
     */
    shift: false,

    /**
     * Reference to the KeyMap object itself so we can clean up when the plugin is destroyed.
     *
     * @private
     */
    _keymap: null,

    /**
     * Initializes the plugin by attaching the KeyMap
     *
     * @param cmp
     * @override
     */
    init: function (cmp) {
        this.setCmp(cmp);
        cmp.mon(cmp, 'afterrender', function () {
            this._keymap = Ext4.util.KeyMap.create({
                defaultEventAction: this.defaultEventAction,
                fn: this.execute,
                ignoreInputFields: true,
                key: this.keyCode,
                scope: this,
                shift: this.shift,
                ctrl: this.ctrl,
                alt: this.alt,
                target: cmp.getEl()
            });
        }, this, {single: true});
    },

    /**
     * Executes the plugin by clicking the desired button.
     */
    execute: function () {
        this.getCmp().down(Ext4.String.format('button[itemId={0}]', this.buttonId)).getEl().dom.click();
    },

    /**
     * Cleans up the plugin by destroying the KeyMap instance.
     */
    destroy: function () {
        if (this._keymap) {
            this._keymap.destroy(false);
            this._keymap = null;
        }
    }
});