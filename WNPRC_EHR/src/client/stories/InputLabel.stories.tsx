import * as React from 'react';
import  InputLabel from '../components/InputLabel';

export default {
    title: 'InputLabel',
    component: InputLabel,
};

export const ToStorybook = () => {
    return (
        <InputLabel labelFor="test" label="Test"/>
    )
};

