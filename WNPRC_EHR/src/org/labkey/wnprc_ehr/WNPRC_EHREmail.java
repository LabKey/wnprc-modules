package org.labkey.wnprc_ehr;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.labkey.api.view.JspView;
import org.labkey.api.view.WebPartView;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.CharArrayWriter;
import java.io.PrintWriter;
import java.util.StringTokenizer;

/**
 * Created by jon on 12/30/15.
 */
public class WNPRC_EHREmail<Model> {
    String _path;
    AutomaticCssInliner _inliner = new AutomaticCssInliner();

    public WNPRC_EHREmail (String path) {
        _path = path;
    }

    public class CharArrayWriterResponse extends HttpServletResponseWrapper {

        private final CharArrayWriter charArray = new CharArrayWriter();
        private final PrintWriter _printWriter = new PrintWriter(charArray);

        public CharArrayWriterResponse(HttpServletResponse response) {
            super(response);
        }

        @Override
        public PrintWriter getWriter()
        {
            return _printWriter;
        }

        public String getOutput() {
            return charArray.toString();
        }
    }

    public String renderEmail(Model model) throws Exception{
        return this.renderEmail(model, true);
    }

    public String renderEmail(Model model, boolean inlineCss) throws Exception {
        //JspView<EmailModel> view = new JspView<>("/org/labkey/wnprc_ehr/emailViews/email.jsp", model);
        JspView<Model> view = new JspView<>(_path, model);

        MockHttpServletRequest req = new MockHttpServletRequest();
        req.setMethod("GET");
        CharArrayWriterResponse response = new CharArrayWriterResponse(new MockHttpServletResponse());

        view.setFrame(WebPartView.FrameType.NONE);
        view.render(req, response);

        String output = response.getOutput();
        if (inlineCss) {
            output = _inliner.inlineCSS(output);
        }

        return output;
    }

    public class AutomaticCssInliner {
        /**
         * Hecho por Grekz, http://grekz.wordpress.com
         */
        public String inlineCSS(String html)
        {
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
