import * as React from 'react';
import { AppContainer } from 'react-hot-loader';
import { createRoot } from 'react-dom/client';
import { UpdateRackStatus } from './UpdateRackStatus';

const render = () => {
    createRoot(document.getElementById('app')).render(
        <AppContainer>
            <UpdateRackStatus/>
        </AppContainer>
    );
};

declare const module: any;

if (module.hot) {
    module.hot.accept();
}

render();