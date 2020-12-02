package org.labkey.test.tests.wnprc_ehr;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.Locator;
import org.labkey.test.categories.CustomModules;
import org.labkey.test.categories.EHR;
import org.labkey.test.categories.WNPRC_EHR;
import org.labkey.test.pages.list.EditListDefinitionPage;
import org.labkey.test.params.FieldDefinition;
import org.labkey.test.tests.ehr.ComplianceTrainingTest;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.PostgresOnlyTest;
import org.labkey.test.util.SchemaHelper;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

@Category({CustomModules.class, EHR.class, WNPRC_EHR.class})
public class WNPRCComplianceTrainingTest extends ComplianceTrainingTest implements PostgresOnlyTest
{
    @Override
    protected void setUpTest()
    {
        super.setUpTest();
        _containerHelper.enableModule("WNPRC_EHR");

        SchemaHelper schemaHelper = new SchemaHelper(this);
        schemaHelper.createLinkedSchema(getProjectName(), null, "PublicSOPs", "/" + getProjectName(), null, "lists", null, null);

        goToSchemaBrowser();
        selectQuery("PublicSOPs", "SOPs");

        waitForText(10000, "edit metadata");
        clickAndWait(Locator.linkWithText("edit metadata"));
        clickButton("Edit Source", defaultWaitForPage);
        _ext4Helper.clickExt4Tab("XML Metadata");
        setCodeEditorValue("metadataText", "<tables xmlns=\"http://labkey.org/data/xml\">\n" +
                "  <table tableName=\"SOPs\" tableDbType=\"NOT_IN_DB\">\n" +
                "    <columns>\n" +
                "      <column columnName=\"PDF\">\n" +
                "        <dimension>true</dimension>\n" +
                "        <fk>\n" +
                "          <fkDbSchema>lists</fkDbSchema>\n" +
                "          <fkTable>SOPs</fkTable>\n" +
                "          <fkColumnName>Id</fkColumnName>\n" +
                "        </fk>\n" +
                "      </column>\n" +
                "      <column columnName=\"LinkedPDF\" wrappedColumnName=\"Id\">\n" +
                "        <fk>\n" +
                "          <fkDbSchema>lists</fkDbSchema>\n" +
                "          <fkTable>SOPs</fkTable>\n" +
                "          <fkColumnName>Id</fkColumnName>\n" +
                "        </fk>\n" +
                "      </column>\n" +
                "    </columns>\n" +
                "  </table>\n" +
                "</tables>");
        clickButton("Save", 0);
        waitForElement(Locator.id("status").withText("Saved"));
    }

    @Test
    public void testSopSubmission()
    {
        beginAt("/ehr_compliancedb/" + getProjectName() + "/SOP_submission.view");
        reloadPage();

        assertTrue("Submit button not disabled", isElementPresent(Locator.xpath("//button[@id='SOPsubmitButton' and @disabled]")));

        DataRegionTable dr1 = DataRegionTable.findDataRegionWithinWebpart(this, "Unread SOPs (Less Than 10 Months Until Renewal)");
        DataRegionTable dr2 = DataRegionTable.findDataRegionWithinWebpart(this, "Dates SOPs Were Last Read");
        assertEquals("Incorrect row count found", 1, dr1.getDataRowCount());
        assertEquals("Incorrect row count found", 0, dr2.getDataRowCount());

        dr1.checkAllOnPage();
        clickButton("Mark Read");
        reloadPage();


        dr1 = DataRegionTable.findDataRegionWithinWebpart(this, "Unread SOPs (Less Than 10 Months Until Renewal)");
        dr2 = DataRegionTable.findDataRegionWithinWebpart(this, "Dates SOPs Were Last Read");
        assertEquals("Incorrect row count found", 0, dr1.getDataRowCount());
        assertEquals("Incorrect row count found", 1, dr2.getDataRowCount());

        assertFalse("Submit button is still disabled", isElementPresent(Locator.xpath("//button[@id='SOPsubmitButton' and @disabled]")));

        dr2.checkAllOnPage();
        clickButton("Mark Reread");
        reloadPage();

        waitForElement(Locator.xpath("//button[@id='SOPsubmitButton' and not(@disabled)]"));
        click(Locator.id("SOPsubmitButton"));
        assertAlert("You must check the box above the submit button to certify you have read your SOPs");

        checkCheckbox(Locator.id("sopCheck"));
        click(Locator.button("Submit"));
        waitForElement(Ext4Helper.Locators.window("SOPs Complete"));
        click(Ext4Helper.Locators.ext4Button("OK"));
    }

    private void reloadPage()
    {
        waitForText("Mark Read");
        waitForText("Mark Reread");
    }
}
