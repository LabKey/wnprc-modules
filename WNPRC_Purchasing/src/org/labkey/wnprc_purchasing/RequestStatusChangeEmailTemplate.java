package org.labkey.wnprc_purchasing;

import org.labkey.api.data.Container;
import org.labkey.api.util.emailTemplate.EmailTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class RequestStatusChangeEmailTemplate extends EmailTemplate
{
    protected static final String DEFAULT_SUBJECT = "Purchase request # ^requestNum^ status update";
    protected static final String DEFAULT_DESCRIPTION = "Request status change notification";
    protected static final String NAME = "WNPRC Purchasing - Request status change notification";
    protected static final String DEFAULT_BODY = "Purchase request # ^requestNum^ from vendor ^vendor^" +
            " submitted on ^created^ for the total of ^total^ has been ^status^ by the ^role^.\n" +
            "\n^rejectReason^\n";

    private final List<ReplacementParam> _replacements = new ArrayList<>();
    private WNPRC_PurchasingController.EmailTemplateForm _notificationBean;

    public RequestStatusChangeEmailTemplate()
    {
        super(NAME, DEFAULT_SUBJECT, DEFAULT_BODY, DEFAULT_DESCRIPTION);
        setEditableScopes(Scope.SiteOrFolder);

        _replacements.add(new ReplacementParam<Integer>("requestNum", Integer.class, "Request number")
        {
            @Override
            public Integer getValue(Container c) {return _notificationBean == null ? null : _notificationBean.getRowId();}
        });

        _replacements.add(new ReplacementParam<String>("vendor", String.class, "Vendor name")
        {
            @Override
            public String getValue(Container c) {return _notificationBean == null ? null : _notificationBean.getVendor();}
        });

        _replacements.add(new ReplacementParam<String>("status", String.class, "Request status")
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

        _replacements.add(new ReplacementParam<String>("created", String.class, "Date of request submission")
        {
            @Override
            public String getValue(Container c) {return _notificationBean == null ? null : _notificationBean.getRequestDate();}
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
                        return "Reason for rejection:\n" +  _notificationBean.getRejectReason();
                    }
                }
                return null;
            }
        });

        _replacements.addAll(super.getValidReplacements());
    }

    public void setNotificationBean(WNPRC_PurchasingController.EmailTemplateForm notificationBean)
    {
        _notificationBean = notificationBean;
    }

    @Override
    public List<ReplacementParam> getValidReplacements()
    {
        return _replacements;
    }

}
