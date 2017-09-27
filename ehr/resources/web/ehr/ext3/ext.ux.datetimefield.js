/**
 * @author Andrew Pleshkov
 */
//http://www.sencha.com/forum/showthread.php?98292-DateTime-field-again-and-again-%29&highlight=time+picker
//new Ext.ux.form.DateTimeField({
//    fieldLabel: 'date & time',
//    dateFormat: 'd.m.Y',
//    timeFormat: 'H:i'
//});
Ext.namespace('Ext.ux.form');

(function () {

    var Form = Ext.ux.form;
    Ext.menu.DateMenu.prototype.addClass('extContainer');
    //

    function doSomeAlchemy(picker) {
        Ext.apply(picker, {

            _getDateTime: function (value) {
                if (this.timeField != null) {
                    var timeval = this.timeField.getValue();
                    value = Date.parseDate(value.format(this.dateFormat) + ' ' + timeval, this.format);
                }
                return value;
            },

            _initTimeField: function () {
                if (null == this.timeField) {
                    var config = Ext.apply({}, this.timeFieldConfig, {
                        width: 100
                    });
                    var timeField = this.timeField = Ext.ComponentMgr.create(config, 'timefield');

                    if (timeField instanceof Ext.form.ComboBox) {
                        timeField.getListParent = function () {
                            return this.el.up('.x-menu');
                        }.createDelegate(timeField);

                        if (Ext.isIE7) {
                            timeField.maxHeight = 190;
                        }
                    }
                }
            },

            setValue: function (value) {
                if (null == this.timeField) {
                    this._initTimeField();
                    this.timeField.setValue(value);
                }

                this.value = this._getDateTime(value);
                this.update(this.value, true);
            },

            update: function (date, forceRefresh) {
                var d = date.clone().clearTime();
                Ext.DatePicker.prototype.update.call(this, d, forceRefresh);
            },

            _handleTimeButtonClick: function (e) {
                e.stopEvent();
                var t = this.el.child('table.x-date-inner td.x-date-selected a', true);
                this.handleDateClick(e, t);
            },

            onRender: function () {
                Ext.DatePicker.prototype.onRender.apply(this, arguments);

                var cls = 'ux-form-datetimefield';
                var timeBtnCls = cls + '-timeButton';

                var table = this.el.child('table');

                Ext.DomHelper.insertBefore(table.child('tr:first'), {
                    tag: 'tr',
                    children: [
                        {
                            tag: 'td',
                            colspan: '3',
                            cls: 'x-date-bottom',
                            style: 'border-top: 0',
                            children: [
                                {
                                    tag: 'table',
                                    cellspacing: 0,
                                    cls: 'x-date-picker',
                                    style: 'background: transparent',
                                    children: [
                                        {
                                            tag: 'tbody',
                                            children: [
                                                {
                                                    tag: 'tr',
                                                    children: [
                                                        {
                                                            tag: 'td',
                                                            style: 'padding-right: 5px',
                                                            html: this.timeFieldLabel
                                                        },
                                                        {
                                                            tag: 'td',
                                                            cls: cls
                                                        },
                                                        {
                                                            tag: 'td',
                                                            cls: 'x-date-right',
                                                            style: 'text-align: left; background: transparent; padding-left: 5px',
                                                            html: '<a class="' + timeBtnCls + '" href="#"> </a>'
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }, true);

                var selBtn = table.child('a.' + timeBtnCls);
                selBtn.on('click', this._handleTimeButtonClick, this);

                var ct = table.child('td.' + cls);
                this.timeField.render(ct);
            },

            beforeDestroy: function () {
                if (this.timeField) {
                    Ext.destroy(this.timeField);
                    delete this.timeField;
                }

                Ext.DatePicker.prototype.beforeDestroy.call(this);
            },

            fixIE: function () {
                var el = this.timeField.el;
                el.repaint();
            }

        });
    }

    //

    var DateMenu = Ext.extend(Ext.menu.DateMenu, {

        initComponent: function () {
            DateMenu.superclass.initComponent.call(this);

            if (Ext.isStrict && Ext.isIE7) {
                this.on('show', function () {
                    var h = this.picker.el.getComputedHeight();
                    h += this.el.getFrameWidth('tb');
                    this.setHeight(h);
                }, this, { single: true });
            }

            // Using of Ext.DatePicker as this.picker is hardcoded in Ext.menu.DateMenu,
            // so we need to do some alchemy to provide additional functionality and avoid copypasta
            doSomeAlchemy(this.picker);
        },

        onShow: function () {
            DateMenu.superclass.onShow.apply(this, arguments);

            this.picker.fixIE();
        }

    });

    //

    Form.DateTimeField = Ext.extend(Ext.form.DateField, {

        defaultAutoCreate : {
            tag: "input",
            type: "text",
            size: "20",
            autocomplete: "off"
        },

        timeFieldLabel: 'Time',

        initComponent: function () {
            var tfc = this.timeFieldConfig || {};

            if (this.timeFormat != null && tfc.format != null) {
                throw 'What time format do you prefer?';
            }
            var timeFormat = this.timeFormat || tfc.format || Ext.form.TimeField.prototype.format;
            this.timeFormat = tfc.format = timeFormat;

            this.timeFieldConfig = tfc;

            this.dateFormat = this.dateFormat || Ext.form.DateField.prototype.format;
            this.format = this.dateFormat + ' ' + this.timeFormat;

            Form.DateTimeField.superclass.initComponent.call(this);
        },

        onTriggerClick: function () {
            if (null == this.menu) {
                this.menu = new DateMenu({
                    hideOnClick: false,
                    focusOnSelect: false,
                    //
                    timeFieldLabel: this.timeFieldLabel,
                    timeFieldConfig: this.timeFieldConfig,
                    dateFormat: this.dateFormat,
                    format: this.format
                });
            }

            Form.DateTimeField.superclass.onTriggerClick.call(this);
        }

    });

    Ext.reg('datetimefield', Form.DateTimeField);

})();
