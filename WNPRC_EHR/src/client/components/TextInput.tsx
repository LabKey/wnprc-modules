import * as React from "react";
import { useState } from "react";
import "../theme/css/index.css";


interface TextInputProps {
  name: string;
  id: string;
  className: string;
  value: any; //function?
  onChange?: any; //function?
  onBlur?: any;
  onFocus?: any;
  required: boolean;
  autoFocus: boolean;
  readOnly?: boolean;
  isValid?: boolean;
  type?: string;
  defaultValue?: any;
}

const TextInput: React.FunctionComponent<TextInputProps> = (props) => {
  const {
    name,
    id,
    className,
    value,
    onChange,
    onBlur,
    onFocus,
    required,
    autoFocus,
    readOnly,
    isValid,
    type,
    defaultValue,
  } = props;
  const borderColor = required && value === ''
      ? 'red'
      : isValid === false
      ? 'red'
      : null;
  return (
    <>
      <input
        type={type || "text"}
        name={name}
        id={id}
        className={className}
        style={{ borderColor: borderColor }}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        required={required}
        autoFocus={autoFocus}
        readOnly={readOnly}
        defaultValue={defaultValue}
      />
      {isValid === false ? (<div className={"required-text"}>Invalid</div>)
          : required && value === '' && ( <div className={"required-text"}>Required</div>
      )}
    </>
  );
};

export default TextInput;
