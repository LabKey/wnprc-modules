import * as React from "react";
import "../theme/css/index.css";
import { FieldPathValue, FieldValues, useFormContext } from 'react-hook-form';
import { useEffect } from 'react';


interface TextInputProps {
  name: string;
  id: string;
  className: string;
  value: any; //function?
  onChange?: any; //function?
  onBlur?: any;
  onFocus?: any;
  required: boolean;
  autoFocus?: boolean;
  readOnly?: boolean;
  type?: string;
  validation?: any;
  autoFill?: any;
}

// Type casting for the watch variable, must come from a dropdown currently
type watchVarType = {value: any, label: string}

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
      type,
      validation,
      autoFill,
  } = props;
    const {register, formState: {errors}, trigger, watch, resetField, setValue} = useFormContext();
    const [stateName, fieldName] = name.split('.');
    const borderColor = errors?.[stateName]?.[fieldName] ? 'red' : null;
    const watchVar:watchVarType = autoFill ? watch(autoFill.watch as FieldPathValue<FieldValues, any>) as watchVarType : undefined;

    // Trigger validation on load-in once to show required inputs
    useEffect(() => {
        trigger(name);
    }, []);

    /* Watch effect,
    / This will update the text input automatically if given autoFill options, watch variable and search function.
    / Currently this only works if the watch variable is a dropdown input field.
    */
    useEffect(() => {
        //Skip input if it isn't using a dropdown watch listener
        if(watchVar === undefined) {
            return;
        }
        else if(watchVar === null){ // reset text input if dropdown is set to null
            resetField(name);
        }
        else if(autoFill){ // autofill input based on dropdown
            autoFill.search(watchVar.value).then((data) => {
                setValue(name, data);
            });
        }
    }, [watchVar]);

    return (
        <div className={"text-input"}>
            <input {...register(name, {
                required: required ? "This field is required" : false,
                onBlur: onBlur,
                onChange: onChange,
                value: value,
                validate: validation,
            })}
                onFocus={onFocus}
                readOnly={readOnly}
                type={type || "text"}
                id={id}
                autoFocus={autoFocus}
                className={className}
                style={{borderColor: borderColor}}
            />
            <div className={"react-error-text"}>
                {errors?.[stateName]?.[fieldName]?.message}
            </div>
        </div>
    );
};

export default TextInput;
