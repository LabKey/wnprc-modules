package org.labkey.dbutils.api;

import org.jetbrains.annotations.NotNull;
import org.json.JSONObject;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.DisplayColumn;
import org.labkey.api.data.JsonWriter;
import org.labkey.api.data.LookupColumn;
import org.labkey.api.data.Results;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.exp.PropertyColumn;
import org.labkey.api.query.CustomView;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryHelper;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.util.ResultSetUtil;

import java.lang.reflect.Constructor;
import java.sql.SQLException;
import java.util.*;

/**
 * Created by jon on 1/12/16.
 */
public class SimpleQuery<RowType> extends QueryHelper {
    protected final User _user;
    protected final Container _container;

    public SimpleQuery(@NotNull String schemaName, @NotNull String queryName, @NotNull String viewName, @NotNull User user, @NotNull Container container) {
        super(container, user, schemaName, queryName, viewName);

        _user = user;
        _container = container;
    }

    public SimpleQuery(@NotNull String schemaName, @NotNull String queryName, @NotNull User user, @NotNull Container container) {
        this(schemaName, queryName, null, user, container);
    }

    @Override
    public String getViewName() {
        return (super.getViewName() == null) ? "" : super.getViewName();
    }

    public boolean viewExists() {
        CustomView view = getCustomView();
        return view != null;
    }

    public List<RowType> getResults(Class<RowType> rowTypeClass) throws NoSuchMethodException, Exception {
        // Create the output container
        List<RowType> resultRows = new ArrayList<>();

        // Grab some instance properties for easier local usage
        User      user      = _user;
        Container container = _container;

        // Grab the row constructor
        Constructor<RowType> constructor = rowTypeClass.getConstructor(Results.class);

        Results rs = null;
        try {
            // If the view name isn't blank (indicating the default view) and the view doesn't exist,
            // throw an error.
            if ( (!"".equals(getViewName())) && !viewExists() ) {
                throw new Exception("Invalid View Name");
            }

            // Define the service, schema, and table.
            QueryService queryService = QueryService.get();
            UserSchema   userSchema   = QueryService.get().getUserSchema(user, container, getSchemaName());
            TableInfo    tableInfo    = userSchema.getTable(getQueryName());

            // Determine the columns to include
            List<FieldKey> columns = new ArrayList<>();
            if (viewExists() && (getCustomView().getColumns().size() > 0)) {
                columns.addAll(getCustomView().getColumns());
            }
            else {
                columns.addAll(tableInfo.getDefaultVisibleColumns());
            }


            Set<String> columnNames = new HashSet<>();
            for(FieldKey column : columns) {
                columnNames.add(column.getName().toLowerCase());
            }

            for(String pkName : tableInfo.getPkColumnNames()) {
                if (!columnNames.contains(pkName.toLowerCase())) {
                    columns.add(FieldKey.fromParts(pkName));
                    columnNames.add(pkName.toLowerCase());
                }
            }


            // Now get the actual columnInfo
            Map<FieldKey, ColumnInfo> map = queryService.getColumns(tableInfo, columns);
            Collection<ColumnInfo> cols = map.values();

            // Actually execute the query and grab the results
            rs = select(columns, null);

            // Now, loop through results, adding them to our results object
            if (rs.next()) {
                do {
                    resultRows.add(constructor.newInstance(rs));
                } while (rs.next());
            }
        }
        catch(SQLException e) {
            throw new RuntimeSQLException(e);
        }
        finally {
            ResultSetUtil.close(rs);
        }

        return resultRows;
    }

    public JSONObject getResults() {
        return getResults((SimpleFilter) null);
    }

    public JSONObject getResults(SimpleFilter filter) {
        // Grab some instance properties for easier local usage
        User      user      = _user;
        Container container = _container;

        JSONObject jsonResults = new JSONObject();

        JSONObject jsonError = new JSONObject();
        jsonError.put("hasError", false);
        jsonError.put("message",  "");

        Results rs = null;
        List<JSONObject> rows = new ArrayList<>();
        List<Map<String, Object>> columnMetadataArray = new ArrayList<>();
        List<Map<String, Object>> columnDisplayData = new ArrayList<>();
        try {
            // If the view name isn't blank (indicating the default view) and the view doesn't exist,
            // throw an error.
            if ( (!"".equals(getViewName())) && !viewExists() ) {
                throw new Exception("Invalid View Name");
            }

            // Define the service, schema, and table.
            QueryService queryService = QueryService.get();
            UserSchema   userSchema   = QueryService.get().getUserSchema(user, container, getSchemaName());
            TableInfo    tableInfo    = userSchema.getTable(getQueryName());

            // Determine the columns to include
            List<FieldKey> columns = new ArrayList<>();
            if (viewExists() && (getCustomView().getColumns().size() > 0)) {
                columns.addAll(getCustomView().getColumns());
            }
            else {
                columns.addAll(tableInfo.getDefaultVisibleColumns());
            }


            Set<String> columnNames = new HashSet<>();
            for(FieldKey column : columns) {
                columnNames.add(column.getName().toLowerCase());
            }

            for(String pkName : tableInfo.getPkColumnNames()) {
                if (!columnNames.contains(pkName.toLowerCase())) {
                    columns.add(FieldKey.fromParts(pkName));
                    columnNames.add(pkName.toLowerCase());
                }
            }

            // Now get the actual columnInfo
            Map<FieldKey, ColumnInfo> map = queryService.getColumns(tableInfo, columns);
            Collection<ColumnInfo> cols = map.values();

            // Grab the metadata for this query.
            for (ColumnInfo col : cols) {
                Map<String, Object> colMetadata = JsonWriter.getMetaData(col.getRenderer(), null, false, true, false);
                columnMetadataArray.add(colMetadata);
                columnDisplayData.add(getColModel(col.getRenderer(), tableInfo));
            }

            // Actually execute the query and grab the results
            rs = select(columns, filter);

            // Now, loop through results, adding them to our results object
            if (rs.next()) {
                do {
                    JSONObject rowJSONObject = new JSONObject();

                    Map<String, Object> rowMap = rs.getRowMap();
                    for(String key : rowMap.keySet()) {
                        rowJSONObject.put(key, rowMap.get(key));
                    }

                    rows.add(rowJSONObject);
                } while (rs.next());
            }
        }
        catch(SQLException e) {
            throw new RuntimeSQLException(e);
        }
        catch (Exception e) {
            jsonResults.put("hasError", true);
            jsonResults.put("message", e.toString());
        }
        finally {
            ResultSetUtil.close(rs);
        }

        jsonResults.put("rows", rows);
        jsonResults.put("error", jsonError);
        jsonResults.put("colMetadata",    columnMetadataArray);
        jsonResults.put("colDisplayData", columnDisplayData);

        return jsonResults;
    }

    protected List<FieldKey> getDefaultColumns() {
        if (viewExists()) {
            return getCustomView().getColumns();
        }
        else {
            TableInfo tableInfo = getUserSchema().getTable(getQueryName());

            // Determine the columns to include
            return tableInfo.getDefaultVisibleColumns();
        }
    }

    @Override
    public Results select() {
        return super.select(this.getDefaultColumns(), null);
    }

    @Override
    public Results select(SimpleFilter filter) {
        return super.select(this.getDefaultColumns(), filter);
    }

    // Mimicked from ApiQueryResponse Class
    protected Map<String,Object> getColModel(DisplayColumn dc, TableInfo tableInfo) throws Exception {
        Map<String,Object> extGridColumn = new HashMap<>();
        ColumnInfo colInfo = dc.getColumnInfo();

        // see  Ext.grid.ColumnModel Ext.grid.Column
        extGridColumn.put("dataIndex", colInfo.getColumnName());
        extGridColumn.put("sortable", dc.isSortable());
        extGridColumn.put("editable", isEditable(dc, tableInfo));
        extGridColumn.put("hidden", colInfo != null && (colInfo.isHidden() || colInfo.isAutoIncrement())); //auto-incr list key columns return false for isHidden(), so check isAutoIncrement as well
        if (dc.getTextAlign() != null)
            extGridColumn.put("align", dc.getTextAlign());

        // Consider uncommenting this...
        //if (dc.getCaption() != null)
        //    extGridColumn.put("header", dc.getCaption(getView()., false));
        if (dc.getDescription() != null)
            extGridColumn.put("tooltip", dc.getDescription());
        if (dc.getWidth() != null)
        {
            try
            {
                //try to parse as integer (which is what Ext wants)
                extGridColumn.put("width", Integer.parseInt(dc.getWidth()));
            }
            catch(NumberFormatException e)
            {
                //include it as a string
                extGridColumn.put("width", dc.getWidth());
            }
        }

        /** These are not part of Ext.Grid.Column, don't know why they are here (MAB) */
        // TODO ext grids doesn't understand missing values, so treat required as !nullable
        extGridColumn.put("required", colInfo != null && (!colInfo.isNullable() || colInfo.isRequired()));
        if (colInfo != null && isEditable(dc, tableInfo) && null != colInfo.getDefaultValue())
            extGridColumn.put("defaultValue", colInfo.getDefaultValue());
        if (colInfo != null)
        {
            extGridColumn.put("scale", colInfo.getScale());
        }
        return extGridColumn;
    }

    // Mimicked from ApiQueryResponse Class
    protected boolean isEditable(DisplayColumn dc, TableInfo tableInfo) {
        if (!isQueryEditable(tableInfo) || !dc.isEditable()) {
            return false;
        }

        // UNDONE: make the schema set isEditable() correctly and remove this hack
        ColumnInfo col = dc.getColumnInfo();
        return (!(col instanceof LookupColumn) || col instanceof PropertyColumn);
    }

    // Mimicked from ApiQueryResponse Class
    protected boolean isQueryEditable(TableInfo table) {
        if (!_container.hasPermission("isQueryEditable", _user, DeletePermission.class)) {
            return false;
        }

        QueryUpdateService updateService = null;
        try {
            updateService = table.getUpdateService();
        }
        catch(Exception ignore) {}
        return ((null != table) && (null != updateService));
    }

    // Copied from parent class
    @Override
    protected CustomView getCustomView() {
        return QueryService.get().getCustomView(_user, _container, _user, getSchemaName(), getQueryName(), getViewName());
    }
}
