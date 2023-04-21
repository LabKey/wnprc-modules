import React, { useState } from 'react';


function Checkbox({ name,id, className, value, required, onChange }) {
    const handleChange = (event) => {
        const newChecked = event;
        onChange && onChange(newChecked);
    };

    return (
        <label>
            <input
                type="checkbox"
                name={name}
                id={id}
                className={className}
                required={required}
                checked={value}
                onChange={handleChange}
            />
        </label>
    );
}

export default Checkbox;
