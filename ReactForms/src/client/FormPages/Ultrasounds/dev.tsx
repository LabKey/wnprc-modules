import * as React from 'react';
import { AppContainer } from 'react-hot-loader';
import { Ultrasounds } from './Ultrasounds';
import { createRoot } from 'react-dom/client';

const render = () => {
    createRoot(document.getElementById("app")).render(
        <AppContainer>
            <Ultrasounds />
        </AppContainer>
    );
};

declare const module: any;

if (module.hot) {
    module.hot.accept();
}

render();