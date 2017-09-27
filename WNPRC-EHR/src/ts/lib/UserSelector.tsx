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
    selectedRecord?: Record;
}

interface Record {
    DisplayName: string;
    FirstName: string;
    LastName: string;
    UserId: number;
}

const schema = "core";

export class UserSelector extends React.Component<UserSelectorProps, UserSelectorState> {
    inputElement: HTMLInputElement;
    initialRecord: Promise<Record>;

    constructor(props: UserSelectorProps) {
        super(props);

        this.state = {
            options: []
        };

        if (props.initialUser) {
            this.initialRecord = executeSql(schema, `SELECT * FROM core.UsersAndGroups WHERE UserId = '${props.initialUser}'`).then((data: any) => {
                return data.rows[0] as Record;
            })
        }


        this.handleSearch = this.handleSearch.bind(this);
        this.renderMenuItemChildren = this.renderMenuItemChildren.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        if (this.initialRecord) {
            this.initialRecord.then((r: Record) => {
                this.setState({
                    selectedRecord: r
                });
            })
        }
    }

    handleSearch(q: string) {
        let sql = `SELECT * FROM core.UsersAndGroups WHERE DisplayName LIKE '%${q}%'`;

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
            this.setState({
                selectedRecord: records[0]
            });
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
                                selected={(this.state.selectedRecord) ? [this.state.selectedRecord] : []}
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