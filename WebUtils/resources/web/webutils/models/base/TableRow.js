WebUtils.Models.TableRow = Classify.newClass({
    constructor: function(config) {
        var self = this;
        this.isSelected = ko.observable(false);
        this.rowData    = config.data;
        this.otherData  = config.otherData || {};
        this.isEven     = ko.observable(false);
        this.isHidden   = ko.observable(false);
        this.warn = _.isDefined(config.warn) ? config.warn : false;
        this.err  = _.isDefined(config.err)  ? config.err  : false;
    }
});