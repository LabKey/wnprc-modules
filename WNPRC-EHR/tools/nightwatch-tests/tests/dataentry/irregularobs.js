var tests = new XTestSuites.TestSuite();

tests.AddTest("Basic Functionality", function(client, homePage) {
    var that = this;
    var page = client.page.DataEntryIrregularObs().navigate();

    // Pause to give open ajax requests a chance to resolve.
    client.pause(1000);

    // Tag the page.
    this.InjectScript(client, "wnprc_ehr/test-injections/irregular-obs.js");

    var bodyPanel = page.section.bodypanel;
    bodyPanel.waitForElementPresent('.nightwatch-test-dataEntryTable',3000);
    var dataEntryTable = bodyPanel.section.dataEntryTable;

    //bodyPanel.expect.section('dataEntryTable').to.be.present;
    dataEntryTable.expect.element('@header').to.be.present;
    dataEntryTable.assert.containsText("@header", "Irregular Observations");


    var formPanelsToTest = ["Observations Per Animal"];
    _.each(formPanelsToTest, function(element, index, list) {
        var curFormPanel = dataEntryTable.section[element.replace(/\s/g,'')];

        //Confirm that the title is correct
        curFormPanel.assert.containsText('@header', element);

        //Add and remove a blank line
        var curFormPanelButtons = curFormPanel.section.buttons;
        curFormPanelButtons.click('@AddRecord');
        curFormPanelButtons.click('@RemoveBlank');

        //Now, a popup should have come up for confirmation
        page.waitForElementVisible('.x-window', 3000);
        that.InjectScript(client, "wnprc_ehr/test-injections/modal.js");
        page.section.modal.click('@yesButton');
    });

    var formPanelsToTest = ["Observations Per Animal", "Observations Per Cage", "OK Rooms"];
    _.each(formPanelsToTest, function(element, index, list) {
        var curFormPanel = dataEntryTable.section[element.replace(/\s/g,'')];

        //Confirm that the title is correct
        curFormPanel.assert.containsText('@header', element);

        //Confirm that the title of the grid is correct
        var grid = curFormPanel.section.grid;
        grid.expect.element('@header').to.be.present;
        grid.expect.element('@header').text.to.equal('Records');

        //Confirm that we have no rows
        curFormPanel.expect.element('@footer').text.matches(/Section.OK|No.Records/i);

        //Add and remove a blank line
        var curFormPanelButtons = curFormPanel.section.buttons;
        curFormPanelButtons.click('@AddRecord');
        curFormPanelButtons.click('@AddRecord');
        curFormPanelButtons.click('@AddRecord');

        //Tag page
        that.InjectScript(client, "wnprc_ehr/test-injections/irregular-obs.js");

        //Grab metadata
        grid.getAttribute('@metadata', 'innerHTML', function(result) {
            this.assert.equal(typeof result, "object");
            this.assert.equal(result.status, 0);
            var metadata = JSON.parse(result.value);

            this.assert.equal(metadata.numRows, 3, "Checking number of rows in grid.");
        });

        //Confirm that we are in an ERROR state, since all rows are blank
        curFormPanel.assert.containsText('@footer', 'ERROR');

        //Select all Rows
        curFormPanelButtons.click('@SelectAll');

        //Delete all the rows
        curFormPanelButtons.click('@DeleteSelected');

        //Now, a popup should have come up for confirmation
        page.waitForElementVisible('.x-window', 3000);
        that.InjectScript(client, "wnprc_ehr/test-injections/modal.js");
        page.section.modal.click('@yesButton');
    });
});

tests.AddTest("Cage Observations Duplicate", function(client, homePage) {
    var that = this;
    var page = client.page.DataEntryIrregularObs().navigate();

    // Pause to give open ajax requests a chance to resolve.
    client.pause(1000);

    // Tag the page.
    this.InjectScript(client, "wnprc_ehr/test-injections/irregular-obs.js");

    var bodyPanel = page.section.bodypanel;
    bodyPanel.waitForElementPresent('.nightwatch-test-dataEntryTable',3000);
    var dataEntryTable = bodyPanel.section.dataEntryTable;

    dataEntryTable.expect.element('@header').to.be.present;
    dataEntryTable.assert.containsText("@header", "Irregular Observations");

    var cageObsFormPanel = dataEntryTable.section["ObservationsPerCage"];

    // Add a record
    cageObsFormPanel.section.buttons.click('@AddRecord');

    // Refresh tags
    that.InjectScript(client, "wnprc_ehr/test-injections/irregular-obs.js");

    // Fill out the form.
    var form = cageObsFormPanel.section.form;
    form.section.room.setValue('@room-field', "a142");
    form.section.cage.click('@cage-field');
    form.section.cage.setValue('@cage-field','0001');
    form.section.feces.click('@mucus-checkbox');
    form.section.feces.click('@firmstool-checkbox');

    // Click the button
    cageObsFormPanel.section.buttons.click("@DuplicateSelected");

    // Refresh our tags
    this.InjectScript(client, "wnprc_ehr/test-injections/irregular-obs.js");

    // Click the submit button on the modal
    client.click('.nightwatch-test-modal-duplicate-records .nightwatch-test-modal-duplicate-records-button-submit');

    //Refresh our tags again
    this.InjectScript(client, "wnprc_ehr/test-injections/irregular-obs.js");

    //Grab metadata
    cageObsFormPanel.section.grid.getAttribute('@metadata', 'innerHTML', function(result) {
        this.assert.equal(typeof result, "object", "Confirming metadata is an object.");
        this.assert.equal(result.status, 0, "Confirming metadata was successfully retrieved.");
        var metadata = JSON.parse(result.value);

        this.assert.equal(metadata.numRows, 2, "Checking number of rows in grid.");
        this.assert.equal(_.isEqual(metadata.table[0], metadata.table[1]), true, "Make sure both rows are the same.");
    });
});

/*
 *  Issue 4241: Irregular Obs Validation Problems
 *
 *     https://ehr.primate.wisc.edu/issues/WNPRC/WNPRC_Units/Research_Services/EHR_Services/Issue_Tracker/details.view?issueId=4241
 *
 *  This test confirms that Cage Observations is able to validate itself, which it wasn't
 *  able to do because it didn't have a unique StoreId, and so only the OKRooms panel could
 *  register itself for validation.
 */

tests.AddTest("4241 - Cage Observations Validation", function(client, homePage) {
    var that = this;
    var page = client.page.DataEntryIrregularObs().navigate();

    // Pause to give open ajax requests a chance to resolve.
    client.pause(1000);

    // Tag the page.
    this.InjectScript(client, "wnprc_ehr/test-injections/irregular-obs.js");

    var bodyPanel = page.section.bodypanel;
    bodyPanel.waitForElementPresent('.nightwatch-test-dataEntryTable',3000);
    var dataEntryTable = bodyPanel.section.dataEntryTable;

    dataEntryTable.expect.element('@header').to.be.present;
    dataEntryTable.assert.containsText("@header", "Irregular Observations");

    var cageObsFormPanel = dataEntryTable.section["ObservationsPerCage"];

    // Add a record
    cageObsFormPanel.section.buttons.click('@AddRecord');

    // Refresh tags
    that.InjectScript(client, "wnprc_ehr/test-injections/irregular-obs.js");

    // Fill out the form.
    var form = cageObsFormPanel.section.form;
    form.section.room.setValue('@room-field', "a142");
    form.section.cage.click('@cage-field');
    form.section.cage.setValue('@cage-field','0001');
    form.section.feces.click('@mucus-checkbox');
    form.section.feces.click('@firmstool-checkbox');

    //Grab metadata
    cageObsFormPanel.section.grid.getAttribute('@metadata', 'innerHTML', function(result) {
        this.assert.equal(typeof result, "object", "Confirming metadata is an object.");
        this.assert.equal(result.status, 0, "Confirming metadata was successfully retrieved.");
        var metadata = JSON.parse(result.value);

        this.assert.equal(metadata.numRows, 1, "Checking number of rows in grid.");
    });

    //Confirm that we are in an ERROR state, since all rows are blank
    cageObsFormPanel.assert.containsText('@footer', 'Section OK');
});

module.exports = tests;