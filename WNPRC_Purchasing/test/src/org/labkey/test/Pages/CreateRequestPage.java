package org.labkey.test.pages;

import org.labkey.test.Locator;
import org.labkey.test.components.html.Input;
import org.labkey.test.components.html.SelectWrapper;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

public class CreateRequestPage extends LabKeyPage<CreateRequestPage.ElementCache>
{

    public CreateRequestPage(WebDriver driver)
    {
        super(driver);
    }

    public CreateRequestPage setAccountsToCharge(String option)
    {
        elementCache().accountToCharge.selectByVisibleText(option);
        return this;
    }

    public CreateRequestPage setVendor(String option)
    {
        elementCache().vendor.selectByVisibleText(option);
        return this;
    }

    public CreateRequestPage setBusinessPurpose(String text)
    {
        elementCache().businessPurpose.sendKeys(text);
        return this;
    }

    public CreateRequestPage setSpecialInstructions(String text)
    {
        elementCache().specialInstruction.sendKeys(text);
        return this;
    }

    public CreateRequestPage setShippingDestination(String option)
    {
        elementCache().shippingDest.selectByVisibleText(option);
        return this;
    }

    public CreateRequestPage setDeliveryAttentionTo(String text)
    {
        elementCache().deliveryAttentionTo.sendKeys(text);
        return this;
    }

    public CreateRequestPage setItemDesc(String value)
    {
        elementCache().itemDesc.set(value);
        return this;
    }

    public CreateRequestPage setUnitInput(String option)
    {
        elementCache().unit.selectByVisibleText(option);
        return this;
    }

    public CreateRequestPage setUnitCost(String value)
    {
        elementCache().unitCost.set(value);
        return this;
    }

    public CreateRequestPage setQuantity(String value)
    {
        elementCache().quantity.set(value);
        return this;
    }

    public CreateRequestPage submitForReview()
    {
        elementCache().submitForReview.click();
        return this;
    }

    public CreateRequestPage cancel()
    {
        elementCache().cancel.click();
        return this;
    }

    public String getAlertMessage()
    {
        return Locator.byClass("alert alert-danger").findWhenNeeded(getDriver()).getText();
    }

    @Override
    protected CreateRequestPage.ElementCache newElementCache()
    {
        return new CreateRequestPage.ElementCache();
    }

    protected class ElementCache extends LabKeyPage.ElementCache
    {

        final WebElement businessPurpose = Locator.tagWithId("textarea", "business-purpose-id")
                .findWhenNeeded(this);
        final WebElement specialInstruction = Locator.tagWithId("textarea", "special-instructions-id")
                .findWhenNeeded(this);
        final WebElement deliveryAttentionTo = Locator.tagWithId("textarea", "delivery-attn-id")
                .findWhenNeeded(this);

        final Input itemDesc = new Input(Locator.id("item-description-id").findWhenNeeded(this).withTimeout(200), getDriver());
        final Select unit = SelectWrapper.Select(Locator.byClass("unit-input"))
                .findWhenNeeded(this);
        final Input unitCost = new Input(Locator.id("unit-Cost-id").findWhenNeeded(this).withTimeout(200), getDriver());
        final Input quantity = new Input(Locator.id("unit-quantity-id").findWhenNeeded(this).withTimeout(200), getDriver());


        final WebElement submitForReview = Locator.button("Submit for Review").findWhenNeeded(this);
        final WebElement cancel = Locator.button("Cancel").findWhenNeeded(this);
        final Select accountToCharge = SelectWrapper.Select(Locator.byClass("account-input form-control "))
                .findWhenNeeded(this);
        final Select vendor = SelectWrapper.Select(Locator.byClass("vendor-input form-control "))
                .findWhenNeeded(this);
        final Select shippingDest = SelectWrapper.Select(Locator.byClass("shipping-dest-input form-control "))
                .findWhenNeeded(this);

    }
}


