Ext4.define('WNPRC.ext.components.ProjectField', (function() {
    return {
        extend: 'EHR.form.field.ProjectEntryField',
        alias: 'widget.wnprc-projectentryfield',

        initComponent: function() {
            // Use a listener to update any "account" field in the current record.
            this.on('change', function(field, newValue, oldValue) {
                if (newValue !== oldValue) {
                    // Get the account number to update the record with.
                    var store = field.getStore();
                    var projectRecord = store.findRecord('project', newValue);

                    if (projectRecord != null) {
                        var account = projectRecord.get('account');

                        // Initialize the record with null
                        var record = null;

                        // Find the grid panel to get the current record
                        var gridPanel = field.up('labkey-gridpanel');
                        if (gridPanel) {
                            var selectedRecords = gridPanel.getSelectionModel().getSelection();
                            if (selectedRecords.length === 1) {
                                record = selectedRecords[0];
                            }
                        }

                        // If we still haven't found the record, chances are that we're in a formpanel, so try to get the record again.
                        if (record === null) {
                            var formPanel = field.up('ehr-formpanel');
                            if (formPanel) {
                                record = formPanel.getRecord();
                            }
                        }

                        // Actually set the account
                        if (record !== null) {
                            try {
                                record.set('account', account);
                            }
                            catch(e) {
                                // Do nothing.  set() throws an error when there is no account field in the record,
                                // so we need to catch that, since we're only updating the account field if it exists.
                            }
                        }
                    }
                }
            });

            this.callParent(arguments);
        },

        getDisallowedProtocols: function() {
            return ['wprc00'];
        },

        makeSql: function() { // (id, date)
            var sql = this.callParent(arguments);

            // This is a hack to fix the project field because EHR assumes that there are lookups on investigatorId,
            // such as last name, which we don't use, so we just replace "investigatorId.lastName" with "investigatorId",
            // which we do have.  We have to check sql's type, since makeSql() can return a null/undefined value.
            return (typeof sql === 'string') ? sql.replace(/investigatorId\.\w+ /g, "investigatorId ") : sql;
        }
    }
})());