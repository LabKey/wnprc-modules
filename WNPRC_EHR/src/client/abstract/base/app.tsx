/*
 * Copyright (c) 2020-2026 Board of Regents of the University of Wisconsin System
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
import * as React from "react";
import { ContextProvider } from "./ContextProvider";
import AbstractContainer from "./AbstractContainer";
import { App } from '@labkey/api';
import { createRoot } from 'react-dom/client';

//export this function to be called in a requiresScript callback
App.registerApp<any>('Abstract', (id, rand) => {
    const container = document.getElementById("abstract-section" + id + rand);
    const root = createRoot(container);
    root.render(
        <ContextProvider>
            <AbstractContainer id={id} />
        </ContextProvider>
    );
});
