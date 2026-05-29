/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
var TestSuite = function(config) {};

TestSuite.constructor = TestSuite;

TestSuite.prototype.AddTest = function(name, testFunction) {
    var testSuite = this;
    var wrapperFunction = function(client) {
        var homePage = client.page.Home().login();

        testFunction.call(testSuite, client, homePage);

        client.end();
    };

    this[name] = wrapperFunction;
};

TestSuite.prototype.InjectScript = function(clientObj, script) {
    if (!_.isArray(script)) {
        script = [script];
    }

    _.each(script, function(element, index, list) {
        clientObj.injectScript( BASE_URL + element );
    });

    clientObj.waitForAttribute('#NightwatchTestScriptsLoaded', 'innerHTML', function(text){
        return script.length == text;
    });

    clientObj.injectScript( BASE_URL + "wnprc_ehr/test-injections/clear-counter.js");

};

module.exports = TestSuite;