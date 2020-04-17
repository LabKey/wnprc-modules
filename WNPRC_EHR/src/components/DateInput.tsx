import * as React from "react";

interface DateInputProps {
    opendate: any;
    iconpath: string;
    inputprops: any
}

/**
 * Meant to use as a custom date input for react-datepicker
 */
const DateInput: React.FunctionComponent<any> = props => {
    const { opendate, iconpath, ...inputprops } = props;

    const openDatepicker = () => {
        props.opendate();
    };

    return (
        <>
            <input className="custom-date-input" {...inputprops} />
            <img
                id="date-calendar-img"
                onClick={openDatepicker}
                src={iconpath}
            />
        </>
    );
};

export default DateInput;