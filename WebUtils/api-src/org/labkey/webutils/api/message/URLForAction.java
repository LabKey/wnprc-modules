package org.labkey.webutils.api.message;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;
import org.labkey.api.action.SpringActionController;
import org.springframework.web.servlet.mvc.Controller;

/**
 * Created by jon on 3/28/17.
 */
@SerializeToTS
public class URLForAction {
    public URLForAction() {

    }

    public URLForAction(Class<? extends Controller> actionClass) {
        this.controller = SpringActionController.getControllerName(actionClass);
        this.actionName = SpringActionController.getActionName(actionClass);
    }

    public String controller;
    public String actionName;
}