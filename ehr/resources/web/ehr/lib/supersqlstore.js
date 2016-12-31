define(["classify"], function(Classify) {
    var SuperSQLStore = SuperSQLStore || {};

    SuperSQLStore.ObservableRow = Classify.newClass({
        constructor: function(row) {
            var self = this;
            self._originalData = row;
            self._columns = {};

            // Loop through the properties on the row to make observable versions of each column.
            jQuery.each(_.keys(row), function(index, propertyName) {
                var value = row[propertyName];
                if (value === null) {
                    value = "";
                }

                // Filter out non-primative properties, as well as properties that start with an underscore
                if ((!_.isArray(value) && (_.keys(value)).length === 0) && (!propertyName.toString().match(/^_/))) {
                    //TODO: Eventually, handle the loading of urn link values.
                    if ( !value.toString().match(/^urn:/)) {
                        self[propertyName] = ko.observable(value);
                        self._columns[propertyName] = true;
                    }
                }
            });
        },
        methods: {
            getColumn: function(key) {
                if ( (key in this._columns) && (ko.isObservable(this[key])) ) {
                    return this[key]();
                }
                else {
                    return undefined;
                }
            },
            setColumn: function(key, newVal) {
                if ( (key in this._columns) && (ko.isObservable(this[key])) ) {
                    var oldVal = this[key]();
                    this[key](newVal);
                    return oldVal;
                }
                else {
                    return undefined;
                }
            },
            hasBeenModified: function() {
                //TODO: consider using objects and flags to make this more efficient.
                var self = this;
                var hasBeenModified = false;
                jQuery.each(this._columns, function(key) {
                    if (self._originalData[key] !== self.getColumn(key)) {

                    }
                })
            },
            columnHasBeenModified: function(column) {
                if (self._originalData[column] !== self.getColumn(column)) {
                    return true;
                }
                else {
                    return false;
                }
            }
        },
        computeds: {
            getRawRowData: function() {
                var self = this;
                var rowData = _.clone(this._originalData);

                jQuery.each(this._columns, function(key) {
                    rowData[key] = self.getColumn(key);
                });

                return rowData;
            }
        }
    });


    SuperSQLStore.ObservableTable = Classify.newClass({
        constructor: function(rows, config) {
            var rowsArray = [];
            config = config || {};

            var rowConstructor = SuperSQLStore.ObservableRow;
            if ('rowConstructor' in config) {
                rowConstructor = config.rowConstructor;
            }

            jQuery.each(rows, function (index, value) {
                rowsArray.push(new rowConstructor(value));
            });

            this.rows = ko.observableArray(rowsArray);
        },
        methods: {
            each: function(callback) {
                ko.utils.arrayForEach(this.rows(), function(row) {
                    callback.call(row,row);
                });
            }
        },
        computeds: {
            getRawRows: function() {
                var rows = [];

                ko.utils.arrayForEach(this.rows(), function(row) {
                    rows.push(row.getRawRowData());
                })

                return rows;
            }
        }
    });

    return SuperSQLStore;
});