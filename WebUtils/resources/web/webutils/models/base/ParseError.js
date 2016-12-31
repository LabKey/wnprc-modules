(function() {
    var ParseError = function(message) {
        this.message = message;
        this.name = "ParseError";

        // Get the stack from an equivalent error.
        var err = new Error(message);
        this.stack = err.stack;
    };

    ParseError.prototype = Object.create(Error.prototype);
    ParseError.prototype.constructor = WebUtils.Models.ParseError;

    WebUtils.Models.ParseError = ParseError;
})();