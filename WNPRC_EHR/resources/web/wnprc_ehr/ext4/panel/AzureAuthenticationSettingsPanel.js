Ext4.define('WNPRC.panel.AzureAuthenticationSettingsPanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.wnprc-azureauthenticationsettingspanel',

    initComponent: function () {
        Ext4.QuickTips.init();

        Ext4.apply(this, {
            border: false,
            style: 'padding: 5px;',
            defaults: {
                border: false
            },
            items: [{
                html: 'These settings allow for enabling or disabling the automatic refresh of Azure Active Directory access tokens. You can also change how often they\'re refreshed by the server, and manually refresh them if necessary.',
                style: 'padding-bottom: 20px;'
            }, {
                xtype: 'panel',
                itemId: 'serverSettings',
                defaults: {
                    border: false
                },
                items: [{
                    html: 'Loading...'
                }]
            }]
        });

        this.callParent();

        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL('wnprc_ehr', 'getAzureAuthenticationSettings'),
            method: 'POST',
            success: LABKEY.Utils.getCallbackWrapper(this.onLoad, this),
            failure: LABKEY.Utils.getCallbackWrapper(this.onError, this)
        });

        this.on('render', function (panel) {
            if (!panel.azureAuthenticationSettings) {
                panel.mask('Loading...');
            }
        });
    },

    onLoad: function (results) {
        this.azureAuthenticationSettings = results;

        this.down('#serverSettings').removeAll();

        let items = [];
        if (results.success) {
            let header = {};
            header.html = '<b>Accounts</b>';
            header.style = 'padding-bottom: 10px;';
            items.push(header);
            for (let i = 0; i < results.accounts.length; i++) {
                let accountName = {};
                accountName.html = '<b>' + results.accounts[i].display_name + '</b>';
                accountName.style = 'padding-bottom: 10px;';
                items.push(accountName);
                let instructions = {};
                instructions.html = 'This is where you configure things';
                instructions.style = 'padding-bottom: 10px;';
                items.push(instructions);
                let form = {};
                form.xtype = 'form';
                form.itemId = results.accounts[i].name + '_form';
                form.style = 'padding-bottom: 10px;';
                form.fieldDefaults = {
                    labelWidth: 120,
                    width: 180
                };

                formItems = [{
                    xtype: 'numberfield',
                    hideTrigger: false,
                    keyNavEnabled: true,
                    spinUpEnabled: true,
                    spinDownEnabled: true,
                    allowDecimals: false,
                    fieldLabel: 'Refresh Interval (minutes)',
                    itemId: results.accounts[i].name + '_refresh_interval',
                    name: results.accounts[i].name + '_refresh_interval',
                    value: results.accounts[i].refresh_interval
                }, {
                    xtype: 'checkbox',
                    fieldLabel: 'Enabled',
                    itemId: results.accounts[i].name + '_enabled',
                    name: results.accounts[i].name + '_enabled',
                    checked: !!results.accounts[i].enabled
                }, {
                    xtype: 'button',
                    border: true,
                    text: 'Refresh Access Token',
                    handler: function (btn) {
                        btn.up('wnprc-azureauthenticationsettingspanel').doRefreshToken(results.accounts[i]);
                    }
                }];
                form.items = formItems;

                items.push(form);

                let saveButton = {
                    layout: 'hbox',
                    style: 'margin-top: 10px',
                    defaults: {
                        style: 'margin-right: 5px;margin-bottom: 30px;'
                    },
                    items: [{
                        xtype: 'button',
                        border: true,
                        text: 'Save Settings',
                        handler: function (btn) {
                            btn.up('wnprc-azureauthenticationsettingspanel').doSaveSettings(results.accounts[i]);
                        }
                    }]
                };
                items.push(saveButton);
            }
        }

        this.add({
            style: 'padding-bottom: 20px;',
            defaults: {
                border: false
            },
            items: items
        });

        this.setFieldsFromValues(results);
        this.unmask();
    },

    onError: function (exception, responseObj) {
        console.error(arguments);

        let msg = LABKEY.Utils.getMsgFromError(responseObj, exception, {
            showExceptionClass: false,
            msgPrefix: 'Error: '
        });

        Ext4.Msg.hide();
        Ext4.Msg.alert('Error', msg);
    },

    doRefreshToken: function (account) {
        Ext4.Msg.wait('Refreshing Access Token...');

        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL('wnprc_ehr', 'refreshAzureAccessToken', null, {
                name: account.name
            }),
            method: 'POST',
            success: LABKEY.Utils.getCallbackWrapper(function (response) {
                Ext4.Msg.hide();
                Ext4.Msg.alert('Success', account.display_name + ' access token refresh was successful');
            }, this),
            failure: LABKEY.Utils.getCallbackWrapper(this.onError, this)
        });
    },

    doSaveSettings: function (account) {
        let formValues = this.getForm().getFieldValues();

        let parameters = {};
        for (let prop in formValues) {
            if (formValues.hasOwnProperty(prop)) {
                //all properties should be prefixed with the 'name' of their respective account
                if (prop.startsWith(account.name + '_')) {
                    //get just the db column name part of the prop name (everything after the first '_')
                    parameters[prop.substring(prop.indexOf('_') + 1)] = formValues[prop];
                }
            }
        }
        parameters.name = account.name;

        Ext4.Msg.wait('Saving...');

        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL('wnprc_ehr', 'saveAzureAuthenticationSettings', null, parameters),
            method: 'POST',
            success: LABKEY.Utils.getCallbackWrapper(function (response) {
                Ext4.Msg.hide();
                Ext4.Msg.alert('Success', account.display_name + ' settings saved', function () {
                    window.location.reload();
                });
            }, this),
            failure: LABKEY.Utils.getCallbackWrapper(this.onError, this)
        });
    },

    setFieldsFromValues: function (results) {
        this.azureAuthenticationSettings = results;
        for (let prop in this.azureAuthenticationSettings) {
            let field = this.down('[name=' + prop + ']');
            if (field) {
                if (field.isXType('radiogroup')) {
                    let obj = {};
                    obj[field.name || field.itemId] = this.azureAuthenticationSettings[prop];
                    field.setValue(obj);
                }
                else {
                    field.setValue(this.azureAuthenticationSettings[prop]);
                }
            }
        }
    }
});