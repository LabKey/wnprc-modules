import * as api from "WebUtils/API";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as $ from 'jquery';
import * as moment from 'moment';
import {YearSelector} from "../lib/DatePicker";
import {Table} from "../../../lkpm/modules/WebUtils/src/ts/WebUtils/model/Table";
import {FilterableTable} from "../../../lkpm/modules/WebUtils/src/ts/WebUtils/component/lk-table";
import {
    TableRow, ReactTableColumn,
    SimpleStringColumn, SimpleLinkColumn
} from "../../../lkpm/modules/WebUtils/src/ts/WebUtils/model/TableRow";
import * as s from "underscore.string";
import * as _ from "underscore";
import Moment = moment.Moment;
import {
    getLinkToAnimal, buildURLWithParams,
    getCurrentContainer
} from "../../../lkpm/modules/WebUtils/src/ts/WebUtils/LabKey";
import * as rsvp from "rsvp";

let pageLoadData: any = (window as any)['PageLoadData'];

let values = new Table({rows: []});
values.rowHeaders(['Order', 'Date', "Type", "Case Number", "Animal Id", "Status", "View Report"]);

interface PathCase {
    status:   string;
    date:     Moment;
    type:     PathCaseType;
    caseno:   string;
    order:    number | null;
    taskid:   string;
    animalid: string;
}

let getOrder = function(caseno: string): number | null{
    let order: null | number = null;

    if (_.isString(caseno)) {
        let matches = caseno.match(/\d+[a-zA-Z](\d+)/);

        if (_.isArray(matches)) {
            order = parseInt(matches[1]);
        }
    }

    return (_.isNull(order) || _.isNaN(order)) ? null : order;
};

let getCaseURL = function(animalid: string, query: string): string {
    return buildURLWithParams('query', 'executeQuery', getCurrentContainer(), {
        schemaName: 'study',
        'query.queryName': query,
        'query.Id~in': animalid
    });
};

let getTaskURL = function(taskid: string, type: string): string {
    return buildURLWithParams('ehr', 'taskDetails', getCurrentContainer(), {
        formtype: type,
        taskid:   taskid
    });
};

interface URLData {
    controller: string,
    action: string
}

let makeRow = function(pathCase: PathCase): TableRow {
    let linksColumn: ReactTableColumn = {
        getReactElement() {
            if (pathCase.type != "Necropsy") {
                return (<span></span>);
            }

            let necropsyReport = pageLoadData.urlData.necropsyReport as URLData;
            let collectionList = pageLoadData.urlData.collectionList as URLData;

            let reportURL = buildURLWithParams(necropsyReport.controller, necropsyReport.action, getCurrentContainer(), {
                taskid: pathCase.taskid,
                reportMode: "true"
            });

            let collectionListURL = buildURLWithParams(collectionList.controller, collectionList.action, getCurrentContainer(), {
                taskid: pathCase.taskid,
                reportMode: "true"
            });

            return (
                <div>
                    <a href={reportURL}>View Report</a>
                    <br/>
                    <a href={collectionListURL}>View Collection List</a>
                </div>
            );
        },

        getValue(): string {
            return "";
        }
    };

    let type = pathCase.type;
    let typeColumn: ReactTableColumn = {
        getReactElement(): JSX.Element {
            if (s.isBlank(pathCase.taskid)) {
                let query = (type == 'Necropsy') ? "Necropsies" : "Biopsies";
                return (
                    <div>
                        <a href={getCaseURL(pathCase.animalid, query)}>{type}</a>
                        <p style={{color: 'red'}}>! No Task Assigned to Record</p>
                    </div>
                );
            }
            else {
                return (
                    <div>
                        <a href={getTaskURL(pathCase.taskid, type)}>{type}</a>
                    </div>
                )
            }
        },

        getValue(): string {
            return pathCase.type;
        }
    };

    let displayOrder: string = (pathCase.order == null) ? '' : pathCase.order.toString();

    return new TableRow({
        columns: [
            {
                getHTML: (): string => {
                    return displayOrder
                },
                getValue: (): string => {
                    return s.lpad(displayOrder, 10, '0');
                }
            },
            new SimpleStringColumn(pathCase.date.format('YYYY/MM/DD HH:mm')),
            typeColumn,
            new SimpleStringColumn(pathCase.caseno),
            new SimpleLinkColumn(pathCase.animalid, getLinkToAnimal(pathCase.animalid)),
            new SimpleStringColumn(pathCase.status),
            linksColumn
        ],
        otherData: pathCase
    })
};

type PathCaseType = "Biopsy" | "Necropsy";

let parsePathCase = function(object: any, type: PathCaseType): PathCase {
    return {
        status:   object['QCState/label'] || object['QCState/label'.toLowerCase().replace(/\//, "_fs_")],
        date:     api.parseDateFromDB(object['date']),
        type:     type,
        caseno:   object['caseno'],
        order:    getOrder(object['caseno']),
        taskid:   _.isString(object['taskid']) ? object['taskid'] : '',
        animalid: object['Id'] || object['id']
    }
};

let selectedYear = ko.observable(moment().startOf('year')); // Today
(window as any).SelectedYear = selectedYear;

let errors = ko.computed(() => {
    let caseIndex: {[num: number]: PathCase[]} = {};
    let maxIndex = 1;

    /*
     * First, build an index that we can use to check the indices
     */
    values.rows().forEach((row) => {
        let pathCase = (row.otherData as PathCase);
        let order = pathCase.order;

        if (order != null) {
            if (order in caseIndex) {
                caseIndex[order].push(pathCase)
            }
            else {
                caseIndex[order] = [pathCase];
            }

            maxIndex = (order > maxIndex) ? order : maxIndex;
        }
    });

    let errorList: string[] = [];

    for (let i = 1; i <= maxIndex; i++) {
        if (i in caseIndex) {
            let entries = caseIndex[i];
            let entryTypes = entries.map(function(entry) {
                return entry.type;
            });

            // Get a moment for 2016
            let y2016 = moment().year(2016).startOf('year');


            if (entries.length > 1) {
                if (entries.length == 2
                    && (moment(entries[0].date).isBefore(y2016))
                    && (moment(entries[1].date).isBefore(y2016))
                    && (_.isEqual(entryTypes, ['Necropsy', 'Biopsy']) || _.isEqual(entryTypes, ['Biopsy', 'Necropsy']))
                ) {
                    // There's a special exception before 2016, since we numbered Necropsies and Biopsies separately.
                }
                else {
                    errorList.push(`There are ${caseIndex[i].length} cases with the case number of ${i}.`);
                }
            }
        }
        else {
            errorList.push(`${i} is missing from the list.`);
        }
    }

    return errorList;
});

export class PathCaseList extends React.Component<{}, {}> {
    render() {
        errors.subscribe(() => {
            this.forceUpdate();
        });

        return (
        <div className="panel panel-primary">
            <div className="panel-heading"><span className="panel-title">List of Biopsy and Necropsy Cases</span></div>

            <div className="panel-body">
                <form className="form-horizontal">
                    <div className="form-group">
                        <label className="col-xs-3 control-label">Year: </label>
                            <div className="col-xs-9">
                                <YearSelector initialYear={selectedYear} />
                            </div>
                    </div>
                </form>

                {(errors().length > 0) ? (
                    <div style={{color: 'red'}}>
                        <p>
                            The following errors were detected with the case number sequence:
                        </p>
                        <ul className="fa-ul">
                            {
                                errors().map( (message, i) => { return (<li key={i}><i className="fa fa-remove"></i>{message}</li>); } )
                            }
                        </ul>
                    </div>
                ) : (
                    <div style={{color: 'green'}}>
                        <p>
                            No errors were detected with the case number sequence!  That means:
                        </p>
                        <ul className="fa-ul">
                            <li>
                                <i className="fa-li fa fa-check"></i>Each case number is used only once
                                <ul>
                                    <li>Note that cases numbers before 2016 might have both a necropsy and a biopsy associate with them.</li>
                                </ul>
                            </li>
                            <li>
                                <i className="fa-li fa fa-check"></i>No numbers are skipped.
                            </li>
                        </ul>
                    </div>
                )}

                <div className="row">
                    <FilterableTable table={values} />
                </div>
            </div>
        </div>
        )
    }
}

function handleData(biopsies: {[name: string]: string}[], necropsies: {[name: string]: string}[]): Promise<any> {
    let newCases: PathCase[] = ([] as PathCase[]).concat(
        biopsies.map((row: any) => {return parsePathCase(row, "Biopsy"); }),
        necropsies.map((row: any) => {return parsePathCase(row, "Necropsy"); })
    );

    let newRows = _.sortBy(newCases, (row: PathCase) => {
        return (row.order == null) ? -1000 : -row.order;
    }).map(makeRow);


    // Update rows
    values.rows(newRows);

    return Promise.resolve();
}

selectedYear.subscribe((val: Moment) => {
    // Don't do anything if the value isn't a moment
    if (!moment.isMoment(val)) {
        return;
    }

    let startOfYear = val.startOf('year').format('YYYY-MM-DD');
    let endOfYear   = val.endOf('year').format('YYYY-MM-DD');

    values.isLoading(true);

    let config = {
        columns: ['Id', 'date', 'taskid', 'caseno', 'QCState/label'],
        filters: {
            'date~gte': startOfYear,
            'date~lte': endOfYear
        }
    };

    return rsvp.Promise.all([
        api.selectRows('study', 'biopsy', config),
        api.selectRows('study', 'necropsy', config)
    ]).then(function(resultsArray) {
        let biopsies   = (resultsArray[0] as any).rows as {[name: string]: string}[];
        let necropsies = (resultsArray[1] as any).rows as {[name: string]: string}[];

        handleData(biopsies, necropsies);
    }).finally(() => {
        values.isLoading(false);
    })
});

handleData(pageLoadData.biopsies as {[name: string]: string}[], pageLoadData.necropsies as {[name: string]: string}[]);

export class Page extends React.Component<any, any> {
    render() {
        return <PathCaseList />;
    }
}

// Render the page into the react div
ReactDOM.render(
    <Page />,
    $("#react-page").get(0)
);