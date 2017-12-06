/**
 * Specification for grid filters for the ReactDataGrid. Columns can be:
 *
 *   - disabled individually  '^Column Title': null
 *   -  enabled individually   'Column Title': FilterComponent
 *   -    enabled by default              '*': FilterComponent
 *
 * Precedence flows in listed order, in that 'disable' directives
 * override 'enable' directives, and an enabled column will use
 * its specific filter component rather than the default. If there
 * is no default, columns that are not listed individually will not
 * be filterable.
 */
export interface ReactDataGridFilterSpec {
    [key: string]: any | null;
}

/** Specification for the query to execute to fill the ReactDataGrid */
export interface ReactDataGridQuerySpec {
    name: string;
    schema: string;
    view?: string;
}
