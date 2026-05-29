/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.webutils.tags;

import jakarta.servlet.jsp.JspException;
import jakarta.servlet.jsp.JspWriter;
import jakarta.servlet.jsp.tagext.TagSupport;

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

    @Override
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