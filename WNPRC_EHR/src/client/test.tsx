// React
import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as $ from 'jquery';


$(() => {
    ReactDom.render(
        <div>
            <p>Test!</p>
        </div>,
        document.getElementById('app')
    );
});
