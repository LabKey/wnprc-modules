import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDataGrid from 'react-data-grid';

/**
 * Expanded ReactDataGrid component that adds support for master-detail records. A new column is added with
 * an "expando" that--when clicked--expands the row to show a detail panel under the normal row. All other
 * customizations are passed through to the inner ReactDataGrid.
 */
export class MasterDetailDataGrid extends React.Component<MasterDetailDataGridProps, { mdExpandedRowIds: string[] }>
{
    constructor(props: MasterDetailDataGridProps, context: any) {
        super(props, context);

        this.createExpando = this.createExpando.bind(this);
        this.expandRow     = this.expandRow.bind(this);
        this.getExpandRow  = this.getExpandRow.bind(this);

        this.columns = props.columns || [];
        this.columns.unshift(this.createExpando());

        this.state = { mdExpandedRowIds: [] };
    }

    /** List of columns to display in the data grid */
    private columns: ReactDataGrid.Column[];

    /**
     * Defines the expando column for the left of the view.
     * @returns {ReactDataGrid.Column}
     */
    private createExpando(): ReactDataGrid.Column {
        // a couple of things to note about the react-data-grid column that may not be obvious:
        //
        //   * in order to get the row information into the column formatter, we need to define 'getRowMetaData'
        //     and pass it the row. anything that gets returned from that function will end up in the formatter
        //     in the 'dependentValues' member of the formatter's properties. the function prototype allows for
        //     passing the column as well:
        //
        //       (rowdata: any, column?: ReactDataGrid.Column): any
        //
        //   * events added to the column need to be named like 'onXxxxxx' where 'Xxxxxx' is the camel-case
        //     event name. the interface for the function (which is in the react-data-grid types) is defined as:
        //
        //       (ev: React.SyntheticEvent<any>, args: {rowIdx: number, idx: number, name: string}): void
        //
        //     since we don't care about the event or about any of the other args, those got left out of the click
        //     event handler for now.
        //
        // also of note, we must create a new instance of the expando column with this method in order to
        // survive re-rendering if the columns change in this.props. if we use the same instance each time,
        // the 'getExpandRow' function will lose its context binding.
        return {
            key:            'master-detail-expando-column',
            name:           '',
            width:          30,
            locked:         true,
            formatter:      (<MasterDetailExpandoColumnFormatter getExpandRow={this.getExpandRow}/>),
            getRowMetaData: (row: any) => row,
            filterable:     false,
            sortable:       false,
            events:         {onClick: (evt: any, args: { rowIdx: number }) => this.expandRow(args.rowIdx)}
        };
    }

    /**
     * Expands the row at the passed index. Note that that index is for the currently-visible rows,
     * so we need to pass that into the row getter supplied to the data grid itself to make sure we
     * respect any filtering or sorting.
     * @param {number} rowidx
     */
    private expandRow(rowidx: number) {
        let row: any = (typeof(this.props.rowGetter) === 'function')
            ? this.props.rowGetter(rowidx)
            : this.props.rowGetter[rowidx];
        let exp = this.state.mdExpandedRowIds.slice();
        let idx = exp.indexOf(row.id);
        if (idx === -1)
            exp.push(row.id);
        else
            exp.splice(idx, 1);
        this.setState({ mdExpandedRowIds: exp });
    };

    /**
     * Predicate that determines whether or not a row should be expanded by checking the component's current state.
     * @param {string} id
     * @returns {boolean}
     */
    private getExpandRow(id: string) {
        if (!this.state)
            console.warn("Master detail grid state is undefined when checking whether to expand detail view");
        return this.state && this.state.mdExpandedRowIds.indexOf(id) !== -1;
    };

    componentWillReceiveProps(props: MasterDetailDataGridProps) {
        if (this.props.columns !== props.columns) {
            this.columns = props.columns || [];
            this.columns.unshift(this.createExpando());
        }
    }

    render() {
        return (<ReactDataGrid
            columns     = {this.columns}
            rowRenderer = {
                <MasterDetailRowRenderer
                    detailRenderer = {this.props.detailRenderer}
                    getExpandRow   = {this.getExpandRow}
                />}
            {...this.props}
        />);
    }
}

/** Properties for the MasterDetailDataGrid component. */
interface MasterDetailDataGridProps extends AdazzleReactDataGrid.GridProps
{
    /** Renderer element which will be shown as the row details when expanded. */
    detailRenderer?: React.ReactElement<any>;
}

/** Formatter for the master detail expando column, which displays one or the other of two glyphs */
class MasterDetailExpandoColumnFormatter extends React.Component<MasterDetailExpandoColumnFormatterProps, {}>
{
    render() {
        // make sure we got the row information (otherwise we can't check the state)
        let rowinfo = this.props.dependentValues;
        if (!rowinfo)
            console.warn("Row info is necessary for the MasterDetailExpandoColumnFormatter. Define 'getRowMetaData' on the column definition.");

        // check if the row is expanded or not, and show the appropriate bootstrap glyph
        let icon    = rowinfo && this.props.getExpandRow(rowinfo.id)
            ? 'glyphicon-triangle-bottom'
            : 'glyphicon-triangle-right';
        return (<span className={`glyphicon ${icon}`}/>);
    }
}

/** Properties for the MasterDetailExpandoColumnFormatter component. */
interface MasterDetailExpandoColumnFormatterProps
{
    /** Predicate called with the row id to determine whether or not to expand. */
    getExpandRow:       MasterDetailExpandRowCallback;

    /**
     * Row details passed in via the getRowMetaData function defined on the column.
     * @default undefined
     * */
    dependentValues?:   any;
}

/** Predicate used to determine whether or not to expand the detail panel. */
interface MasterDetailExpandRowCallback { (id: string): boolean }

/** Renderer for the master detail rows, which will show the detail if expanded by hide it otherwise. */
class MasterDetailRowRenderer extends React.Component<MasterDetailRowRendererProps, {}>
{
    /**
     * Renders the detail section by either using the passed renderer or emitting a blank panel body.
     * @param renderer
     * @param props
     * @returns {React.ReactElement<any>}
     */
    private static renderDetail(renderer: any, props: any): React.ReactElement<any>
    {
        // if we have a renderer for the details, use it
        if (React.isValidElement(renderer))
            return React.cloneElement(renderer, props);
        // otherwise, fail-over to emitting a blank panel (but complain about it in the console)
        console.warn("No detail renderer was provided to MasterDetailRowRenderer, so nothing will show up in the row details.");
        return (<div className="panel-body react-grid-Cell">&nbsp;</div>);
    }

    /**
     * Renders the row by either passing through to the passed renderer or using a default row.
     * @param renderer
     * @param props
     * @returns {React.ReactElement<any>}
     */
    private static renderRow(renderer: any, props: any): React.ReactElement<any>
    {
        // if we have a renderer for the row, use it
        if (React.isValidElement(renderer))
            return React.cloneElement(renderer, props);
        // otherwise, render a default row
        return (<ReactDataGrid.Row {...props}/>);
    }

    render()
    {
        // remove the extra properties added to handle the master/detail. those
        // do not need to be passed in to the inner row rendering.
        let innerProps = _.assign({}, this.props) as any;
        delete innerProps.detailRenderer;
        delete innerProps.rowRenderer;

        // if the row is expanded, render both the row and the detail inside
        // a dedicated <div>. if there is no row information, do not expand
        let rowinfo =  this.props.row;
        if (rowinfo && this.props.getExpandRow(rowinfo.id))
        {
            return (
                <div>
                    { MasterDetailRowRenderer.renderRow(this.props.rowRenderer, innerProps) }
                    { MasterDetailRowRenderer.renderDetail(this.props.detailRenderer, innerProps) }
                </div>);
        }

        // otherwise, return only the row (not the detail)
        return MasterDetailRowRenderer.renderRow(this.props.rowRenderer, innerProps);
    }
}

/** Properties for the MasterDetailRowRenderer component. */
interface MasterDetailRowRendererProps
{
    /** Predicate called with the row id to determine whether or not to expand. */
    getExpandRow:    MasterDetailExpandRowCallback;

    /**
     * Renderer component to use for the detail section of the row if expanded.
     * @default undefined
     */
    detailRenderer?: React.ReactElement<any>;
    /**
     * Renderer component to use for the row section of the row.
     * @default undefined
     */
    rowRenderer?:    React.ReactElement<any> | React.ComponentClass<any> | React.StatelessComponent<any>
    /**
     * Metadata about the row. Expected to contain an 'id' property.
     * @default undefined
     * */
    row?:            { id: string };
}