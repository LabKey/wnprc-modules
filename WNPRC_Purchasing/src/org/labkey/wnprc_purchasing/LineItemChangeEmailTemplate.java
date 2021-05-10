package org.labkey.wnprc_purchasing;

import org.labkey.api.data.Container;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.util.HtmlString;
import org.labkey.api.util.HtmlStringBuilder;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.util.UnexpectedException;
import org.labkey.api.util.emailTemplate.EmailTemplate;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

public class LineItemChangeEmailTemplate extends EmailTemplate
{
    protected static final String DEFAULT_SUBJECT = "Purchase request no. ^requestNum^ has updated line items";
    protected static final String DEFAULT_DESCRIPTION = "Line item update notification";
    protected static final String NAME = "WNPRC Purchasing - Line item update notification";

    private final List<ReplacementParam> _replacements = new ArrayList<>();
    private WNPRC_PurchasingController.EmailTemplateForm _notificationBean;

    private List<WNPRC_PurchasingController.LineItem> _updatedLineItemsList;
    private List<WNPRC_PurchasingController.LineItem> _oldLineItemsList;


    public LineItemChangeEmailTemplate()
    {
        super(NAME, DEFAULT_SUBJECT, loadBody(), DEFAULT_DESCRIPTION, ContentType.HTML);
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
                if (_notificationBean.getRequestStatus().equalsIgnoreCase("order placed"))
                    return "ordered";
                return _notificationBean.getRequestStatus();
            }
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

        _replacements.add(new ReplacementParam<String>("updatedLineItems", String.class, "Modified or newly added or removed line items", ContentType.HTML)
        {
            @Override
            public String getValue(Container c)
            {
                if (getUpdatedLineItemsList() != null)
                {
                    HtmlStringBuilder builder = HtmlStringBuilder.of();

                    builder.append(HtmlString.unsafe("<table>"));
                    for (WNPRC_PurchasingController.LineItem _item : getUpdatedLineItemsList())
                    {
                        builder.append(getHtmlString(_item, builder));
                    }
                    builder.append(HtmlString.unsafe("</table>"));

                    return builder.getHtmlString().toString();
                }
                return null;
            }
        });

        _replacements.add(new ReplacementParam<String>("oldLineItems", String.class, "Previously saved line items", ContentType.HTML)
        {
            @Override
            public String getValue(Container c)
            {
                if (getOldLineItemsList() != null)
                {
                    HtmlStringBuilder builder = HtmlStringBuilder.of();

                    builder.append(HtmlString.unsafe("<table>"));
                    for (WNPRC_PurchasingController.LineItem _item : getOldLineItemsList())
                    {
                        builder.append(getHtmlString(_item, builder));
                    }
                    builder.append(HtmlString.unsafe("</table>"));

                    return builder.getHtmlString().toString();
                }
                return null;
            }
        });

        _replacements.addAll(super.getValidReplacements());
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

    private HtmlString getHtmlString(WNPRC_PurchasingController.LineItem item, HtmlStringBuilder builder)
    {
        builder.append(HtmlString.unsafe("<tr>"));
        builder.append(HtmlString.unsafe("<td>")).append(item.getRowId()).append(HtmlString.unsafe("</td>"));
        builder.append(HtmlString.unsafe("<td>")).append(item.getItem()).append(HtmlString.unsafe("</td>"));
        builder.append(HtmlString.unsafe("<td>")).append(String.valueOf(item.getUnitCost())).append(HtmlString.unsafe("</td>"));
        builder.append(HtmlString.unsafe("<td>")).append(String.valueOf(item.getQuantity())).append(HtmlString.unsafe("</td>"));
        builder.append(HtmlString.unsafe("<td>")).append(String.valueOf(item.getQuantityReceived())).append(HtmlString.unsafe("</td>"));
        builder.append(HtmlString.unsafe("</tr>"));

        return builder.getHtmlString();
    }

    @Override
    public List<ReplacementParam> getValidReplacements()
    {
        return _replacements;
    }

}