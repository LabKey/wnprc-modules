import * as React from "react";
import {executeSql} from "../../../lkpm/modules/Compliance/lkpm/modules/WebUtils/src/ts/WebUtils/API";
import * as s from "underscore.string";
import * as _ from "underscore";

const AsyncTypeahead: new() => React.Component<any, any> = require('react-bootstrap-typeahead').AsyncTypeahead;

export interface UserSelectorProps {
    initialUser?: number;
    onChange?: (val: number) => void;
}

export class UserSelectorState {
    options: Record[];
}

interface Record {
    DisplayName: string;
    FirstName: string;
    LastName: string;
    UserId: number;
}

export class UserSelector extends React.Component<UserSelectorProps, UserSelectorState> {
    inputElement: HTMLInputElement;

    constructor(props: UserSelectorProps) {
        super(props);

        this.state = {
            options: []
        };

        this.handleSearch = this.handleSearch.bind(this);
        this.renderMenuItemChildren = this.renderMenuItemChildren.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleSearch(q: string) {
        let sql = `SELECT * FROM core.PrincipalsWithoutAdmin WHERE DisplayName LIKE '%${q}%'`;
        let schema = "core";

        executeSql(schema, sql).then((data:any) => {
            this.setState({
                options: data.rows as Record[]
            });
        })
    }

    renderMenuItemChildren(record: Record, props: any, index: number) {
        let name = record.DisplayName;

        if (!s.isBlank(record.FirstName) && !s.isBlank(record.LastName)) {
            name = `${name} (${record.FirstName} ${record.LastName})`;
        }

        return (
            <div key={index}>
                <span>{name}</span>
            </div>
        );
    }

    handleChange(records: Record[]) {
        if (this.props.onChange && records.length > 0 && !_.isUndefined(records[0])) {
            this.props.onChange(records[0].UserId);
        }
    }

    render() {
        return (
            <div>
                <AsyncTypeahead onSearch={this.handleSearch}
                                labelKey="DisplayName"
                                placeholder="Placeholder..."
                                options={this.state.options}
                                allowNew={false}
                                multiple={false}
                                renderMenuItemChildren={this.renderMenuItemChildren}
                                onChange={this.handleChange}
                />
            </div>
        );

        /*
        return (
            <div>
                <input type="text" value={this.state.selectedUser} className="form-control" ref={(el) => {this.inputElement = el}}/>
            </div>
        )
        */
    }
}