(function() {
    var defaultInvalidMessage = "Input data is invalid";

    WebUtils.Models.InputData = Classify.newClass({
        constructor: function(config) {
            this.parseFunction = config.parseFunction;

            this.invalidMessage = ko.observable(config.invalidMessage || defaultInvalidMessage);
            this.validMessage   = ko.observable(config.validMessage || 'Input data is valid.');

            this.data = ko.observable();
        },
        computeds: {
            processedData: function() {
                var value = this.data();
                if (!_.isUndefined(value)) {
                    try {
                        var data = this.parseFunction(value);
                    }
                    catch(e) {
                        // Set the error message to the message defined in the ParseError or use the default.
                        this.invalidMessage( (e instanceof WebUtils.Model.ParseError) ? e.message : defaultInvalidMessage );

                        return null;
                    }

                    return data;
                }
                else {
                    return null;
                }
            },
            dataValid: function() {
                var hasValue = !!this.data();
                var noParsingError = (this.processedData() !== null);

                return (hasValue && noParsingError);
            },
            dataInvalid: function() {
                var hasValue = !!this.data();
                var hasParsingError = !(this.processedData() !== null);

                return (hasValue && hasParsingError);
            }
        }
    });
})();