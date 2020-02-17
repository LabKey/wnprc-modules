package org.labkey.wnprc_compliance;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.json.JSONObject;
import org.labkey.api.action.AbstractFileUploadAction;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.Marshal;
import org.labkey.api.action.Marshaller;
import org.labkey.api.action.ReadOnlyApiAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.FieldKey;
import org.labkey.api.security.ActionNames;
import org.labkey.api.security.CSRF;
import org.labkey.api.security.RequiresPermission;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimpleQueryUpdater;
import org.labkey.dbutils.api.SimplerFilter;
import org.labkey.wnprc_compliance.form.NewUserForm;
import org.labkey.wnprc_compliance.form.RequirementForm;
import org.labkey.webutils.api.action.SimpleJspPageAction;
import org.labkey.wnprc_compliance.security.ComplianceAdminPermission;
import org.springframework.validation.BindException;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class WNPRC_ComplianceController extends SpringActionController {
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(WNPRC_ComplianceController.class);
    public static final String NAME = "wnprc_compliance";

    public WNPRC_ComplianceController() {
        setActionResolver(_actionResolver);
    }

    public abstract class HRJspPageAction extends SimpleJspPageAction {
        @Override
        public Module getModule() {
            return ModuleLoader.getInstance().getModule(WNPRC_ComplianceModule.class);
        }
    }

    @RequiresPermission(ComplianceAdminPermission.class)
    public class BeginAction extends HRJspPageAction {
        @Override
        public String getPathToJsp() {
            return "view/begin.jsp";
        }

        @Override
        public String getTitle() {
            return "TB Dashboard";
        }
    }

    @ActionNames("unidentifiedCards")
    @RequiresPermission(ComplianceAdminPermission.class)
    public class UnidentifiedCardsPage extends HRJspPageAction {
        @Override
        public String getPathToJsp() {
            return "view/unidentifiedCards.jsp";
        }

        @Override
        public String getTitle() {
            return "Unidentified Cards";
        }
    }

    @ActionNames("pendingTBResults")
    @RequiresPermission(ComplianceAdminPermission.class)
    public class PendingTBResultsPage extends HRJspPageAction {
        @Override
        public String getPathToJsp() {
            return "view/pendingTBResults.jsp";
        }

        @Override
        public String getTitle() {
            return "Pending TB Results";
        }
    }

    @ActionNames("exemptCards")
    @RequiresPermission(ComplianceAdminPermission.class)
    public class ExemptCardsPage extends HRJspPageAction {
        @Override
        public String getPathToJsp() {
            return "view/exemptCards.jsp";
        }

        @Override
        public String getTitle() {
            return "Exempt Cards";
        }
    }

    @ActionNames("enterTBPage")
    @RequiresPermission(ComplianceAdminPermission.class)
    public class NewUserPage extends HRJspPageAction {
        @Override
        public String getPathToJsp() {
            return "view/enterTB.jsp";
        }

        @Override
        public String getTitle() {
            return "New User";
        }
    }

    @ActionNames("editTBPage")
    @RequiresPermission(ComplianceAdminPermission.class)
    public class EditTBPage extends HRJspPageAction {
        @Override
        public String getPathToJsp() {
            return "view/editTB.jsp";
        }

        @Override
        public String getTitle() {
            return "Edit TB";
        }
    }

    @ActionNames("editUserPage")
    @RequiresPermission(ComplianceAdminPermission.class)
    public class EditUserPage extends HRJspPageAction {
        @Override
        public String getPathToJsp() {
            return "view/userEdit.jsp";
        }

        @Override
        public String getTitle() {
            return "Edit User";
        }
    }

    public static class SearchPersonForm {
        public String query;

        public void setQuery(String term) {
            this.query = term;
        }

        public String getQuery() {
            return this.query;
        }
    }

    public static class SearchPersonFromCardForm {
        public String query;
        public void setQuery(String term) {
            this.query = term;
        }

        public String getQuery() {
            return this.query;
        }

    }
    public static class SearchClearanceFromPersonForm {
        public String query;
        public String table;
        public void setQuery(String term) {
            this.query = term;
        }

        public String getQuery() {
            return this.query;
        }
        public void setTable(String table) {
            this.table = table;
        }

        public String getTable() {
            return this.table;
        }

    }

    public static class AddDataToExistingPersonForm {
        public String personid;
        public RequirementForm tbInfo;
        public RequirementForm measlesInfo;
    }


    @ActionNames("updatePersonClearances")
    @RequiresPermission(ComplianceAdminPermission.class)
    @Marshal(Marshaller.Jackson)
    @CSRF(CSRF.Method.POST)
    public class UpdatePersonClearanceAPI extends MutatingApiAction<AddDataToExistingPersonForm> {
        @Override
        public Object execute(AddDataToExistingPersonForm form, BindException errors) throws Exception {
            JSONObject json = new JSONObject();

            try (DbScope.Transaction transaction = DbSchema.get(WNPRC_ComplianceSchema.NAME).getScope().beginTransaction()) {
                PersonService service = new PersonService(getUser(), getContainer());
                String personId = form.personid;

                if (form.tbInfo != null) {
                    if (form.tbInfo.pending) {
                        service.addClearance(personId, "pending_tb_clearances", "persons_pending_tb_clearances", form.tbInfo);
                    }
                    else {
                        service.addClearance(personId, "tb_clearances", "persons_tb_clearances", form.tbInfo);
                    }
                }

                if (form.measlesInfo != null) {
                    service.addClearance(personId,"measles_clearances", "persons_measles_clearances", form.measlesInfo);
                }

                json.put("personid", personId);

                transaction.commit();
            }

            return json;
        }
    }


    public static class NewUserFormWithData extends NewUserForm {
        public RequirementForm tbInfo;
        public RequirementForm measlesInfo;
    }

    @ActionNames("newUser")
    @RequiresPermission(ComplianceAdminPermission.class)
    @Marshal(Marshaller.Jackson)
    @CSRF(CSRF.Method.POST)
    public class NewUserAPI extends MutatingApiAction<NewUserFormWithData> {
        @Override
        public Object execute(NewUserFormWithData form, BindException errors) throws Exception {
            PersonService service = new PersonService(getUser(), getContainer());

            JSONObject returnJSON = new JSONObject();

            try (DbScope.Transaction transaction = DbSchema.get(WNPRC_ComplianceSchema.NAME).getScope().ensureTransaction()) {
                String personId = service.newUser((NewUserForm) form);

                if (form.tbInfo != null) {
                    if (form.tbInfo.pending) {
                        service.addClearance(personId, "pending_tb_clearances", "persons_pending_tb_clearances", form.tbInfo);
                    }
                    else {
                        service.addClearance(personId, "tb_clearances", "persons_tb_clearances", form.tbInfo);
                    }
                }

                if (form.measlesInfo != null) {
                    service.addClearance(personId,"measles_clearances", "persons_measles_clearances", form.measlesInfo);
                }

                returnJSON.put("personid", personId);

                transaction.commit();
            }

            return returnJSON;
        }
    }

    @ActionNames("uploadAccessReport")
    @RequiresPermission(ComplianceAdminPermission.class)
    public class UploadAccessReportAPI extends AbstractFileUploadAction {
        @Override
        protected File handleFile(String filename, InputStream input, Writer writer) throws IOException {
            try {

                AccessReportService service = new AccessReportService(getUser(), getContainer());
                service.importReport(input);
                writer.write("Handled file: " + filename);
            }
            catch (Throwable e) {
                getViewContext().getResponse().reset();
                getViewContext().getResponse().setStatus(HttpServletResponse.SC_BAD_REQUEST);
                getViewContext().getResponse().setContentType("text/plain");
                writer.write(e.getMessage());
                writer.flush();
            }
            return null;
        }

        @Override
        protected File getTargetFile(String filename) throws IOException {
            // We'll be intercepting the stream, and we override handleFile(), so we don't need
            // to implement this.  If that ever changes, look at using /dev/null ("NUL" for Windows)
            // to truly give a data sink.
            return null;
        }

        @Override
        protected String getResponse(Map files, FileUploadForm form) throws UploadException {
            return "";
        }
    }

    @ActionNames("uploadAccessReportPage")
    @RequiresPermission(ComplianceAdminPermission.class)
    public class UploadAccessReportPage extends HRJspPageAction {
        @Override
        public String getPathToJsp() {
            return "view/uploadAccessReport.jsp";
        }

        @Override
        public String getTitle() {
            return "Upload Access Report";
        }
    }


    @ActionNames("personSearchPage")
    @RequiresPermission(ComplianceAdminPermission.class)
    public class PersonSearchPage extends HRJspPageAction {
        @Override
        public String getPathToJsp() {
            return "view/personSearch.jsp";
        }

        @Override
        public String getTitle() {
            return "Unidentified Cards";
        }
    }


    @ActionNames("personSearch")
    @RequiresPermission(ComplianceAdminPermission.class)
    public class SearchUserAPI extends ReadOnlyApiAction<SearchPersonForm> {
        @Override
        public Object execute(SearchPersonForm form, BindException errors) throws Exception {
            JSONObject json = new JSONObject();
            Map<String, List<JSONObject>> results = new HashMap<>();

            // Construct an "OR" clause based on space-delimited queries.
            SimpleFilter.OrClause orClause = new SimpleFilter.OrClause();
            for (String queryTerm : form.getQuery().split(" +")) {
                if (!queryTerm.equals("")) {
                    orClause.addClause(new SimplerFilter("displayLcase", CompareType.CONTAINS, queryTerm).getClauses().get(0));
                }
            }

            SimpleFilter filter = new SimpleFilter();
            filter.addClause(orClause);

            SimpleQueryFactory factory = new SimpleQueryFactory(getUser(), getContainer());

            for(JSONObject row : factory.selectRows(WNPRC_ComplianceSchema.NAME, "searchResults", filter).toJSONObjectArray()) {
                String type = row.getString("type");

                List<JSONObject> rows = results.get(type);
                if (rows == null) {
                    rows = new ArrayList<>();
                    results.put(type, rows);
                }

                rows.add(row);
            }

            json.put("results", results);

            return json;
        }
    }

    public static class CardExemptForm {
        public Integer cardId;
        public String reason;
        public String personId;
    }

    public static class CardLinkForm {
        public Integer cardId;
        public String personId;
    }


    @ActionNames("markCardsExempt")
    @RequiresPermission(ComplianceAdminPermission.class)
    @Marshal(Marshaller.Jackson)
    @CSRF(CSRF.Method.POST)
    public class MarkCardExemptAPI extends MutatingApiAction<CardExemptForm> {
        @Override
        public Object execute(CardExemptForm form, BindException errors) throws Exception {
            JSONObject json = new JSONObject();

            try (DbScope.Transaction transaction = DbSchema.get(WNPRC_ComplianceSchema.NAME).getScope().ensureTransaction()) {
                SimpleQueryUpdater cardUpdater = new SimpleQueryUpdater(getUser(), getContainer(), WNPRC_ComplianceSchema.NAME, "cards");

                JSONObject card = new JSONObject();

                card.put("card_id", form.cardId.toString());
                card.put("exempt_reason", form.reason);
                card.put("container", getContainer().getId());
                card.put("exempt", true);

                cardUpdater.upsert(card);

                json.put("success", true);

                transaction.commit();
            }

            return json;
        }
    }
    @ActionNames("getPersons")
    @RequiresPermission(ComplianceAdminPermission.class)
    @Marshal(Marshaller.Jackson)
    public class GetPersonFromCardAPI extends ReadOnlyApiAction<SearchPersonFromCardForm> {
        public Object execute(SearchPersonFromCardForm form, BindException errors) throws Exception {
            JSONObject json = new JSONObject();
            Map<String, List<JSONObject>> results = new HashMap<>();

            // Construct an "OR" clause based on space-delimited queries.
            SimpleFilter.OrClause orClause = new SimpleFilter.OrClause();
            if (!form.getQuery().equals("")) {
                orClause.addClause(new SimplerFilter("displayLcase", CompareType.CONTAINS, form.getQuery()).getClauses().get(0));
            }

            SimpleFilter filter = new SimpleFilter();
            filter.addClause(orClause);

            SimpleQueryFactory factory = new SimpleQueryFactory(getUser(), getContainer());

            for(JSONObject row : factory.selectRows(WNPRC_ComplianceSchema.NAME, "searchResults", filter).toJSONObjectArray()) {
                String type = row.getString("type");

                List<JSONObject> rows = results.get(type);
                if (rows == null) {
                    rows = new ArrayList<>();
                    results.put(type, rows);
                }

                rows.add(row);
            }

            json.put("results", results);

            return json;
        }
    }

    @ActionNames("getClearances")
    @RequiresPermission(ComplianceAdminPermission.class)
    @Marshal(Marshaller.Jackson)
    @CSRF
    public class GetClearancesFromPerson extends ReadOnlyApiAction<SearchClearanceFromPersonForm> {
        public Object execute(SearchClearanceFromPersonForm form, BindException errors) throws Exception {

            int resultLimit = 3;
            JSONObject json = new JSONObject();
            Map<String, List<JSONObject>> results = new HashMap<>();

            SimpleFilter filter = new SimpleFilter();
            filter.addCondition(FieldKey.fromString("personid"), form.getQuery(), CompareType.EQUAL);

            SimpleQueryFactory factory = new SimpleQueryFactory(getUser(), getContainer());
            List<JSONObject> rows = new ArrayList<>();
            int resultCount = 0;
            for(JSONObject row : factory.selectRows(WNPRC_ComplianceSchema.NAME, form.getTable(), filter).toJSONObjectArray()) {
                if (resultCount < resultLimit)
                {
                    rows.add(row);
                }
                resultCount++;
            }

            json.put("results", rows);

            return json;
        }
    }

    public static class ClearanceForm {
        public String notes;
        public String first_name;
        public String last_name;
        public String middle_name;
        public String personid;
        @JsonFormat(pattern="yyyy-MM-dd'T'HH:mm:ss")
        public Date date;
        public String id;
        public String _row;
        public String table_name;
        public String required;
        public boolean mutated;
    }
    public static class Clearances {
        public ClearanceForm[] clearances;
        public String table_name;
    }

    @ActionNames("updateClearance")
    @RequiresPermission(ComplianceAdminPermission.class)
    @Marshal(Marshaller.Jackson)
    @CSRF
    public class UpdateClearanceAPI extends MutatingApiAction<Clearances> {
        @Override
        public Object execute(Clearances form, BindException errors) throws Exception {
            JSONObject json = new JSONObject();

            try (DbScope.Transaction transaction = DbSchema.get(WNPRC_ComplianceSchema.NAME).getScope().ensureTransaction()) {
                SimpleQueryUpdater tbClearanceUpdater = new SimpleQueryUpdater(getUser(), getContainer(), WNPRC_ComplianceSchema.NAME, form.table_name);
                List<Map<String, Object>> clearancesToUpdate = new ArrayList<>();

                for (ClearanceForm tbform : form.clearances)
                {
                    JSONObject tbClearance = new JSONObject();
                    tbClearance.put("id", tbform.id);
                    tbClearance.put("date", tbform.date);
                    tbClearance.put("required", tbform.required);
                    tbClearance.put("container", getContainer().getId());
                    clearancesToUpdate.add(tbClearance);
                }

                tbClearanceUpdater.upsert(clearancesToUpdate);

                json.put("success", true);

                transaction.commit();
            }

            return json;
        }
    }
    @ActionNames("getMeaslesClearances")
    @RequiresPermission(ComplianceAdminPermission.class)
    @Marshal(Marshaller.Jackson)
    @CSRF
    public class GetMeaslesClearanceFromPerson extends ReadOnlyApiAction<SearchPersonFromCardForm> {
        public Object execute(SearchPersonFromCardForm form, BindException errors) throws Exception {
            JSONObject json = new JSONObject();
            Map<String, List<JSONObject>> results = new HashMap<>();

            SimpleFilter filter = new SimpleFilter();
            filter.addCondition(FieldKey.fromString("personid"), form.getQuery(), CompareType.EQUAL);

            SimpleQueryFactory factory = new SimpleQueryFactory(getUser(), getContainer());
            List<JSONObject> rows = new ArrayList<>();
            for(JSONObject row : factory.selectRows(WNPRC_ComplianceSchema.NAME, "mapMeaslesClearances", filter).toJSONObjectArray()) {
                rows.add(row);
            }

            json.put("results", rows);

            return json;
        }
    }

    @ActionNames("linkCards")
    @RequiresPermission(ComplianceAdminPermission.class)
    @Marshal(Marshaller.Jackson)
    @CSRF(CSRF.Method.POST)
    public class LinkCardAPI extends MutatingApiAction<CardLinkForm> {
        @Override
        public Object execute(CardLinkForm form, BindException errors) throws Exception {
            JSONObject json = new JSONObject();

            try (DbScope.Transaction transaction = DbSchema.get(WNPRC_ComplianceSchema.NAME).getScope().ensureTransaction()) {
                SimpleQueryUpdater cardUpdater = new SimpleQueryUpdater(getUser(), getContainer(), WNPRC_ComplianceSchema.NAME, "persons_to_cards");
                JSONObject personToCard = new JSONObject();

                personToCard.put("cardid", form.cardId.toString());
                personToCard.put("personid", form.personId);
                personToCard.put("container", getContainer().getId());

                cardUpdater.upsert(personToCard);

                json.put("success", true);

                transaction.commit();
            }

            return json;
        }
    }
    public static class ResolvePendingTBResultsForm {
        public String[] pendingTBIds;
        public String notes;
        @JsonFormat(pattern="yyyy-MM-dd'T'HH:mm:ssXXX")
        public Date date;
    }

    @ActionNames("resolvePendingTBResults")
    @RequiresPermission(ComplianceAdminPermission.class)
    @CSRF(CSRF.Method.POST)
    @Marshal(Marshaller.Jackson)
    public class ResolvePendingTBResultsAPI extends MutatingApiAction<ResolvePendingTBResultsForm> {
        @Override
        public Object execute(ResolvePendingTBResultsForm form, BindException errors) throws Exception {
            JSONObject json = new JSONObject();
            SimpleQueryFactory queryFactory = new SimpleQueryFactory(getUser(), getContainer());

            try (DbScope.Transaction transaction = DbSchema.get(WNPRC_ComplianceSchema.NAME).getScope().ensureTransaction()) {
                SimpleQueryUpdater pendingTbUpdater = new SimpleQueryUpdater(getUser(), getContainer(), WNPRC_ComplianceSchema.NAME, "pending_tb_clearances");
                SimpleQueryUpdater tbUpdater = new SimpleQueryUpdater(getUser(), getContainer(), WNPRC_ComplianceSchema.NAME, "tb_clearances");
                SimpleQueryUpdater tbMapUpdater = new SimpleQueryUpdater(getUser(), getContainer(), WNPRC_ComplianceSchema.NAME, "persons_tb_clearances");

                List<Map<String, Object>> pendingTBsToUpdate = new ArrayList<>();
                List<Map<String, Object>> tBsToUpdate = new ArrayList<>();
                List<Map<String, Object>> tbMapsToUpdate = new ArrayList<>();

                for (String pendingTBId : form.pendingTBIds) {
                    String tbClearanceId = UUID.randomUUID().toString().toUpperCase();

                    // Insert the new clearance
                    JSONObject tbClearance = new JSONObject();
                    tbClearance.put("id", tbClearanceId);
                    tbClearance.put("date", form.date);
                    tbClearance.put("comment", form.notes);
                    tbClearance.put("container", getContainer().getId());
                    tBsToUpdate.add(tbClearance);

                    // Update the pending clearance to point to the completed one.
                    JSONObject pendingTbClearance = new JSONObject();
                    pendingTbClearance.put("id", pendingTBId);
                    pendingTbClearance.put("tbclearance_id", tbClearanceId);
                    pendingTbClearance.put("container", getContainer().getId());
                    pendingTBsToUpdate.add(pendingTbClearance);

                    JSONObject[] rows = queryFactory.selectRows(WNPRC_ComplianceSchema.NAME, "persons_pending_tb_clearances", new SimplerFilter("clearance_id", CompareType.EQUAL, pendingTBId)).toJSONObjectArray();

                    JSONObject tbMap = new JSONObject();
                    tbMap.put("person_id", rows[0].getString("person_id"));
                    tbMap.put("clearance_id", tbClearanceId);
                    tbMap.put("container", getContainer().getId());
                    tbMapsToUpdate.add(tbMap);
                }

                tbUpdater.upsert(tBsToUpdate);
                pendingTbUpdater.upsert(pendingTBsToUpdate);
                tbMapUpdater.upsert(tbMapsToUpdate);

                json.put("success", true);

                transaction.commit();
            }

            return json;
        }
    }
}