/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
