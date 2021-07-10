package org.labkey.wnprc_purchasing;

import org.labkey.api.module.ModuleLoader;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.util.UnexpectedException;
import org.labkey.api.util.emailTemplate.EmailTemplate;
import org.labkey.api.view.ActionURL;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

public class LineItemChangeEmailTemplate extends EmailTemplate
{
    protected static final String DEFAULT_SUBJECT = "Purchase request # ^requestNum^ has updated line items";
    protected static final String DEFAULT_DESCRIPTION = "Line item update notification";
    protected static final String NAME = "WNPRC Purchasing - Line item update notification";

    private WNPRC_PurchasingController.EmailTemplateForm _notificationBean;

    private List<WNPRC_PurchasingController.LineItem> _updatedLineItemsList;
    private List<WNPRC_PurchasingController.LineItem> _oldLineItemsList;
    private boolean _hasDeletedLineItems = false;
    private boolean _hasFullQuantityReceived = false;

    public LineItemChangeEmailTemplate()
    {
        super(NAME, DEFAULT_DESCRIPTION, DEFAULT_SUBJECT, loadBody(), ContentType.HTML, Scope.SiteOrFolder);
    }

    private static String loadBody()
    {
        try
        {
            try (InputStream is = ModuleLoader.getInstance().getModule("WNPRC_Purchasing").getModuleResource("lineItemsChange.txt").getInputStream())
            {
                return PageFlowUtil.getStreamContentsAsString(is);
            }
        }
        catch (IOException e)
        {
            throw UnexpectedException.wrap(e);
        }
    }

    public void setNotificationBean(WNPRC_PurchasingController.EmailTemplateForm notificationBean)
    {
        _notificationBean = notificationBean;
    }

    public List<WNPRC_PurchasingController.LineItem> getOldLineItemsList()
    {
        return _oldLineItemsList;
    }

    public void setOldLineItemsList(List<WNPRC_PurchasingController.LineItem> oldLineItemsList)
    {
        _oldLineItemsList = oldLineItemsList;
    }

    public List<WNPRC_PurchasingController.LineItem> getUpdatedLineItemsList()
    {
        return _updatedLineItemsList;
    }

    public void setUpdatedLineItemsList(List<WNPRC_PurchasingController.LineItem> updatedLineItemsList)
    {
        _updatedLineItemsList = updatedLineItemsList;
    }

    private String getHtmlString(WNPRC_PurchasingController.LineItem item)
    {
        StringBuilder builder = new StringBuilder();
        builder.append("<tr>");
        builder.append("<td valign=\"top\" style=\"width: 100px\">").append(item.getRowId()).append("</td>");
        builder.append("<td valign=\"top\" style=\"width: 600px\">").append(item.getItem()).append("</td>");
        builder.append("<td valign=\"top\" style=\"width: 200px\">").append(item.getFormattedUnitCost()).append("</td>");
        builder.append("<td valign=\"top\" style=\"width: 100px\">").append(item.getQuantity()).append("</td>");
        builder.append("<td valign=\"top\" style=\"width: 100px\">").append(item.getQuantityReceived()).append("</td>");
        builder.append("</tr>");

        return builder.toString();
    }

    @Override
    protected void addCustomReplacements(Replacements replacements)
    {
        replacements.add("requestNum", Integer.class, "Request number", ContentType.Plain, c -> _notificationBean == null ? null : _notificationBean.getRowId());
        replacements.add("vendor", String.class, "Vendor name", ContentType.Plain, c -> _notificationBean == null ? null : _notificationBean.getVendor());
        replacements.add("status", String.class, "Request status", ContentType.Plain, c -> {
            if (_notificationBean == null)
                return null;
            if (_notificationBean.getRequestStatus().equalsIgnoreCase("order placed"))
                return "ordered";
            return _notificationBean.getRequestStatus();
        });
        replacements.add("created", String.class, "Date of request submission", ContentType.Plain, c -> _notificationBean == null ? null : _notificationBean.getRequestDate());
        replacements.add("total", String.class, "Total cost", ContentType.Plain, c -> _notificationBean == null ? null : _notificationBean.getFormattedTotalCost());
        replacements.add("hasDeletedLineItems", String.class, "For deleted line items", ContentType.Plain, c -> {
            if (_notificationBean != null && _hasDeletedLineItems)
                return "Note: There are deleted line items.";
            return null;
        });
        replacements.add("hasFullQuantityReceived", String.class, "For change in quantity received", ContentType.Plain, c -> {
            if (_notificationBean != null && _hasFullQuantityReceived)
                return "All line items are received.";
            return null;
        });
        replacements.add("requestDataEntryUrl", String.class, "Request entry url", ContentType.HTML, c -> {
            if (_notificationBean != null)
            {
                ActionURL linkUrl = new ActionURL(WNPRC_PurchasingController.PurchasingRequestAction.class, c);
                linkUrl.addParameter("requestRowId", _notificationBean.getRowId());
                linkUrl.addParameter("returnUrl", new ActionURL(WNPRC_PurchasingController.RequesterAction.class, c).getPath());
                return linkUrl.getURIString();
            }
            return null;
        });
        replacements.add("updatedLineItems", String.class, "Modified or newly added or removed line items", ContentType.HTML, c -> {
            if (getUpdatedLineItemsList() != null)
            {
                StringBuilder builder = new StringBuilder();

                for (WNPRC_PurchasingController.LineItem _item : getUpdatedLineItemsList())
                {
                    builder.append(getHtmlString(_item));
                }

                return builder.toString();
            }
            return null;
        });
        replacements.add("oldLineItems", String.class, "Previously saved line items", ContentType.HTML, c -> {
            if (getOldLineItemsList() != null)
            {
                StringBuilder builder = new StringBuilder();

                for (WNPRC_PurchasingController.LineItem _item : getOldLineItemsList())
                {
                    builder.append(getHtmlString(_item));
                }

                return builder.toString();
            }
            return null;
        });
    }

    public void setDeletedLineItemFlag(boolean isDeleted)
    {
        _hasDeletedLineItems = isDeleted;
    }

    public void setFullQuantityReceivedFlag(boolean quantityReceived)
    {
        _hasFullQuantityReceived = quantityReceived;
    }
}