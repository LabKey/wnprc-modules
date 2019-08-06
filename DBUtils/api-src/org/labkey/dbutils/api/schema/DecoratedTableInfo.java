package org.labkey.dbutils.api.schema;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.collections.NamedObjectList;
import org.labkey.api.data.ButtonBarConfig;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.DatabaseTableType;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.MethodInfo;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.dialect.SqlDialect;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.exp.property.DomainKind;
import org.labkey.api.gwt.client.AuditBehaviorType;
import org.labkey.api.query.AggregateRowConfig;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.SchemaTreeVisitor;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.util.ContainerContext;
import org.labkey.api.util.Pair;
import org.labkey.api.util.Path;
import org.labkey.api.util.StringExpression;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.ViewContext;
import org.labkey.data.xml.TableType;
import org.labkey.data.xml.queryCustomView.FilterType;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * This is just a decorator for TableInfo.  It allows you to inherit from this class anonymously
 * to override interface methods on an instance of TableInfo.
 *
 * Created by jon on 10/26/16.
 */
public class DecoratedTableInfo implements TableInfo {
    protected TableInfo _tableInfo;

    public DecoratedTableInfo(@NotNull TableInfo tableInfo) {
        _tableInfo = tableInfo;
    }

    @Override
    public String getName() {
        return _tableInfo.getName();
    }

    @Override
    public <R, P> R accept(SchemaTreeVisitor<R, P> visitor, SchemaTreeVisitor.Path path, P param) {
        return _tableInfo.accept(visitor, path, param);
    }

    @Override
    public String getTitle() {
        return _tableInfo.getTitle();
    }

    @Nullable
    @Override
    public String getTitleField() {
        return _tableInfo.getTitleField();
    }

    @Nullable
    @Override
    public String getSelectName() {
        return _tableInfo.getSelectName();
    }

    @Nullable
    @Override
    public String getMetaDataName() {
        return _tableInfo.getMetaDataName();
    }

    @NotNull
    @Override
    public SQLFragment getFromSQL(String alias) {
        return _tableInfo.getFromSQL(alias);
    }

    @Override
    public SQLFragment getFromSQL(String alias, Set<FieldKey> cols) {
        return _tableInfo.getFromSQL(alias, cols);
    }

    @Override
    public DbSchema getSchema() {
        return _tableInfo.getSchema();
    }

    @Nullable
    @Override
    public UserSchema getUserSchema() {
        return _tableInfo.getUserSchema();
    }

    @Override
    public SqlDialect getSqlDialect() {
        return _tableInfo.getSqlDialect();
    }

    @Override
    public List<String> getPkColumnNames() {
        return _tableInfo.getPkColumnNames();
    }

    @NotNull
    @Override
    public List<ColumnInfo> getPkColumns() {
        return _tableInfo.getPkColumns();
    }

    @NotNull
    @Override
    public Map<String, Pair<IndexType, List<ColumnInfo>>> getUniqueIndices() {
        return _tableInfo.getUniqueIndices();
    }

    @NotNull
    @Override
    public Map<String, Pair<IndexType, List<ColumnInfo>>> getAllIndices() {
        return _tableInfo.getAllIndices();
    }

    @NotNull
    @Override
    public List<ColumnInfo> getAlternateKeyColumns() {
        return _tableInfo.getAlternateKeyColumns();
    }

    @Override
    public ColumnInfo getVersionColumn() {
        return _tableInfo.getVersionColumn();
    }

    @Override
    public String getVersionColumnName() {
        return _tableInfo.getVersionColumnName();
    }

    @Override
    public String getTitleColumn() {
        return _tableInfo.getVersionColumnName();
    }

    @Override
    public boolean hasDefaultTitleColumn() {
        return _tableInfo.hasDefaultTitleColumn();
    }

    @Override
    public DatabaseTableType getTableType() {
        return _tableInfo.getTableType();
    }

    @Override
    public NamedObjectList getSelectList(String columnName) {
        return _tableInfo.getSelectList(columnName);
    }

    @Override
    public @NotNull NamedObjectList getSelectList(String columnName, List<FilterType> filters, Integer maxRows)
    {
        return _tableInfo.getSelectList(columnName, filters, maxRows);
    }

    @Override
    public ColumnInfo getColumn(@NotNull String colName) {
        return _tableInfo.getColumn(colName);
    }

    @Override
    public ColumnInfo getColumn(@NotNull FieldKey colName) {
        return _tableInfo.getColumn(colName);
    }

    @Override
    public List<ColumnInfo> getColumns() {
        return _tableInfo.getColumns();
    }

    @Override
    public List<ColumnInfo> getUserEditableColumns() {
        return _tableInfo.getUserEditableColumns();
    }

    @Override
    public List<ColumnInfo> getColumns(String colNames) {
        return _tableInfo.getColumns(colNames);
    }

    @Override
    public List<ColumnInfo> getColumns(String... colNameArray) {
        // Varargs can be passed as an array or list of arguments, so this'll work.
        return _tableInfo.getColumns(colNameArray);
    }

    @Override
    public Set<String> getColumnNameSet() {
        return _tableInfo.getColumnNameSet();
    }

    @Override
    public Map<FieldKey, ColumnInfo> getExtendedColumns(boolean includeHidden) {
        return _tableInfo.getExtendedColumns(includeHidden);
    }

    @Override
    public List<FieldKey> getDefaultVisibleColumns() {
        return _tableInfo.getDefaultVisibleColumns();
    }

    @Override
    public void setDefaultVisibleColumns(@Nullable Iterable<FieldKey> keys) {
        _tableInfo.setDefaultVisibleColumns(keys);
    }

    @Override
    public ButtonBarConfig getButtonBarConfig()
    {
        return _tableInfo.getButtonBarConfig();
    }

    @Override
    public AggregateRowConfig getAggregateRowConfig() {
        return _tableInfo.getAggregateRowConfig();
    }

    @Override
    public ActionURL getGridURL(Container container) {
        return _tableInfo.getGridURL(container);
    }

    @Override
    public ActionURL getInsertURL(Container container) {
        return _tableInfo.getInsertURL(container);
    }

    @Override
    public ActionURL getImportDataURL(Container container) {
        return _tableInfo.getImportDataURL(container);
    }

    @Override
    public ActionURL getDeleteURL(Container container) {
        return _tableInfo.getDeleteURL(container);
    }

    @Override
    public StringExpression getUpdateURL(@Nullable Set<FieldKey> columns, Container container) {
        return _tableInfo.getUpdateURL(columns, container);
    }

    @Override
    public StringExpression getDetailsURL(@Nullable Set<FieldKey> columns, Container container) {
        return _tableInfo.getDetailsURL(columns, container);
    }

    @Override
    public boolean hasDetailsURL() {
        return _tableInfo.hasDetailsURL();
    }

    @Override
    public MethodInfo getMethod(String name) {
        return _tableInfo.getMethod(name);
    }

    @Override
    public String getImportMessage() {
        return _tableInfo.getImportMessage();
    }

    @Override
    public List<Pair<String, String>> getImportTemplates(ViewContext ctx) {
        return _tableInfo.getImportTemplates(ctx);
    }

    @Override
    public List<Pair<String, StringExpression>> getRawImportTemplates() {
        return _tableInfo.getRawImportTemplates();
    }

    @Override
    public boolean isPublic() {
        return _tableInfo.isPublic();
    }

    @Override
    public String getPublicName() {
        return _tableInfo.getPublicName();
    }

    @Override
    public String getPublicSchemaName() {
        return _tableInfo.getPublicSchemaName();
    }

    @Override
    public boolean hasContainerColumn() {
        return _tableInfo.hasContainerColumn();
    }

    @Override
    public boolean needsContainerClauseAdded() {
        return _tableInfo.needsContainerClauseAdded();
    }

    @Override
    public ContainerFilter getContainerFilter() {
        return _tableInfo.getContainerFilter();
    }

    @Override
    public void overlayMetadata(String tableName, UserSchema schema, Collection<QueryException> errors) {
        _tableInfo.overlayMetadata(tableName, schema, errors);
    }

    @Override
    public void overlayMetadata(Collection<TableType> metadata, UserSchema schema, Collection<QueryException> errors) {
        _tableInfo.overlayMetadata(metadata, schema, errors);
    }

    @Override
    public boolean isMetadataOverrideable() {
        return _tableInfo.isMetadataOverrideable();
    }

    @Override
    public ColumnInfo getLookupColumn(ColumnInfo parent, String name) {
        return _tableInfo.getLookupColumn(parent, name);
    }

    @Override
    public int getCacheSize() {
        return _tableInfo.getCacheSize();
    }

    @Override
    public String getDescription() {
        return _tableInfo.getDescription();
    }

    @Nullable
    @Override
    public Domain getDomain() {
        return _tableInfo.getDomain();
    }

    @Nullable
    @Override
    public DomainKind getDomainKind() {
        return _tableInfo.getDomainKind();
    }

    @Nullable
    @Override
    public QueryUpdateService getUpdateService() {
        return _tableInfo.getUpdateService();
    }

    @NotNull
    @Override
    public Collection<QueryService.ParameterDecl> getNamedParameters() {
        return _tableInfo.getNamedParameters();
    }

    @Override
    public void fireBatchTrigger(Container c, User u,TriggerType type, boolean before, BatchValidationException errors, Map<String, Object> extraContext) throws BatchValidationException {
        _tableInfo.fireBatchTrigger(c, u, type, before, errors, extraContext);
    }

    @Override
    public void fireRowTrigger(Container c, User u, TriggerType type, boolean before, int rowNumber, @Nullable Map<String, Object> newRow, @Nullable Map<String, Object> oldRow, Map<String, Object> extraContext) throws ValidationException {
        _tableInfo.fireRowTrigger(c, u, type, before, rowNumber, newRow, oldRow, extraContext);
    }

    @Override
    public boolean hasTriggers(Container c) {
        return _tableInfo.hasTriggers(c);
    }

    @Override
    public void resetTriggers(Container c) {
        _tableInfo.resetTriggers(c);
    }

    @Override
    public Path getNotificationKey() {
        return _tableInfo.getNotificationKey();
    }

    @Override
    public void setLocked(boolean b) {
        _tableInfo.setLocked(b);
    }

    @Override
    public boolean isLocked() {
        return _tableInfo.isLocked();
    }

    @Override
    public boolean supportsContainerFilter() {
        return _tableInfo.supportsContainerFilter();
    }

    @Override
    public boolean hasUnionTable() {
        return _tableInfo.hasUnionTable();
    }

    @Nullable
    @Override
    public ContainerContext getContainerContext() {
        return _tableInfo.getContainerContext();
    }

    @Override
    public FieldKey getContainerFieldKey(){return _tableInfo.getContainerFieldKey();}

    @Override
    public Set<ColumnInfo> getAllInvolvedColumns(Collection<ColumnInfo> selectColumns) {
        return _tableInfo.getAllInvolvedColumns(selectColumns);
    }

    @Override
    public boolean hasPermission(@NotNull UserPrincipal user, @NotNull Class<? extends Permission> perm) {
        return _tableInfo.hasPermission(user, perm);
    }

    @Override
    public boolean supportsAuditTracking() {
        return _tableInfo.supportsAuditTracking();
    }
}
