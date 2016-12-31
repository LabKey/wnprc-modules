/*
 * Copyright (c) 2015-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.test.pages.ehr;

import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.WebTestHelper;
import org.labkey.test.components.ext4.RadioButton;
import org.labkey.test.util.Ext4Helper;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.util.Arrays;

import static org.labkey.test.util.Ext4Helper.Locators.ext4Button;


public class AnimalHistoryPage extends ParticipantViewPage
{
    public AnimalHistoryPage(WebDriver driver)
    {
        super(driver);
    }

    public static AnimalHistoryPage beginAt(WebDriverWrapper test)
    {
        return beginAt(test, test.getCurrentContainerPath());
    }

    public static AnimalHistoryPage beginAt(WebDriverWrapper test, String containerPath)
    {
        test.beginAt(WebTestHelper.buildURL("ehr", containerPath, "animalHistory"));
        return new AnimalHistoryPage(test.getDriver());
    }

    @Override
    protected void waitForPage()
    {
        waitForElement(Ext4Helper.Locators.ext4Button("Update Report"));
    }

    public void setSearchText(String text)
    {
        setFormElement(Locator.inputByNameContaining("textfield"), text);
    }

    public void setMultipleSearchText(String text)
    {
        setFormElement(Locator.textAreaByNameContaining("textareafield"), text);
    }

    public void refreshReport()
    {
        doAndWaitForPageSignal(
            () -> waitAndClick(ext4Button("Update Report")),
            REPORT_TAB_SIGNAL, new WebDriverWait(getDriver(), 60));
        clearCache();
    }

    public void searchSingleAnimal(String animalId)
    {
        elements().singleAnimalRadioButton.check();
        setSearchText(animalId);
        refreshReport();
    }

    public void appendMultipleAnimals(String... animalIds)
    {
        elements().multipleAnimalRadioButton.check();
        setMultipleSearchText(String.join(" ", Arrays.asList(animalIds)));
        clickButton("Add", 0);
        for (String animalId : animalIds)
            elements().findRemoveIdButton(animalId);
        refreshReport();
    }

    @Override
    public ElementCache elements()
    {
        return (ElementCache) super.elements();
    }

    @Override
    protected Elements newElements()
    {
        return new ElementCache();
    }

    protected class ElementCache extends AnimalHistoryPage.Elements
    {
        protected RadioButton singleAnimalRadioButton = RadioButton.RadioButton().withLabel("Single Animal").findWhenNeeded(this);
        protected RadioButton multipleAnimalRadioButton = RadioButton.RadioButton().withLabel("Multiple Animals").findWhenNeeded(this);
        protected RadioButton currentLocationRadioButton = RadioButton.RadioButton().withLabel("Current Location").findWhenNeeded(this);
        protected RadioButton entireDatabaseRadioButton = RadioButton.RadioButton().withLabel("Entire Database").findWhenNeeded(this);
        protected WebElement refreshButton = ext4Button("Update Report").findWhenNeeded(this);

        protected WebElement findRemoveIdButton(String animalId)
        {
            return ext4Button(animalId).waitForElement(this, 1000);
        }
    }
}