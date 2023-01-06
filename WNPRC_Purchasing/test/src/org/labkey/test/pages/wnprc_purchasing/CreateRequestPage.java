package org.labkey.test.pages.wnprc_purchasing;

import org.labkey.test.Locator;
import org.labkey.test.components.html.Input;
import org.labkey.test.components.html.SelectWrapper;
import org.labkey.test.pages.LabKeyPage;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

import java.io.File;

public class CreateRequestPage extends LabKeyPage<CreateRequestPage.ElementCache>
{
    public CreateRequestPage(WebDriver driver)
    {
        super(driver);
    }

    @Override
    protected void waitForPage()
    {
        Locator.waitForAnyElement(shortWait(), Locator.tagWithClass("div", "panel-title").withText("Request Info"),
                Locator.tagWithClass("div", "panel-title").withText("Requested Items"));
    }

    public String getAccountsToCharge()
    {
        return shortWait().ignoring(NoSuchElementException.class).until(wd ->
                elementCache().accountToCharge.getFirstSelectedOption()).getText();
    }

    public CreateRequestPage setAccountsToCharge(String option)
    {
        Locator.tag("option").withText(option).waitForElement(elementCache().accountToCharge.getWrappedElement(), 5_000);
        elementCache().accountToCharge.selectByVisibleText(option);
        return this;
    }

    public String getVendor()
    {
        return elementCache().vendor.getFirstSelectedOption().getText();
    }

    public CreateRequestPage setVendor(String option)
    {
        elementCache().vendor.selectByVisibleText(option);
        return this;
    }

    public String getBusinessPurpose()
    {
        return elementCache().businessPurpose.getText();
    }

    public CreateRequestPage setBusinessPurpose(String text)
    {
        elementCache().businessPurpose.sendKeys(text);
        return this;
    }

    public String getSpecialInstructions()
    {
        return elementCache().specialInstruction.getText();
    }

    public CreateRequestPage setSpecialInstructions(String text)
    {
        elementCache().specialInstruction.sendKeys(text);
        return this;
    }

    public String getShippingDestination()
    {
        return elementCache().shippingDest.getFirstSelectedOption().getText();
    }

    public CreateRequestPage setShippingDestination(String option)
    {
        elementCache().shippingDest.selectByVisibleText(option);
        return this;
    }

    public String getDeliveryAttentionTo()
    {
        return elementCache().deliveryAttentionTo.getText();
    }

    public CreateRequestPage setDeliveryAttentionTo(String text)
    {
        elementCache().deliveryAttentionTo.sendKeys(text);
        return this;
    }

    public String getItemDesc()
    {
        return elementCache().itemDesc.get();
    }

    public CreateRequestPage setItemDesc(String value)
    {
        elementCache().itemDesc.set(value);
        return this;
    }

    public String getUnitInput()
    {
        return elementCache().unit.getFirstSelectedOption().getText();
    }

    public CreateRequestPage setUnitInput(String option)
    {
        elementCache().unit.selectByVisibleText(option);
        return this;
    }

    public String getUnitCost()
    {
        return elementCache().unitCost.get();
    }

    public CreateRequestPage setUnitCost(String value)
    {
        elementCache().unitCost.set(value);
        return this;
    }

    public String getQuantity()
    {
        return elementCache().quantity.get();
    }

    public CreateRequestPage setQuantity(String value)
    {
        elementCache().quantity.set(value);
        return this;
    }

    public CreateRequestPage submitForReviewExpectingError()
    {
        elementCache().submitForReview.click();
        clearCache();
        return this;
    }

    public CreateRequestPage reorderButton()
    {
        elementCache().reorder.click();
        return this;
    }

    public CreateRequestPage submitForReview()
    {
        clickAndWait(elementCache().submitForReview);
        return this;
    }


    public CreateRequestPage submit()
    {
        clickAndWait(elementCache().submit);
        return this;
    }
    public CreateRequestPage cancel()
    {
        elementCache().cancel.click();
        return this;
    }

    public CreateRequestPage addAttachment(File fileName)
    {
        setFormElement(elementCache().attachment, fileName);
        return this;
    }

    public String getAttachment()
    {
        return elementCache().attachment.getText();
    }

    public String getAlertMessage()
    {
        return elementCache().alertMessage.getText();
    }

    public String getAssignedTo()
    {
        return SelectWrapper.Select(Locator.byClass("assigned-to-input form-control"))
                .findWhenNeeded(getDriver())
                .getFirstSelectedOption()
                .getText();

    }

    public String getProgram()
    {
        return Locator.tagWithId("textarea", "program-input-id").findElement(getDriver()).getText();
    }

    public CreateRequestPage setProgram(String value)
    {
        Locator.tagWithId("textarea", "program-input-id").findElement(getDriver()).sendKeys(value);
        return this;
    }

    public String getStatus()
    {
        return SelectWrapper.Select(Locator.byClass("status-input form-control"))
                .findWhenNeeded(getDriver())
                .getFirstSelectedOption()
                .getText();
    }

    public CreateRequestPage setStatus(String status)
    {
        SelectWrapper.Select(Locator.byClass("status-input form-control"))
                .findWhenNeeded(getDriver()).selectByVisibleText(status);
        return this;
    }

    public CreateRequestPage setRejectReason(String rejectReason)
    {
        elementCache().rejectReason.sendKeys(rejectReason);
        return this;
    }

    public CreateRequestPage setAssignedTo(String value)
    {
        SelectWrapper.Select(Locator.byClass("assigned-to-input form-control"))
                .findWhenNeeded(getDriver()).selectByVisibleText(value);
        return this;
    }

    public String getPurchaseOptions()
    {
        return SelectWrapper.Select(Locator.byClass("payment-option-input form-control"))
                .findWhenNeeded(getDriver())
                .getFirstSelectedOption()
                .getText();
    }

    public CreateRequestPage setPurchaseOptions(String value)
    {
        SelectWrapper.Select(Locator.byClass("payment-option-input form-control"))
                .findWhenNeeded(getDriver()).selectByVisibleText(value);
        return this;
    }

    public String getOrderDate()
    {
        return Locator.id("order-date-id").findElement(getDriver()).getText();
    }

    public CreateRequestPage setOrderDate(String date)
    {
        setFormElement(Locator.id("order-date-id"), date);
        return this;
    }

    public String getCardPostDate()
    {
        return Locator.id("card-post-date-id").findElement(getDriver()).getText();
    }

    public CreateRequestPage setCardPostDate(String date)
    {
        setFormElement(Locator.id("card-post-date-id"), date);
        return this;
    }

    public String getConfirmationNo()
    {
        return Locator.tagWithText("textarea", "confirmation-input-id").findElement(getDriver()).getText();
    }

    public CreateRequestPage setConfirmationNo(String value)
    {
        Locator.tagWithId("textarea", "confirmation-input-id").findElement(getDriver()).sendKeys(value);
        return this;
    }

    public CreateRequestPage setQuantityReceived(String value)
    {
        setFormElement(Locator.id("quantity-received-id"),value);
        return this;
    }

    public String getQuantityReceived()
    {
        return Locator.id("quantity-received-id").findElement(getDriver()).getText();
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
        final Input unitCost = new Input(Locator.id("unit-cost-id").findWhenNeeded(this).withTimeout(200), getDriver());
        final Input quantity = new Input(Locator.id("unit-quantity-id").findWhenNeeded(this).withTimeout(200), getDriver());

        final WebElement attachment = Locator.id("fileUpload").findWhenNeeded(this).withTimeout(200);

        final WebElement submitForReview = Locator.button("Submit for Review").findWhenNeeded(this);
        final WebElement reorder = Locator.button("Reorder").findWhenNeeded(this);
        final WebElement submit = Locator.button("Submit").findWhenNeeded(this);
        final WebElement cancel = Locator.button("Cancel").findWhenNeeded(this);
        final WebElement alertMessage = Locator.byClass("alert alert-danger").findWhenNeeded(this);
        final Select accountToCharge = SelectWrapper.Select(Locator.byClass("account-input form-control "))
                .findWhenNeeded(this);
        final Select vendor = SelectWrapper.Select(Locator.byClass("vendor-input form-control "))
                .findWhenNeeded(this);
        final Select shippingDest = SelectWrapper.Select(Locator.byClass("shipping-dest-input form-control "))
                .findWhenNeeded(this);
        final WebElement rejectReason = Locator.tagWithId("textarea", "reason-for-rejection-id")
                .findWhenNeeded(this);

    }
}


