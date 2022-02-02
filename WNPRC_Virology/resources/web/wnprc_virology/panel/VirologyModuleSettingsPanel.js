Ext4.define('wnprc_virology.panel.VirologyModuleSettingsPanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.wnprc_virology-virologymodulesettingspanel',

    initComponent: function(){
        Ext4.QuickTips.init();

        Ext4.apply(this, {
            border: false,
            style: 'padding: 5px;',
            defaults: {
                border: false
            },
            items: [{
                html: 'Manage settings for the WNPRC Virology module. see readme doc here (todo)',
                style: 'padding-bottom: 20px;'
            },{
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
            url : LABKEY.ActionURL.buildURL('wnprc_virology', 'getVirologyModuleSettings'),
            method : 'GET',
            success: LABKEY.Utils.getCallbackWrapper(this.onLoad, this),
            failure: LABKEY.Utils.getCallbackWrapper(this.onError, this)
        });

        this.on('render', function(panel){
            if (!panel.virologyModuleSettings){
                panel.mask('Loading...');
            }
        });
    },

    onLoad: function(results){
        this.virologyModuleSettings = results;

        this.down('#serverSettings').removeAll();
        this.add({
            style: 'padding-bottom: 20px;',
            defaults: {
                border: false
            },
            items: [{
                html: '<b>Settings</b>',
                style: 'padding-bottom: 10px;'
            },{
                html: '',
                style: 'padding-bottom: 10px;'
            },{
                xtype: 'form',
                itemId: 'connectionForm',
                style: 'padding-bottom: 10px;',
                fieldDefaults: {
                    labelWidth: 160,
                    width: 600
                },
                items: [{
                    xtype: 'textfield',
                    fieldLabel: 'RSEHR QC Status',
                    itemId: 'rsehrQCStatus',
                    name: 'rsehrQCStatus',
                    value: this.virologyModuleSettings.rsehrQCStatus
                },{
                    xtype: 'textfield',
                    fieldLabel: 'Zika Portal QC Status',
                    itemId: 'zikaPortalQCStatus',
                    name: 'zikaPortalQCStatus',
                    value: this.virologyModuleSettings.zikaPortalQCStatus
                },{
                    xtype: 'textfield',
                    fieldLabel: 'Zika Portal URL',
                    itemId: 'zikaPortalURL',
                    name: 'zikaPortalURL',
                    value: this.virologyModuleSettings.zikaPortalURL
                },{
                    xtype: 'textfield',
                    fieldLabel: 'RSEHR Portal URL',
                    itemId: 'rsehrPortalURL',
                    name: 'rsehrPortalURL',
                    value: this.virologyModuleSettings.rsehrPortalURL
                },{
                    xtype: 'textfield',
                    fieldLabel: 'RSEHR Viral Load Location',
                    itemId: 'virologyRSEHRParentFolderPath',
                    name: 'virologyRSEHRParentFolderPath',
                    value: this.virologyModuleSettings.virologyRSEHRParentFolderPath
                },{
                    xtype: 'textfield',
                    fieldLabel: 'EHR VL Sample Tracker Path',
                    itemId: 'virologyEHRVLSampleQueueFolderPath',
                    name: 'virologyEHRVLSampleQueueFolderPath',
                    value: this.virologyModuleSettings.virologyEHRVLSampleQueueFolderPath
                },{
                    xtype: 'textfield',
                    fieldLabel: 'RSEHR Viral Load Job Interval (in minutes)',
                    itemId: 'virologyRSEHRJobInterval',
                    name: 'virologyRSEHRJobInterval',
                    value: this.virologyModuleSettings.virologyRSEHRJobInterval
                },{
                    xtype: 'button',
                    border: true,
                    text: 'Save All Settings On Page',
                    handler: function(btn){
                    btn.up('wnprc_virology-virologymodulesettingspanel').doSaveSettings();
                }}


    ]
            }]
        });

        this.setFieldsFromValues(results);
        this.unmask();
    },

    
    onError: function(exception, responseObj){
        console.error(arguments);

        var msg = LABKEY.Utils.getMsgFromError(responseObj, exception, {
            showExceptionClass: false,
            msgPrefix: 'Error: '
        });

        Ext4.Msg.hide();
        Ext4.Msg.alert('Error', msg);
    },

    

    doSaveSettings: function(){
        var vals = this.getForm().getFieldValues();
        Ext4.Msg.wait('Saving...');

        LABKEY.Ajax.request({
            url : LABKEY.ActionURL.buildURL('wnprc_virology', 'setVirologyModuleSettings'),
            method : 'POST',
            jsonData: vals,
            success: LABKEY.Utils.getCallbackWrapper(this.afterSaveSettings, this),
            failure: LABKEY.Utils.getCallbackWrapper(this.onError, this)
        });
    },

    afterSaveSettings: function(results){
        Ext4.Msg.hide();
        Ext4.Msg.alert('Success', 'Settings saved', function(){
            window.location.reload();
        });
    },

    setFieldsFromValues: function(results){
        this.virologyModuleSettings = results;
        for (var prop in this.virologyModuleSettings){
            var field = this.down('[name=' + prop + ']');
            if (field){
                if (field.isXType('radiogroup')){
                    var obj = {};
                    obj[field.name || field.itemId] = this.virologyModuleSettings[prop];
                    field.setValue(obj);
                }
                else {
                    field.setValue(this.virologyModuleSettings[prop]);
                }
            }
        }
    }
});
