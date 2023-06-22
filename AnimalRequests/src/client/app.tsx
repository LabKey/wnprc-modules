import * as React from 'react';
import { createRoot } from 'react-dom/client';
import './theme/css/index.css';
import './theme/css/react-datepicker.css';
import './theme/css/bootstrap.min.css';
import './theme/css/tooltip.css';

import {AnimalRequestForm} from "./containers/Forms/AnimalRequestForm";
window.addEventListener('DOMContentLoaded', (event) => {
    createRoot(
        document.getElementById('app')
    ).render(<AnimalRequestForm />);
});