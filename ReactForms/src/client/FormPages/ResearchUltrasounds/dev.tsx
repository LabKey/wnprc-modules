import * as React from 'react';
import { AppContainer } from 'react-hot-loader';
import {createRoot} from "react-dom/client";


// Main react component
import { ResearchUltrasounds } from './ResearchUltrasounds';

// Import stylesheets
//import '../../wnprc_ehr.scss';


const render = () => {
    createRoot(document.getElementById("app")).render(
        <AppContainer>
            <ResearchUltrasounds />
        </AppContainer>
    );
};

declare const module: any;

if (module.hot) {
    module.hot.accept();
}

render();