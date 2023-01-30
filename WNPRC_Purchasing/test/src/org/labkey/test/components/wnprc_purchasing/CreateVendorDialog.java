package org.labkey.test.components.wnprc_purchasing;

import org.labkey.test.Locator;
import org.labkey.test.components.bootstrap.ModalDialog;
import org.labkey.test.components.html.Input;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;


public class CreateVendorDialog extends ModalDialog
{
    public CreateVendorDialog(WebDriver driver)
    {
        super(new ModalDialogFinder(driver).withTitle("New vendor")
                .waitFor().getComponentElement(), driver);
    }

    public CreateVendorDialog setVendorName(String name)
    {
        elementCache().vendorName.set(name);
        return this;
    }

    public CreateVendorDialog setStreetAddress(String address)
    {
        elementCache().streetAddress.sendKeys(address);
        return this;
    }

    public CreateVendorDialog setCity(String city)
    {
        elementCache().city.set(city);
        return this;
    }

    public CreateVendorDialog setState(String state)
    {
        elementCache().state.set(state);
        return this;
    }

    public CreateVendorDialog setCountry(String country)
    {
        elementCache().country.set(country);
        return this;
    }

    public CreateVendorDialog setZipCode(String zipCode)
    {
        elementCache().zipCode.set(zipCode);
        return this;
    }

    public CreateVendorDialog setPhone(String phone)
    {
        elementCache().phoneNumber.set(phone);
        return this;
    }

    public CreateVendorDialog setFax(String fax)
    {
        elementCache().faxNumber.set(fax);
        return this;
    }

    public CreateVendorDialog setEmail(String email)
    {
        elementCache().email.set(email);
        return this;
    }

    public CreateVendorDialog setCompanyWebsite(String companyWebsite)
    {
        elementCache().companyWebsite.sendKeys(companyWebsite);
        return this;
    }

    public CreateVendorDialog setNotes(String notes)
    {
        elementCache().notes.sendKeys(notes);
        return this;
    }

    public void save()
    {
        elementCache().save.click();
    }

    public void cancel()
    {
        elementCache().cancel.click();
    }

    @Override
    protected ElementCache newElementCache()
    {
        return new ElementCache();
    }

    @Override
    protected ElementCache elementCache()
    {
        return (ElementCache) super.elementCache();
    }

    protected class ElementCache extends ModalDialog.ElementCache
    {
        final Input vendorName = new Input(Locator.id("vendor-input-vendorName").findWhenNeeded(this).withTimeout(200), getDriver());

        final WebElement streetAddress = Locator.tagWithId("textarea", "vendor-input-streetAddress").findWhenNeeded(this);
        final Input city = new Input(Locator.id("vendor-input-city").findWhenNeeded(this).withTimeout(200), getDriver());
        final Input state = new Input(Locator.id("vendor-input-state").findWhenNeeded(this).withTimeout(200), getDriver());
        final Input country = new Input(Locator.id("vendor-input-country").findWhenNeeded(this).withTimeout(200), getDriver());
        final Input zipCode = new Input(Locator.id("vendor-input-zip").findWhenNeeded(this).withTimeout(200), getDriver());

        final Input phoneNumber = new Input(Locator.id("vendor-input-phoneNumber").findWhenNeeded(this).withTimeout(200), getDriver());
        final Input faxNumber = new Input(Locator.id("vendor-input-faxNumber").findWhenNeeded(this).withTimeout(200), getDriver());
        final Input email = new Input(Locator.id("vendor-input-email").findWhenNeeded(this).withTimeout(200), getDriver());

        final WebElement companyWebsite = Locator.tagWithId("textarea", "vendor-input-url").findWhenNeeded(this);
        final WebElement notes = Locator.tagWithId("textarea", "vendor-input-notes").findWhenNeeded(this);

        final WebElement cancel = Locator.button("Cancel").findWhenNeeded(this);
        final WebElement save = Locator.button("Save").findWhenNeeded(this);
    }

}
