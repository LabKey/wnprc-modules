import * as React from 'react';
import { AppContainer } from 'react-hot-loader';
import { createRoot } from 'react-dom/client';
import { CageHome } from './CageHome';

const render = () => {
    createRoot(document.getElementById("app")).render(
        <AppContainer>
            <CageHome />
        </AppContainer>
    );
};

declare const module: any;

if (module.hot) {
    module.hot.accept();
}

render();