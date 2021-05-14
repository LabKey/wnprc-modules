package org.labkey.wnprc_purchasing;

import org.labkey.api.data.Container;
import org.labkey.api.util.emailTemplate.EmailTemplate;

import java.util.ArrayList;
import java.util.List;

public class NewRequestEmailTemplate  extends EmailTemplate
{
    protected static final String DEFAULT_SUBJECT = "A new purchase request for ^total^ is submitted";
    protected static final String DEFAULT_DESCRIPTION = "WNPRC Purchasing - New request notification";
    protected static final String NAME = "WNPRC Purchasing - New request notification ";
    protected static final String DEFAULT_BODY = "A new purchasing request# ^requestNum^ " +
            "by ^requester^ was submitted on ^created^ for the total of ^total^.\n";

    private final List<ReplacementParam> _replacements = new ArrayList<>();
    private WNPRC_PurchasingController.EmailTemplateForm _notificationBean;

    public NewRequestEmailTemplate()
    {
        super(NAME, DEFAULT_SUBJECT, DEFAULT_BODY, DEFAULT_DESCRIPTION);
        setEditableScopes(EmailTemplate.Scope.SiteOrFolder);

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

        _replacements.add(new ReplacementParam<String>("requester", String.class, "Requester name")
        {
            @Override
            public String getValue(Container c) {return _notificationBean == null ? null : _notificationBean.getRequesterFriendlyName();}
        });

        _replacements.add(new ReplacementParam<String>("created", String.class, "Date of request submission")
        {
            @Override
            public String getValue(Container c) {return _notificationBean == null ? null : _notificationBean.getRequestDate();}
        });

        _replacements.add(new ReplacementParam<String>("total", String.class, "Total cost")
        {
            @Override
            public String getValue(Container c) {return _notificationBean == null ? null : _notificationBean.getFormattedTotalCost();}
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
