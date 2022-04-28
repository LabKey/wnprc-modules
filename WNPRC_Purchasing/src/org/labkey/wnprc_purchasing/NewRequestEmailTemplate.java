package org.labkey.wnprc_purchasing;

import org.labkey.api.util.emailTemplate.EmailTemplate;

public class NewRequestEmailTemplate  extends EmailTemplate
{
    protected static final String DEFAULT_SUBJECT = "A new purchase request for ^total^ is submitted";
    protected static final String DEFAULT_DESCRIPTION = "WNPRC Purchasing - New request notification";
    protected static final String NAME = "WNPRC Purchasing - New request notification ";
    protected static final String DEFAULT_BODY = "A new purchasing request # ^requestNum^ " +
            "by ^requester^ was submitted on ^created^ for the total of ^total^.\n";

    private WNPRC_PurchasingController.EmailTemplateForm _notificationBean;

    public NewRequestEmailTemplate()
    {
        super(NAME, DEFAULT_DESCRIPTION, DEFAULT_SUBJECT, DEFAULT_BODY, ContentType.Plain, Scope.SiteOrFolder);
    }

    public void setNotificationBean(WNPRC_PurchasingController.EmailTemplateForm notificationBean)
    {
        _notificationBean = notificationBean;
    }

    @Override
    protected void addCustomReplacements(Replacements replacements)
    {
        replacements.add("requestNum", Integer.class, "Request number", ContentType.Plain, c -> _notificationBean == null ? null : _notificationBean.getRowId());
        replacements.add("vendor", String.class, "Vendor name", ContentType.Plain, c -> _notificationBean == null ? null : _notificationBean.getVendor());
        replacements.add("requester", String.class, "Requester name", ContentType.Plain, c -> _notificationBean == null ? null : _notificationBean.getRequesterFriendlyName());
        replacements.add("created", String.class, "Date of request submission", ContentType.Plain, c -> _notificationBean == null ? null : _notificationBean.getRequestDate());
        replacements.add("total", String.class, "Total cost", ContentType.Plain, c -> _notificationBean == null ? null : _notificationBean.getFormattedTotalCost());
    }
}
