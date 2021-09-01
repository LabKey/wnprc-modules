package org.labkey.webutils.view;

import org.json.JSONArray;
import org.labkey.api.view.JspView;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.webutils.WebUtilsServiceImpl;
import org.labkey.webutils.api.model.JspPageModel;

import java.util.Arrays;
import java.util.List;

/**
 * Created by jon on 1/13/16.
 */
public class JspPage extends JspView<JspPageModel> {
    static private String _packagePathDir = WebUtilsServiceImpl.getPackageDirFromClass(JspPage.class);
    private Integer publicNumberOfRenders =0 ;
    private JSONArray publicUnBindComponents = new JSONArray();

    public JspPage(JspView view) {
        this(view, new JspPageModel());
    }

    //Adding second constructor to allow rendering JSP under a LabKey webPart
    //numberofRenders check if it is not the first time the page renders
    //unBindComponents components in the page to rebind to ko.observables.
    public JspPage(JspView view, Integer numberOfRenders, JSONArray unBindComponents){
        super(_packagePathDir + "JspPage.jsp", new JspPageModel());

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


        if (numberOfRenders == 0){

            // Add some Knockout templates.
            List<String> templates = Arrays.asList(
                    "lk-table",
                    "lk-querytable",
                    "lk-input-textarea"
            );
            for( String name: templates ) {
                this.getModelBean().addTemplate(new JspView<>(_packagePathDir + "knockout_components/" + name + ".jsp"));
            }

            // Set the frame to none, since we don't want WebPartView to add any wrapping HTML, such as a web part.
            this.setFrame(FrameType.NONE);

        }


    }

    public JspPage(JspView view, JspPageModel model) {
        super(_packagePathDir + "JspPage.jsp", model);

        // Set the body to the passed in view
        this.setBody(view);

        // Add universal client dependencies.
        List<String> dependencyPaths = Arrays.asList(
                "/webutils/lib/webutils",
                "/webutils/models/models"
        );
        for(String path : dependencyPaths) {
            this.addClientDependency(ClientDependency.fromPath(path));
        }

        // Add some Knockout templates.
        List<String> templates = Arrays.asList(
                "lk-table",
                "lk-querytable",
                "lk-input-textarea"
        );
        for( String name: templates ) {
            this.getModelBean().addTemplate(new JspView<>(_packagePathDir + "knockout_components/" + name + ".jsp"));
        }

        // Set the frame to none, since we don't want WebPartView to add any wrapping HTML, such as a web part.
        this.setFrame(FrameType.NONE);
    }

    public Integer getNumberOfRenders(){
        return publicNumberOfRenders;

    }
    public JSONArray getUnbindComponents(){
        return publicUnBindComponents;
    }
}
