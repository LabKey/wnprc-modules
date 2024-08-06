import * as React from 'react';
import { AppContainer } from 'react-hot-loader';
import { createRoot } from 'react-dom/client';
import { LayoutEditor } from './LayoutEditor';
import { testRoom } from '../home/testData';

const render = () => {
    createRoot(document.getElementById("app")).render(
        <AppContainer>
            <LayoutEditor room={testRoom}/>
        </AppContainer>
    );
};

declare const module: any;

if (module.hot) {
    module.hot.accept();
}

render();