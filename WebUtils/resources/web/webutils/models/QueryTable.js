WebUtils.Models.QueryTable = Classify.newClass({
    parent: WebUtils.Models.Table,
    constructor: function(config) {
        var self = this;
        this.queryName  = config.queryName;
        this.schemaName = config.schemaName;
        this.viewName   = config.viewName || '';

        var queryConfig = {};
        if (this.viewName !== '') {
            queryConfig.viewName = this.viewName;
        }

        var handleData = function(data){
            self.rowHeaders(data.headers);

            var columns = data.columns;

            self.rows(data.rows.map(function(row) {
                return new WebUtils.Models.TableRow({data: columns.map(function(columnName) { return row[columnName]; })});
            }));
        };

        var data;
        try {
            data = WebUtils.API.selectRowsFromCache(this.schemaName, this.queryName, this.viewName);

            handleData({
                headers: data.colMetadata.map(function(colObject){
                    return colObject.shortCaption
                }),
                columns: data.colDisplayData.map(function(columnObject) {
                    return (columnObject.dataIndex).toLowerCase();
                }),
                rows: data.rows
            });
        }
        catch(e) {
            WebUtils.API.selectRows(this.schemaName, this.queryName, queryConfig).then(function(data) {
                handleData({
                    headers: data.columnModel.map(function(columnObject) {
                        return columnObject.header;
                    }),
                    columns: data.columnModel.map(function(columnObject) {
                        return columnObject.dataIndex;
                    }),
                    rows: data.rows
                });
            });
        }
    }
});