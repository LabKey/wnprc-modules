(function(){
    var caseNoTypes = {
        Necropsy: {
            prefix: {
                internal: "c",
                external: "e"
            },
            query: "necropsies"
        },
        Biopsy: {
            prefix: {
                internal: "b",
                external: "x"
            },
            query: "biopsies"
        }
    };

    var getcasenoObj = function(type) {
        var valid = false;
        jQuery.each(caseNoTypes, function(typeName, typeObj){
            if (type === typeObj) {
                valid = true;
                return false;
            }
        });
        if ( !valid ) {
            throw "Invalid type passed to getcasenoObj";
        }

        return {
            xtype: 'trigger',
            allowBlank: false,
            editorConfig: {
                triggerCls: 'x4-form-search-trigger',
                onTriggerClick: function () {
                    var theWin = new Ext.Window({
                        layout: 'form',
                        title: 'Case Number',
                        bodyBorder: true,
                        border: true,
                        theField: this,
                        bodyStyle: 'padding:5px',
                        width: 350,
                        defaults: {
                            width: 200,
                            border: false,
                            bodyBorder: false
                        },
                        items: [
                            {
                                xtype: 'radiogroup',
                                ref: 'prefix',
                                fieldLabel: 'Prefix',
                                vertical: false,
                                items: [
                                    {
                                        boxLabel: 'Internal',
                                        name: 'rb',
                                        inputValue: type.prefix.internal,
                                        checked: true
                                    },
                                    {
                                        boxLabel: 'External',
                                        name: 'rb',
                                        inputValue: type.prefix.external
                                    }
                                ]
                            },
                            {
                                xtype: 'numberfield',
                                ref: 'year',
                                fieldLabel: 'Year',
                                allowBlank: false,
                                value: (new Date()).getFullYear()
                            }
                        ],
                        buttons: [
                            {
                                text: 'Submit',
                                disabled: false,
                                ref: '../submit',
                                //scope: this,
                                handler: function (p) {
                                    getCaseNo(p.ownerCt.ownerCt);
                                    this.ownerCt.ownerCt.hide();
                                }
                            },
                            {
                                text: 'Close',
                                handler: function () {
                                    this.ownerCt.ownerCt.hide();
                                }
                            }
                        ]
                    });
                    theWin.show();

                    var getCaseNo = function(panel) {
                        var year = panel.year.getValue();
                        var prefix = panel.prefix.getValue().inputValue;

                        var sourceClause = (function() {
                            var sources = [];

                            jQuery.each(caseNoTypes, function(typeName, typeObj) {
                                var prefix = typeObj.prefix;

                                var whereClauses = [prefix.internal, prefix.external].map(function(prefix) {
                                    return "(caseno LIKE '" + year + prefix + "%')";
                                });

                                sources.push("SELECT caseno FROM study." + typeObj.query + " WHERE (" + whereClauses.join(" OR ") + ")");
                            });

                            return "SELECT caseno FROM (" + sources.join(" UNION ") + ")";
                        })();

                        var sqlQueryString = "SELECT MAX(cast(SUBSTRING(caseno, 6, 8) AS INTEGER)) as caseno ";
                        sqlQueryString += " FROM ( " + sourceClause + " )";

                        if (!year || !prefix) {
                            Ext.Msg.alert('Error', "Must supply both year and prefix");
                            return
                        }

                        LABKEY.Query.executeSql({
                            schemaName: 'study',
                            sql: sqlQueryString,
                            scope: this,
                            success: function (data) {
                                var caseno;
                                if (data.rows && data.rows.length == 1) {
                                    caseno = data.rows[0].caseno;
                                    caseno++;
                                }
                                else {
                                    console.log('no existing cases found');
                                    caseno = 1;
                                }

                                caseno = EHR.Utils.padDigits(caseno, 3);
                                var val = year + prefix + caseno;
                                panel.theField.setValue(val);
                                panel.theField.fireEvent('change', val)
                            },
                            failure: EHR.Utils.onError
                        });
                    };
                }
            }
        }
    };

    EHR.model.DataModelManager.registerMetadata('Necropsy', {
        byQuery: {
            'study.necropsy': {
                caseno: getcasenoObj(caseNoTypes.Necropsy)
            }
        }
    });

    EHR.model.DataModelManager.registerMetadata('Biopsy', {
        byQuery: {
            'Biopsies': {
                caseno: getcasenoObj(caseNoTypes.Biopsy)
            }
        }
    });
})();
