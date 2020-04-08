// React
import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as $ from 'jquery';
import {TextInput} from '@labkey/components';
import {QueryColumn} from '@labkey/components';


$(() => {
    ReactDom.render(
        <div>
            <p>Test!</p>
        </div>,
        document.getElementById('app')
    );
});