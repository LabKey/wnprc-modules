package org.labkey.webutils.view;

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
    public Integer publicNumberOfRenders =0 ;

    public JspPage(JspView view) {
        this(view, new JspPageModel());
    }

    public JspPage(JspView view, Integer numberOfRenders){
        super(_packagePathDir + "JspPage.jsp", new JspPageModel());

        publicNumberOfRenders = numberOfRenders;

        if (numberOfRenders>0){

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

            //verify all dependencies are present
            //List<String> clientDependencies = this.getClientDependencies();
            //this.getModelBean().getTemplates();

        }else{

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
}
