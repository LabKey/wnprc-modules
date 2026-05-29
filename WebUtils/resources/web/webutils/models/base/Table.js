/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
WebUtils.Models.Table = Classify.newClass({
    constructor: function(config) {
        var rows = [];
        if (_.isArray(config.rows)) {
            rows = config.rows.map(function(row) {
                if (row instanceof WebUtils.Models.TableRow) {
                    return row;
                }
                else {
                    return new WebUtils.Models.TableRow({data: row});
                }
            })
        }

        this.isLoading = ko.observable(false);
        this.rows = ko.utils.user.forceObservableArray(rows);
        this.rowHeaders = ko.utils.user.forceObservableArray(config.rowHeaders || ['placeholder']);
    },
    methods: {
        setRowHeaders: function(newHeaders) {
            this.rowHeaders.splice(1, this.rowHeaders().length - 1);
            this.rowHeaders.push.apply(newHeaders);
            this.rowHeaders.shift();
        }
    },
    computeds: {
        getSelectedRows: function() {
            return this.rows().filter(function(row){
                return row.isSelected();
            });
        },
        hasRows: function() {
            return this.rows().length > 0;
        }
    }
});