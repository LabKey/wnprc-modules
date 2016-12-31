package org.labkey.wnprc_ehr.email;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.api.view.JspView;
import org.labkey.api.view.WebPartView;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;
import java.io.CharArrayWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.StringTokenizer;

/**
 * Created by jon on 7/13/16.
 */
public class JspEmail<Model> {
    String _path;
    AutomaticCssInliner _inliner = new AutomaticCssInliner();

    public JspEmail (String path) {
        _path = path;
    }

    public class CharArrayWriterResponse extends HttpServletResponseWrapper
    {

        private final CharArrayWriter charArray = new CharArrayWriter();

        public CharArrayWriterResponse(HttpServletResponse response) {
            super(response);
        }

        @Override
        public PrintWriter getWriter() throws IOException
        {
            return new PrintWriter(charArray);
        }

        public String getOutput() {
            return charArray.toString();
        }
    }

    public String renderEmail(Model model) throws Exception {
        //JspView<EmailModel> view = new JspView<>("/org/labkey/wnprc_ehr/emailViews/email.jsp", model);
        JspView<Model> view = new JspView<>(_path, model);

        MockHttpServletRequest req = new MockHttpServletRequest();
        CharArrayWriterResponse response = new CharArrayWriterResponse(new MockHttpServletResponse());

        view.setFrame(WebPartView.FrameType.NONE);
        view.render(req, response);

        String output = _inliner.inlineCSS(response.getOutput());

        return output;
    }

    public class AutomaticCssInliner {
        /**
         * Hecho por Grekz, http://grekz.wordpress.com
         */
        public String inlineCSS(String html) throws IOException {
            final String style = "style";
            // Document doc = Jsoup.connect("http://mypage.com/inlineme.php").get();
            Document doc = Jsoup.parse(html);
            Elements els = doc.select(style);// to get all the style elements
            for (Element e : els) {
                String styleRules = e.getAllElements().get(0).data().replaceAll(
                        "\n", "").trim(), delims = "{}";
                StringTokenizer st = new StringTokenizer(styleRules, delims);
                while (st.countTokens() > 1) {
                    String selector = st.nextToken(), properties = st.nextToken();
                    Elements selectedElements = doc.select(selector);
                    for (Element selElem : selectedElements) {
                        String oldProperties = selElem.attr(style);
                        selElem.attr(style,
                                oldProperties.length() > 0 ? concatenateProperties(
                                        oldProperties, properties) : properties);
                    }
                }
                e.remove();
            }
            //System.out.println(doc);// now we have the result html without the
            // styles tags, and the inline css in each
            // element
            return doc.toString();
        }

        private String concatenateProperties(String oldProp, String newProp) {
            oldProp = oldProp.trim();
            if (!newProp.endsWith(";"))
                newProp += ";";
            return newProp + oldProp; // The existing (old) properties should take precedence.
        }
    }
}
