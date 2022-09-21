package org.labkey.wnprc_ehr.pages.husbandry;

import org.json.old.JSONArray;
import org.labkey.api.view.BaseWebPartFactory;
import org.labkey.api.view.JspView;
import org.labkey.api.view.Portal;
import org.labkey.api.view.ViewContext;
import org.labkey.api.view.WebPartView;
import org.labkey.webutils.api.JspPage;

import javax.validation.constraints.NotNull;
import java.util.Map;

public class WaterCalendarWebPartFactory extends BaseWebPartFactory{



    private Portal.WebPart _webPart;

    public WaterCalendarWebPartFactory(){super ("Water Calendar");}

    public WebPartView getWebPartView (@NotNull ViewContext portalCtx, @NotNull Portal.WebPart webpart){

        Map<String, String> props = webpart.getPropertyMap();

        String animalIds = webpart.getPropertyMap().get("animalIds");
        Integer numberOfRenders  = Integer.parseInt(webpart.getPropertyMap().get("numberOfRenders"));

        String[] unBindComponents = webpart.getPropertyMap().get("unbindComponents").split(",");
        //String[] unBindComponents = {"waterInfoPanel","calendarLegend","waterExceptionPanel"};
        //JSONArray unBindJSON = new JSONArray(Arrays.asList(unBindComponents));
        JSONArray unBindJSON = new JSONArray();
        for (int i = 0; i < unBindComponents.length; i++){
            unBindJSON.put(unBindComponents[i]);
        }




        JspView view = new JspView("/org/labkey/wnprc_ehr/pages/husbandry/WaterCalendar.jsp");
        view.setTitle("Water Calendar");
        view.setFrame(WebPartView.FrameType.PORTAL);



        JspPage page = new JspPage(view, numberOfRenders,unBindJSON);
        page.setFrame(WebPartView.FrameType.PORTAL);
        return page;
    }
}
