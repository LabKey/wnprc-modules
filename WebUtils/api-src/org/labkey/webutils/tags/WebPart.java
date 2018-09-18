package org.labkey.webutils.tags;

import javax.servlet.jsp.JspException;
import javax.servlet.jsp.JspWriter;
import javax.servlet.jsp.tagext.TagSupport;
import java.io.IOException;

/**
 * Created by jon on 2/23/16.
 */
public class WebPart extends TagSupport {
    private String title = "";

    public void setTitle(String title) {
        if (title != null) {
            this.title = title;
        }
    }

    @Override
    public int doStartTag() throws JspException
    {
        String id = Integer.toHexString(title.hashCode());

        write("<div id=\"ldk-wp-body-" + id + "\" class=\"ldk-wp\" style=\"margin-bottom: 15px\">\n");
        write("   <table id=\"ldk-wp-table-" + id + "\" class=\"labkey-wp\">\n");
        write("      <tbody>\n");
        write("         <tr class=\"labkey-wp-header\">\n");
        write("            <th class=\"labkey-wp-title-left\">" + title + "</th>\n");
        write("            <th class=\"labkey-wp-title-right\">&nbsp;</th>\n");
        write("         </tr>\n");
        write("         <tr>\n");
        write("            <td colspan=2 class=\"labkey-wp-body\">\n");

        return EVAL_BODY_INCLUDE; // Process inner code
    }

    public int doEndTag() throws JspException {
        write("            </td>\n");
        write("         </tr>\n");
        write("      </tbody>\n");
        write("   </table>\n");
        write("</div>\n");

        return EVAL_PAGE; // Continue processing page.
    }

    public void write(String string) throws JspException {
        JspWriter out = pageContext.getOut();

        try {
            out.write(string);
        }
        catch (IOException e) {
            throw new JspException (e);
        }
    }
}