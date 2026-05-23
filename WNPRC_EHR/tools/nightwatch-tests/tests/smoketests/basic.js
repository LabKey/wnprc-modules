/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
var basicTests = new XTestSuites.TestSuite();

basicTests.AddTest("NavigateToDataEntry", function(client, homePage) {
    homePage.clickLink('dataEntry.view', "Enter Data");
});

basicTests.AddTest("ProtocolImport", function(client, homePage) {
    homePage.clickLink('WNPRC/WNPRC_Units/Animal_Services/Compliance_Training/Private/begin.view', "Compliance Staff Only**")
            .clickLink('WNPRC_EHR/WNPRC/EHR/protocolReplacement.view', "Helper For Reloading Protocols from RARC");

});

basicTests.AddTest("IrregularObservations", function(client, homePage) {
    homePage.clickLink('dataEntry.view', "Enter Data")
            .clickLink('manageTask.view?formtype=Irregular%20Observations', "Enter Irregular Observations");
});

module.exports = basicTests