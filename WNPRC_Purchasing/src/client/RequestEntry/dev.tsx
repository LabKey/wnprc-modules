import React from 'react';
import ReactDOM from 'react-dom';

import { App } from './RequestEntry';

const render = () => {
    ReactDOM.render(<App />, document.getElementById('app'));
};

declare const module: any;

if (module.hot) {
    module.hot.accept();
}

render();
