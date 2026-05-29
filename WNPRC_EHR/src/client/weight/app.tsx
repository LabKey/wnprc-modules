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
// React
import * as React from 'react';

// Components
import EnterWeightFormContainer from "./containers/Forms/EnterWeightFormContainer";
import {ContextProvider} from "./containers/App/ContextProvider";
import { createRoot } from 'react-dom/client';


window.addEventListener('DOMContentLoaded', (event) => {
    const container = document.getElementById('app');
    const root = createRoot(container);
    root.render(
        <ContextProvider>
            <EnterWeightFormContainer />
        </ContextProvider>,
    )
});