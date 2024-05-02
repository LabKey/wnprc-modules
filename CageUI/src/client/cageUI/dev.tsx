import * as React from 'react';
import { AppContainer } from 'react-hot-loader';
import { createRoot } from 'react-dom/client';
import { RoomHome } from './RoomHome';
import { testRoom } from './testData';

const render = () => {
    createRoot(document.getElementById("app")).render(
        <AppContainer>
            <RoomHome room={testRoom}/>
        </AppContainer>
    );
};

declare const module: any;

if (module.hot) {
    module.hot.accept();
}

render();