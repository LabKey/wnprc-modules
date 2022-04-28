package org.labkey.webutils.api;

import org.json.JSONArray;
import org.labkey.api.view.JspView;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.webutils.api.model.JspPageModel;

import java.util.Arrays;
import java.util.List;

/**
 * Created by jon on 1/13/16.
 */
public class JspPage extends JspView<JspPageModel>
{
    private final Integer publicNumberOfRenders;
    private final JSONArray publicUnBindComponents;

    public JspPage(JspView<?> view)
    {
        this(view, 0, new JSONArray());
    }

    //Adding second constructor to allow rendering JSP under a LabKey webPart
    //numberofRenders check if it is not the first time the page renders
    //unBindComponents components in the page to rebind to ko.observables.
    public JspPage(JspView<?> view, Integer numberOfRenders, JSONArray unBindComponents)
    {
        super("/org/labkey/webutils/view/JspPage.jsp", new JspPageModel());

        publicNumberOfRenders = numberOfRenders;
        publicUnBindComponents = unBindComponents;

        this.setBody(view);

        // Add universal client dependencies.
        List<String> dependencyPaths = Arrays.asList(
            "/webutils/lib/webutils",
            "/webutils/models/models"
        );
        for(String path : dependencyPaths) {
            this.addClientDependency(ClientDependency.fromPath(path));
        }

        if (numberOfRenders == 0)
        {
            // Add some Knockout templates.
            List<KnockoutTemplate> templates = Arrays.asList(
                KnockoutTemplate.Table,
                KnockoutTemplate.QueryTable,
                KnockoutTemplate.InputTextArea
            );

            for (KnockoutTemplate template : templates)
            {
                getModelBean().addTemplate(template.getJspView());
            }

            // Set the frame to none, since we don't want WebPartView to add any wrapping HTML, such as a web part.
            this.setFrame(FrameType.NONE);
        }
    }

    public Integer getNumberOfRenders()
    {
        return publicNumberOfRenders;
    }

    public JSONArray getUnbindComponents()
    {
        return publicUnBindComponents;
    }
}
