/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
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