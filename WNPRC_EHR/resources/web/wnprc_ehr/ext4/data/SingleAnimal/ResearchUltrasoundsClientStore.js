/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
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