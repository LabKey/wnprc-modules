Ext4.define('WNPRC.ext.data.TaskClientStore', {
    extend: 'EHR.data.DataEntryClientStore',
    alias: 'store.wnprc-taskclientstore',

    /*
     * This adds a field to extraContext if the task is in the "Scheduled" state,
     * to inform the trigger scripts that they can ignore the fact that the date
     * will be marked as in the future.
     *
     * The store collection saves as a whole and merges together all of the extraContents,
     * so this only needs to be used as the client store for the Task section.
     */
    getExtraContext: function() {
        var extraContext = this.callParent(arguments) || {};
        var rec = this.getAt(0);

        if (rec) {
            if (WNPRC.ExtUtils.getQCStateLabel(rec.get("qcstate")) == "Scheduled") {
                extraContext.isScheduledTask = true;
            }
        }

        return extraContext;
    }
});
