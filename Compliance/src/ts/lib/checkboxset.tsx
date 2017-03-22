import * as _ from "underscore";
import * as React from "react";
import ChangeEvent = React.ChangeEvent;

export interface FlagInfo {
    checked:      boolean,
    displayName?: string,
    description?: string
}

export class FlagSet<T extends string> {
    private _flags: {[name: string]: FlagInfo} = {};

    protected _initFlag(name: T, displayName?: string, description?: string) {
        let info: FlagInfo = {
            checked: false
        };

        if (displayName) {
            info.displayName = displayName;
        }

        if (description) {
            info.description = description;
        }

        this._flags[name.toString()] = info;
    }

    getFlagNames(): T[] {
        return _.keys(this._flags) as T[];
    }

    getFlag(name: T): boolean {
        return this.getFlagInfo(name).checked;
    }

    getFlagInfo(name: T): FlagInfo {
        return (name.toString() in this._flags) ? this._flags[name.toString()]: {checked: false};
    }

    setFlag(name: T, val: boolean): void {
        if (name.toString() in this._flags) {
            this._flags[name.toString()] = {checked: val};
        }
        else {
            this._flags[name.toString()].checked = val;
        }
    }
}


export interface CheckBoxProperties<T extends string> {
    flags: FlagSet<T>
}


export class CheckBoxSet<T extends string> extends React.Component<CheckBoxProperties<T>, {}> {
    constructor(props: CheckBoxProperties<T>) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e: ChangeEvent<HTMLInputElement>) {
        let name = e.target.name;
        let val  = !!(e.target.type === 'checkbox' ? e.target.checked : e.target.value);


        this.props.flags.setFlag((name as T), val);
    }

    render() {
        let checkboxes = this.props.flags.getFlagNames().map((name: T) => {
            let info: FlagInfo = this.props.flags.getFlagInfo(name);
            let id = `checkbox-${name}`;

            return (
                <div className="checkbox checkbox-primary col-sm-4" key={name}>
                    <input type="checkbox" id={id} name={name} onChange={this.handleChange}/>

                    <label htmlFor={id}>
                        {(info.displayName) ? info.displayName : name }
                    </label>
                </div>
            );
        });

        return (
            <fieldset>
                <legend>This Protocol Involves:</legend>

                {checkboxes}
            </fieldset>
        );
    }
}