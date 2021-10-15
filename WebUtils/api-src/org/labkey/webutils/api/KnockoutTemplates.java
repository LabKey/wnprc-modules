package org.labkey.webutils.api;

import org.labkey.api.view.JspView;

public enum KnockoutTemplates
{
    Table()
    {
        @Override
        String getJspPath()
        {
            return "/org/labkey/webutils/view/knockout_components/lk-table.jsp";
        }
    },
    QueryTable()
    {
        @Override
        String getJspPath()
        {
            return "/org/labkey/webutils/view/knockout_components/lk-querytable.jsp";
        }
    },
    InputTextArea()
    {
        @Override
        String getJspPath()
        {
            return "/org/labkey/webutils/view/knockout_components/lk-input-textarea.jsp";
        }
    };

    JspView<?> getJspView()
    {
        return new JspView<>(getJspPath());
    }

    abstract String getJspPath();
}
