import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { RoomHome } from './RoomHome';
import { testRoom } from './testData';


// Need to wait for container element to be available in labkey wrapper before render
window.addEventListener('DOMContentLoaded', (event) => {

    createRoot(document.getElementById("app")).render(
        <RoomHome room={testRoom}/>
    );
});