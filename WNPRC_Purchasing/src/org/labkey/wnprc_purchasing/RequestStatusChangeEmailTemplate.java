package org.labkey.wnprc_purchasing;

import org.labkey.api.data.Container;
import org.labkey.api.util.emailTemplate.EmailTemplate;

import java.util.ArrayList;
import java.util.List;

public class RequestStatusChangeEmailTemplate extends EmailTemplate
{
    protected static final String DEFAULT_SUBJECT = "Purchase request no. ^requestNum^ has been updated";
    protected static final String DEFAULT_DESCRIPTION = "Request status change notification";
    protected static final String NAME = "Request status change notification";
    protected static final String DEFAULT_BODY = "Your purchase request ^requestNum^ from vendor ^vendor^" +
            " submitted on ^created^ for the total of ^total^ has been ^status^ by the purchasing department.\n";

    protected static final String DEFAULT_BODY_PLUS_ORDER_PLACED = DEFAULT_BODY + " The order was placed on ^orderDate^.";
    private final List<ReplacementParam> _replacements = new ArrayList<>();
    private WNPRC_PurchasingController.EmailTemplateForm _notificationBean;

    public RequestStatusChangeEmailTemplate(WNPRC_PurchasingController.EmailTemplateForm notificationBean)
    {
        super(NAME, DEFAULT_SUBJECT, (notificationBean.getRequestStatus().equalsIgnoreCase("order placed") ? DEFAULT_BODY_PLUS_ORDER_PLACED : DEFAULT_BODY), DEFAULT_DESCRIPTION);
        setEditableScopes(Scope.SiteOrFolder);
        _notificationBean = notificationBean;

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
                if (_notificationBean.getRequestStatus().equalsIgnoreCase("Request Rejected"))
                    return "rejected";
                if (_notificationBean.getRequestStatus().equalsIgnoreCase("Order Placed"))
                    return "ordered";
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

        _replacements.addAll(super.getValidReplacements());
    }

    @Override
    public List<ReplacementParam> getValidReplacements()
    {
        return _replacements;
    }

}
