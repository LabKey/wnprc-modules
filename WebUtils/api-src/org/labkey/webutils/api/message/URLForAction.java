/*
 * Copyright (c) 2017-2026 Board of Regents of the University of Wisconsin System
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