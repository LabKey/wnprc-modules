package org.labkey.wnprc_purchasing;

import org.labkey.api.data.Container;
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
        replacements.add(new ReplacementParam<>("requestNum", Integer.class, "Request number")
        {
            @Override
            public Integer getValue(Container c)
            {
                return _notificationBean == null ? null : _notificationBean.getRowId();
            }
        });

        replacements.add(new ReplacementParam<>("vendor", String.class, "Vendor name")
        {
            @Override
            public String getValue(Container c)
            {
                return _notificationBean == null ? null : _notificationBean.getVendor();
            }
        });

        replacements.add(new ReplacementParam<>("requester", String.class, "Requester name")
        {
            @Override
            public String getValue(Container c)
            {
                return _notificationBean == null ? null : _notificationBean.getRequesterFriendlyName();
            }
        });

        replacements.add(new ReplacementParam<>("created", String.class, "Date of request submission")
        {
            @Override
            public String getValue(Container c)
            {
                return _notificationBean == null ? null : _notificationBean.getRequestDate();
            }
        });

        replacements.add(new ReplacementParam<>("total", String.class, "Total cost")
        {
            @Override
            public String getValue(Container c)
            {
                return _notificationBean == null ? null : _notificationBean.getFormattedTotalCost();
            }
        });
    }
}
