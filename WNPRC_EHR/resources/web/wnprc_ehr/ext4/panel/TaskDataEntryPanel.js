/*
 *  This allows us to display buttons conditionally, based on the QCState of the record.
 */
Ext4.define('WNPRC.ext.panel.TaskDataEntryPanel', {
    extend: 'EHR.panel.TaskDataEntryPanel',
    alias: 'widget.wnprc-taskdataentrypanel',

    initComponent: function() {
        var self = this;
        this.callSuper(arguments);

        this.ko$QCState = ko.observable("");
        WNPRC.ExtUtils.when$QCStoreLoads().then(function(store) {
            self.updateQCState();
        });

        this.ko$QCState.subscribe(function(val) {
            self.filterButtons();
        });
    },

    isListeningToQCState: false,
    updateQCState: function() {
        var taskStore = this.storeCollection.getServerStoreForQuery("ehr", "Tasks");
        var rec = taskStore.getAt(0);

        if (rec && rec.get("qcstate")) {
            var qcStateCode = rec.get("qcstate");
            var qcStateDisplay = WNPRC.ExtUtils.getQCStateLabel(qcStateCode);
            this.ko$QCState(qcStateDisplay);
        }

        if (!this.isListeningToQCState) {
            this.isListeningToQCState = true;

            taskStore.on("datachanged", this.updateQCState, this);
            taskStore.on("update",      this.updateQCState, this);

            if (taskStore.isLoading()) {
                taskStore.on("load", this.updateQCState, this, {
                    single: true
                });
            }
        }
    },

    shouldHideButton: function(btn) {
        var self = this;
        var qcDisplay = this.ko$QCState();

        if (_.isFunction(btn.shouldHide)) {
            return btn.shouldHide.call(self, btn);
        }

        // If we don't have a value for QCState yet, hide all conditional buttons
        if (qcDisplay == "") {
            if ('onlyShowOnQCState' in btn || 'hideOnQCState' in btn) {
                return true;
            }
            else {
                return false;
            }
        }

        // Force an array
        var showOnQCStates = !Ext4.isDefined(btn.onlyShowOnQCState) ? [] : Ext4.isArray(btn.onlyShowOnQCState) ? btn.onlyShowOnQCState : [btn.onlyShowOnQCState];
        var hideOnQCStates = !Ext4.isDefined(btn.hideOnQCState)     ? [] : Ext4.isArray(btn.hideOnQCState)     ? btn.hideOnQCState     : [btn.hideOnQCState];

        var shouldHide = false;

        // Show buttons based on QCState of Task
        if ((showOnQCStates.length > 0) && (-1 == jQuery.inArray(qcDisplay, showOnQCStates))) {
            shouldHide = true;
        }

        // Hide buttons based on QCState of Task
        if ((hideOnQCStates.length > 0) && (-1 != jQuery.inArray(qcDisplay, hideOnQCStates))) {
            shouldHide = true;
        }

        return shouldHide;
    },

    filterButtons: function() {
        var self = this;

        $('.ehr-dataentrybtn').each(function(i, btnEl) {
            var btn = Ext4.getCmp(btnEl.id);
            if (btn !== undefined) {
                self.shouldHideButton(btn) ? btn.hide() : btn.show();
            }
        });
    },

    getButtons: function() {
        var self = this;
        var buttons = this.callParent(arguments);

        jQuery.each(buttons, function(i, btn) {
            if (self.shouldHideButton(btn)) {
                btn.hidden = true;
            }

            if ((btn.text !== undefined) && btn.text.match(/More Actions/i)) {
                jQuery.each(btn.menu, function(i, btn) {
                    if (self.shouldHideButton(btn)) {
                        btn.hidden = true;
                    }
                })
            }
        });

        return buttons;
    },

    saveRecords: function(btn) {
        var self = this;

        return new Promise(function(resolve, reject) {
            self.storeCollection.on("commitcomplete", function() {
                resolve();
            }, undefined, {single: true} );

            self.storeCollection.on("commitexception", function() {
                reject();
            }, undefined, {single: true} );

            self.onSubmit(btn);
        });
    },

    onSubmit: function(btn, ignoreBeforeSubmit) {
        if (!btn.successURL && _.isUndefined(LABKEY.ActionURL.getParameter('taskid'))) {
            btn.successURL = window.location.toString() + "&taskid=" + this.storeCollection.getTaskId();
        }

        this.callParent(arguments);
    }
});