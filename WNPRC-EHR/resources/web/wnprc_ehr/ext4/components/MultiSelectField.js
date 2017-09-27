/*
 * This defines a field that appears like a drop down, but it is disabled to prevent typing,
 * and pops up a box to select from the list.  It pins selections to the top of the modal,
 * as well as allowing the user to filter the list of options.
 *
 * By default, it stores the values as a "!" delimited list.
 */
Ext4.define('WNPRC.ext.components.MultiSelectField', {
    extend: 'Ext4.form.field.Trigger',
    alias: 'widget.wnprc-multiselectfield',

    editable: false,
    allowOtherValues: false,

    initComponent: function() {
        var self = this;
        this.callParent();
        this.uuid = LABKEY.Utils.generateUUID();

        // Trigger the store to start loading.
        this.when$storeLoads().then(function(store) {
            // Once the store loads, re-add all of the values, so that the lookup
            // in the popup will resolve the names properly.
            var value = self.getValue();
            self.getVM().checkedOptions([]);
            self.setValue(value);
        });

        var url = LABKEY.ActionURL.getContextPath() + "/wnprc_ehr/ext4/windows/MultiSelectPopup.html";
        jQuery.get(url, function(data) {
            var $nodes = jQuery.parseHTML(data);

            var $bootstrapBox = WNPRC.ExtUtils.getBootstrapBox();

            var $div = $(document.createElement("div"));
            $div.attr('id', self.uuid);

            $div.append($nodes);
            $bootstrapBox.append($div);

            var VM = self.getVM();
            ko.applyBindings(VM, $div.get(0));

            $div.find('.filter-box').keypress(function (e) {
                if (e.which == 13) {
                    if (VM.filteredOptions().length == 1) {
                        VM.checkedOptions.push(VM.filteredOptions()[0]);
                    }
                    else if(self.allowOtherValues) {
                        VM.checkedOptions.push($div.find('.filter-box').val());
                    }
                    return false; // e.preventDefault & e.stopPropagation()
                }
            });
        });
    },

    optionsStoreLookup: {},
    isListening: false,
    optionsStore: undefined,
    getStore: function() {
        var self = this;

        if (!this.optionsStore) {
            var store = LABKEY.ext4.Util.getLookupStore({
                lookup: self.getLookupConfig()
            });

            if (!this.isListening) {
                this.isListening = true;
                store.isLoading() ? store.on('load', self.updateOptionsFromStore, this) : self.updateOptionsFromStore();

                store.on('datachanged', function() {
                    self.updateOptionsFromStore();
                });
            }

            return store;
        }

        return this.optionsStore;
    },

    when$storeLoads: function() {
        var store = this.getStore();

        return new Promise(function(resolve) {
            if (store.isLoading()) {
                store.on('load', function() {
                    resolve(store);
                }, null, {single: true});
            }
            else {
                resolve(store);
            }
        })
    },

    getLookupConfig: function() {
        var config = _.clone(this.originalConfig.lookup);

        config.schemaName = config.schema || config.schemaName;
        config.queryName  = config.query  || config.queryName;

        return config;
    },

    getValue: function() {
        var self = this;
        return this.getVM().checkedOptions().map(function(value) {
            return value;
        }).join(self.getDelimiter())
    },

    setValue: function(value) {
        var self = this;

        // If the value is a string, we're trying to set a raw text value, and we should parse
        // it out.
        if (!_.isArray(value)) {
            value = _.isBlank(value) ? [] : value.split(self.getDelimiter())
        }

        var checkedOptions = self.getVM().checkedOptions();
        // Use isEqual to not recurse if we're getting updated from checkedOptions.
        if (!_.isEqual(value, checkedOptions)) {
            self.getVM().checkedOptions(value)
        }

        var displayText = value.length == 0 ? "" : self.formatValuesForDisplay(value);

        this.callParent([displayText]);
    },

    formatValuesForDisplay: function(records) {
        var self = this;

        if (self.getStore().isLoading()) {
            return "loading...";
        }

        return records.map(function(rec) {
            return self.formatValue(rec);
        }).join(", ");
    },

    formatValue: function(key) {
        var self = this;

        if (key in this.optionsStoreLookup) {
            return this.optionsStoreLookup[key];
        }
        else {
            return "[" + key + "]";
        }
    },

    getDelimiter: function() {
        return !_.isUndefined(this.originalConfig.delimiter) ? this.originalConfig.delimiter : "!";
    },

    onTriggerClick: function() {
        this.getModalSelection().modal('show');
    },

    getModalSelection: function() {
        return $('#' + this.uuid).find('div.modal');
    },

    updateOptionsFromStore: function() {
        var self = this;
        var store = this.getStore();
        var valKey = this.getLookupConfig().keyColumn;
        var displayKey = self.getLookupConfig().displayColumn;

        // Reset the lookup;
        self.optionsStoreLookup = {};

        var options = _.isArray(store.getRange()) ? store.getRange().map(function(rec) {
            self.optionsStoreLookup[rec.get(valKey)] = rec.get(displayKey);
            return rec.get(valKey);
        }) : [];

        this.getVM().options(options);
    },

    getVM: function() {
        var self = this;

        if (!self.VM) {
            var VM = {
                title:           ko.observable(self.fieldLabel),
                options:         ko.observableArray(),
                filteredOptions: ko.observableArray(),
                filter:          ko.observable(),
                checkedOptions:  ko.observableArray(),
                lookup: function(val) {
                    return self.formatValue(val);
                }
            };

            // This function updates the displayed options based on the contents of VM.filter and VM.checkedOptions
            ko.computed(function() {
                var filter = VM.filter();
                var regex = new RegExp(filter);
                var result = [];

                var checkOptionsIndex = {};
                $.each(VM.checkedOptions(), function(i, value) {
                    checkOptionsIndex[value] = true;
                });

                $.each(VM.options(), function(i, val) {
                    if (self.formatValue(val).match(regex) && !checkOptionsIndex[val]) {
                        result.push(val);
                    }
                });

                VM.filteredOptions(result);
            });

            VM.checkedOptions.subscribe(function(val) {
                self.setValue(val);
            });

            self.VM = VM;
        }

        return self.VM;
    }

});

