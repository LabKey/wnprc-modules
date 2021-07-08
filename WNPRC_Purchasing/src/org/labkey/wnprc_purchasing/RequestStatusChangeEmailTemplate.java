package org.labkey.wnprc_purchasing;

import org.labkey.api.data.Container;
import org.labkey.api.util.emailTemplate.EmailTemplate;

import java.math.BigDecimal;

public class RequestStatusChangeEmailTemplate extends EmailTemplate
{
    protected static final String DEFAULT_SUBJECT = "Purchase request # ^requestNum^ status update";
    protected static final String DEFAULT_DESCRIPTION = "Request status change notification";
    protected static final String NAME = "WNPRC Purchasing - Request status change notification";
    protected static final String DEFAULT_BODY = "Purchase request # ^requestNum^ from vendor ^vendor^" +
            " submitted on ^created^ for the total of ^total^ has been ^status^ by the ^role^.\n";

    private WNPRC_PurchasingController.EmailTemplateForm _notificationBean;

    public RequestStatusChangeEmailTemplate()
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

        replacements.add(new ReplacementParam<>("status", String.class, "Request status")
        {
            @Override
            public String getValue(Container c)
            {
                if (_notificationBean == null)
                    return null;
                if (_notificationBean.getRequestStatus().equalsIgnoreCase("Request Rejected"))
                    return "rejected";
                if (_notificationBean.getRequestStatus().equalsIgnoreCase("Order Placed"))
                    return "ordered";
                if (_notificationBean.getRequestStatus().equalsIgnoreCase("Request Approved"))
                    return "approved";
                return _notificationBean.getRequestStatus();
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

        replacements.add(new ReplacementParam<>("orderDate", String.class, "Order placed date")
        {
            @Override
            public String getValue(Container c)
            {
                return _notificationBean == null ? null : _notificationBean.getOrderDate();
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

        replacements.add(new ReplacementParam<>("role", String.class, "Purchasing dept or purchasing director")
        {
            @Override
            public String getValue(Container c)
            {
                if (_notificationBean != null)
                {
                    if (_notificationBean.getTotalCost().compareTo(BigDecimal.valueOf(WNPRC_PurchasingController.ADDITIONAL_REVIEW_AMT)) >= 0
                            && (_notificationBean.getRequestStatus().equalsIgnoreCase("Request Approved")
                            || _notificationBean.getRequestStatus().equalsIgnoreCase("Request Rejected")))
                    {
                        return "purchasing director";
                    }
                    return "purchasing department";
                }
                return _notificationBean == null ? null : _notificationBean.getFormattedTotalCost();
            }
        });
    }
}
