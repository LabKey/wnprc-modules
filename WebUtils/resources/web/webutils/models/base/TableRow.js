/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
WebUtils.Models.TableRow = Classify.newClass({
    constructor: function(config) {
        var self = this;
        this.isSelected = ko.observable(false);
        this.rowData    = config.data;
        this.otherData  = config.otherData || {};
        this.isEven     = ko.observable(false);
        this.isHidden   = ko.observable(false);
        this.warn = _.isDefined(config.warn) ? config.warn : false;
        this.err  = _.isDefined(config.err)  ? config.err  : false;
    }
});