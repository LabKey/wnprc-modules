import React from 'react';
import {ResearchUltrasounds} from './ResearchUltrasounds';
import {createRoot} from "react-dom/client";

window.addEventListener('DOMContentLoaded', (event) => {
    createRoot(document.getElementById("app")).render(
        <ResearchUltrasounds />
    );
});
