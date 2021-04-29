package org.labkey.wnprc_purchasing;

import org.labkey.api.data.Container;
import org.labkey.api.util.emailTemplate.EmailTemplate;
import org.labkey.api.view.ActionURL;

import java.util.ArrayList;
import java.util.List;

public class NewRequestEmailTemplate  extends EmailTemplate
{
    protected static final String DEFAULT_SUBJECT = "Purchase request ^requestNum^ of ^totalCost^ submitted";
    protected static final String DEFAULT_DESCRIPTION = "New request notification";
    protected static final String NAME = "New request notification ";
    protected static final String DEFAULT_BODY = "A new purchasing request ^requestNum^ " +
            "by ^requester^ was submitted on ^created^ for the total of ^total^.\n"+
            "Purpose of this request: ^purpose^ \n"+
            "More info on the request can be found here: ^detailsUrl^\n";

    private final List<ReplacementParam> _replacements = new ArrayList<>();
    private WNPRC_PurchasingController.RequestForm _notificationBean;

    public NewRequestEmailTemplate(WNPRC_PurchasingController.RequestForm notificationBean)
    {
        super(NAME, DEFAULT_SUBJECT, DEFAULT_BODY, DEFAULT_DESCRIPTION);
        setEditableScopes(EmailTemplate.Scope.SiteOrFolder);
        _notificationBean = notificationBean;

        _replacements.add(new ReplacementParam<Integer>("requestNum", Integer.class, "Request number")
        {
            @Override
            public Integer getValue(Container c) {return _notificationBean == null ? null : _notificationBean.getRowId();}
        });

        _replacements.add(new ReplacementParam<String>("vendor", String.class, "Vendor name")
        {
            @Override
            public String getValue(Container c) {return _notificationBean == null ? null : _notificationBean.getVendorName();}
        });

        _replacements.add(new ReplacementParam<String>("requester", String.class, "Requester name")
        {
            @Override
            public String getValue(Container c) {return _notificationBean == null ? null : _notificationBean.getRequester();}
        });

        _replacements.add(new ReplacementParam<String>("created", String.class, "Date of request submission")
        {
            @Override
            public String getValue(Container c) {return _notificationBean == null ? null : _notificationBean.getCreatedOn();}
        });

        _replacements.add(new ReplacementParam<String>("purpose", String.class, "Purpose of the request")
        {
            @Override
            public String getValue(Container c) {return _notificationBean == null ? null : _notificationBean.getPurpose();}
        });

        _replacements.add(new ReplacementParam<String>("total", String.class, "Total cost")
        {
            @Override
            public String getValue(Container c) {return _notificationBean == null ? null : _notificationBean.getFormattedTotalCost();}
        });

        _replacements.add(new ReplacementParam<String>("detailsUrl", String.class, "Link to request grid view")
        {
            @Override
            public String getValue(Container c)
            {
                ActionURL detailsUrl = new ActionURL("query", "executeQuery", c);
                detailsUrl.addParameter("schemaName", "ehr_purchasing");
                detailsUrl.addParameter("query.queryName", "purchasingRequestsOverviewForAdmins");
                detailsUrl.addParameter("query.viewName", "AllOpenRequests");
                detailsUrl.addParameter("query.requestNum~eq", _notificationBean.getRowId());
                return _notificationBean == null ? null : detailsUrl.getURIString();
            }
        });

        _replacements.addAll(super.getValidReplacements());
    }

    @Override
    public List<ReplacementParam> getValidReplacements()
    {
        return _replacements;
    }

}
