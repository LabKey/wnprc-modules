import * as React from "react";
import { useState } from "react";

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
  } = props;

  return (
    <>
      <input
        type="text"
        name={name}
        id={id}
        className={className}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        required={required}
        autoFocus={autoFocus}
      />
    </>
  );
};

export default TextInput;
