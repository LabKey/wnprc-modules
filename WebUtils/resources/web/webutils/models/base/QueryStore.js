/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
WebUtils.Models.QueryStore = Classify.newClass({
    constructor: function(config) {
        var self = this;
        this.schemaName = config.schemaName;
        this.queryName  = config.queryName;
        this.viewName   = config.viewName || "";

        this.columnModel = ko.observableArray([]);
        this.dataRows    = ko.observableArray([]);
        this.displayRows = ko.observableArray([]);

        this.columnsToDisplay = ko.pureComputed(function() {
            return _.filter(self.columnModel(), function(col){
                return !col.hidden;
            });
        });

        this.dataRows.subscribe(function(value) {
            var columnsToDisplay = self.columnsToDisplay();

            self.displayRows(self.dataRows().map(function(row) {
                var data = columnsToDisplay.map(function(colModel) {
                    var text = row[colModel.dataIndex];

                    var urlDataIndex = "_labkeyurl_" + colModel.dataIndex;
                    if (urlDataIndex in row) {
                        text = '<a href="' + row[urlDataIndex] + '">' + text + '</a>';
                    }

                    return text;
                });

                return new TableRow({ data: data });
            }));
        });

        this.init();
    },
    methods: {
        init: function() {
            var self = this;

            var queryConfig = {};
            if ( this.viewName !== '' ) {
                queryConfig.viewName = this.viewName;
            }

            WebUtils.API.selectRows(this.schemaName, this.queryName, queryConfig).then(function(data) {
                self.columnModel(data.columnModel);
                self.dataRows(data.rows);
            });
        }
    },
    computeds: {
        getSelectedRows: function() {
            return this.displayRows().filter(function(row){
                return row.isSelected();
            });
        }
    }
});