/**
 * This describes a Data Entry client store that looks for slave client stores, checks what they want to subscribe to,
 * and updates those values.
 */

Ext4.define('WNPRC.ext.data.SingleAnimal.NecropsyClientStore', {
    extend: 'WNPRC.ext.data.SingleAnimal.MasterSectionClientStore',

    getExtraContext: function() {
        var self = this;
        var extraContent = this.callParent(arguments) || {};

        if (this.getRange().length == 1) {
            var rec = this.getAt(0);
            if (rec.get("is_prenatal_necropsy")) {
                extraContent.allowAnyId = true;
            }

            // If this is a request, allow dates in the distant future.
            if ( WNPRC.ExtUtils.getQCStateLabel(rec.get("QCState")).match(/request/i) ) {
                extraContent.allowRequestsInDistantFuture = true;
            }
        }

        return extraContent;
    }
});