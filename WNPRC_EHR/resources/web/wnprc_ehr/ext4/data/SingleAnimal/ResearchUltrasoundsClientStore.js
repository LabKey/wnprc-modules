/**
 * This describes a Data Entry client store that looks for slave client stores, checks what they want to subscribe to,
 * and updates those values.
 */

Ext4.define('WNPRC.ext.data.SingleAnimal.ResearchUltrasoundsClientStore', {
    extend: 'WNPRC.ext.data.SingleAnimal.MasterSectionClientStore',

    getExtraContext: function() {
        var self = this;
        var extraContent = this.callParent(arguments) || {};

        return extraContent;
    }
});