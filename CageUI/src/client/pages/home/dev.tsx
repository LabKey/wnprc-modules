import * as React from 'react';
import { AppContainer } from 'react-hot-loader';
import { createRoot } from 'react-dom/client';
import { RoomHome } from './RoomHome';

const render = () => {
    createRoot(document.getElementById('app')).render(
        <AppContainer>
            <RoomHome/>
        </AppContainer>
    );
};

declare const module: any;

if (module.hot) {
    module.hot.accept();
}

render();