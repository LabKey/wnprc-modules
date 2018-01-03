// noinspection JSUnresolvedVariable: Ext4 provided by LabKey
(function (Ext) {
    Ext.define('WNPRC.ext4.DetailPanel', {
        alias: 'widget.wnprc-detailpanel',
        extend: 'Ext.form.Panel',
        loadFromStore: function (store) {
            const children = [];
            const fields = store.getFields();
            const record = store.getAt(0);
            fields.each(function (field) {
                // skip any fields that are hidden or otherwise should not show in the view
                // noinspection JSUnresolvedFunction, JSUnresolvedVariable: defined in the LabKey libraries
                if (!LABKEY.ext4.Util.shouldShowInDetailsView(field))
                    return;
                // noinspection JSUnresolvedVariable, JSUnresolvedFunction: extFormatFn defined on the field (sometimes)
                var value = field.extFormatFn ? field.extFormatFn(record.get(field.name)) : record.get(field.name);
                if (record.raw && record.raw[field.name] && record.raw[field.name].url)
                    value = '<a href="' + record.raw[field.name].url + '" target="new">' + value + '</a>';
                // noinspection JSUnresolvedExtXType: Ext.form.field.Display (3.4.0)
                var child = {
                    fieldLabel: field.label || field.caption || field.name,
                    labelWidth: 200,
                    name: field.name,
                    value: value,
                    xtype: 'displayfield'
                };
                // set any 'textarea' inputs to use the 'textareafield' in readonly mode, since that is better
                // at displaying potentially long text than the 'displayfield' type is
                switch (field.inputType) {
                    case 'textarea':
                        // noinspection JSUnresolvedExtXType: Ext.form.field.TextArea (1.1.0)
                        child = Ext.apply(child, {
                            anchor: '100%',
                            labelAlign: 'top',
                            readOnly: true,
                            xtype: 'textareafield'
                        });
                        break;
                    default:
                        // no-op: use the default configuration from above the switch statement
                        break;
                }
                children.push(child);
            }, this);
            // cycle the children of the panel to show the new fields
            this.removeAll();
            this.add(children);
        }
    });
})(Ext4);
