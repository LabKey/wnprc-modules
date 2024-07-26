Ext4.define('WNPRC.ext.components.GroupedCheckCombo', {
    extend: 'Ext.ux.CheckCombo',
    alias: 'widget.wnprc-groupedcheckcombo',

    initComponent: function() {
        this.callParent();

        this.listConfig = this.listConfig || {};
        Ext4.apply(this.listConfig, {
            tpl: new Ext4.XTemplate(
                '<ul>',
                    '<tpl for=".">',
                        '<tpl if="values.displayname == values.firstCategoryItem">',
                            '<strong>' + '{[values["category/displayname"]]}' + '</strong>',
                        '</tpl>',
                        '<li role="option" class="' + Ext4.baseCSSPrefix + 'boundlist-item"><span class="' + Ext4.baseCSSPrefix + 'combo-checker"></span>',
                            '&nbsp;{[this.getDisplayText(values, "' + this.displayField + '", "' + (Ext4.isDefined(this.nullCaption) ? this.nullCaption : "[none]") + '")]}',
                        '</li>',
                    '</tpl>',
                '</ul>',
                {
                    getDisplayText : function (values, displayField, nullCaption) {
                        let text;
                        if (typeof values === "string") {
                            text = values;
                        } else {
                            if (Ext4.isDefined(values[displayField]) && values[displayField] != null)
                                text = values[displayField];
                            else
                                text = nullCaption;
                        }
                        return Ext4.util.Format.htmlEncode(text);
                    }
                }
            )
        });
    }
});