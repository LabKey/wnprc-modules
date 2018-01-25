WebUtils.utils = WebUtils.utils || {};
WebUtils.utils.Lookup = Classify.newClass({
    constructor: function(config) {
        this.lookupTable = config.seedData || {};

        this.schemaName = config.schemaName;
        this.queryName  = config.queryName;

        this.columns = _.isArray(config.columns) ? config.columns : config.columns.split(",");

        this.keyColumn = config.keyColumn;
        this.valueAccessor = config.valueAccessor;
    },
    methods: {
        lookup: function(valueToLookup) {
            var self = this;
            var key = ko.unwrap(valueToLookup);

            if (key in self.lookupTable) {
                return self.lookupTable[key];
            }
            else {
                var config = {
                    columns: self.columns
                };

                // Set the key filter
                config[self.keyColumn + '~eq'] = key;

                WebUtils.API.selectRows(self.schemaName, self.queryName, config).then(function(data) {
                    if (data.rows.length > 0) {
                        jQuery.each(data.rows, function(i, row) {
                            var value = _.isString(self.valueAccessor) ? row[self.valueAccessor] :
                                      _.isFunction(self.valueAccessor) ? self.valueAccessor(row) :
                                                                         null;

                            self.lookupTable[row[self.keyColumn]] = value;
                        });
                    }
                    else {
                        self.lookupTable[key] = "[" + key + "]";
                    }

                    if (ko.isObservable(valueToLookup)) {
                        valueToLookup.valueHasMutated();
                    }
                });

                return '[loading...]'
            }
        }
    }
});


ko.filters.lookup = function(value, lookup) {
    if (lookup instanceof WebUtils.utils.Lookup) {
        return lookup.lookup(value);
    }
    else {
        return lookup;
    }
};