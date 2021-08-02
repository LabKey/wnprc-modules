package org.labkey.wnprc_purchasing;

import org.apache.commons.lang3.StringUtils;
import org.labkey.api.data.Container;
import org.labkey.api.util.emailTemplate.EmailTemplate;

import java.math.BigDecimal;

public class RequestStatusChangeEmailTemplate extends EmailTemplate
{
    protected static final String DEFAULT_SUBJECT = "Purchase request # ^requestNum^ status update";
    protected static final String DEFAULT_DESCRIPTION = "Request status change notification";
    protected static final String NAME = "WNPRC Purchasing - Request status change notification";
    protected static final String DEFAULT_BODY = "Purchase request # ^requestNum^ from vendor ^vendor^" +
            " submitted on ^created^ for the total of ^total^ has been ^status^ by the ^role^.\n" +
            "\n^rejectReason^\n";

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
        replacements.add("requestNum", Integer.class, "Request number", ContentType.Plain, c -> _notificationBean == null ? null : _notificationBean.getRowId());
        replacements.add("vendor", String.class, "Vendor name", ContentType.Plain, c -> _notificationBean == null ? null : _notificationBean.getVendor());
        replacements.add("status", String.class, "Request status", ContentType.Plain, c -> {
            if (_notificationBean == null)
                return null;
            if (_notificationBean.getRequestStatus().equalsIgnoreCase("Request Rejected"))
                return "rejected";
            if (_notificationBean.getRequestStatus().equalsIgnoreCase("Order Placed"))
                return "ordered";
            if (_notificationBean.getRequestStatus().equalsIgnoreCase("Request Approved"))
                return "approved";
            return _notificationBean.getRequestStatus();
        });

        _replacements.add(new ReplacementParam<String>("orderDate", String.class, "Order placed date")
        {
            @Override
            public String getValue(Container c) {return _notificationBean == null ? null : _notificationBean.getOrderDate();}
        });

        _replacements.add(new ReplacementParam<String>("total", String.class, "Total cost")
        {
            @Override
            public String getValue(Container c) {return _notificationBean == null ? null : _notificationBean.getFormattedTotalCost();}
        });

        _replacements.add(new ReplacementParam<String>("role", String.class, "Purchasing dept or purchasing director")
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
                return null;
            }
        });

        _replacements.add(new ReplacementParam<String>("rejectReason", String.class, "Reason for Request Rejection")
        {
            @Override
            public String getValue(Container c)
            {
                if (_notificationBean != null)
                {
                    if (_notificationBean.getRequestStatus().equalsIgnoreCase("Request Rejected"))
                    {
                        return "Reason for rejection:\n" + (StringUtils.isBlank(_notificationBean.getRejectReason()) ? "Reason not provided." : _notificationBean.getRejectReason());
                    }
                }
                return null;
            }
            return _notificationBean == null ? null : _notificationBean.getFormattedTotalCost(); // TODO: This looks wrong -- should probably just return null here
        });
    }
}
