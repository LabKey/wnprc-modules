package org.labkey.wnprc_ehr.data.ColonyCensus;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.Days;
import org.joda.time.LocalDate;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.query.FieldKey;
import org.labkey.api.security.User;
import org.labkey.api.util.ResultSetUtil;
import org.labkey.dbutils.api.SimpleQuery;
import org.labkey.webutils.api.json.ConvertibleToJSON;
import org.labkey.wnprc_ehr.QueryModels.wnprc.BillableAssignment;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by jon on 2/16/16.
 */
public class AssignmentPerDiems {
    final private Container _container;
    final private User _user;
    final private LocalDate _startDate;
    final private LocalDate _endDate;

    public AssignmentPerDiems(Container container, User user, LocalDate startDate, LocalDate endDate) {
        _startDate = startDate;
        _endDate = endDate;
        _container = container;
        _user = user;
    }

    private List<BillableAssignment> _assignments = null;
    public List<BillableAssignment> getAssignments() {
        if (_assignments == null) {
            SimpleQuery query = new SimpleQuery("study", "Billable Assignments", _user, _container);
            Results rs = null;

            try {
                SimpleFilter dateFilter = new SimpleFilter();
                dateFilter.addCondition(FieldKey.fromString("startDate"),  _endDate,  CompareType.DATE_LTE);
                dateFilter.addCondition(FieldKey.fromString( "endDate" ), _startDate, CompareType.DATE_GTE);

                rs = query.select(dateFilter);

                _assignments = new ArrayList<>();

                while (rs.next()) {
                    _assignments.add(new BillableAssignment(rs));
                }

            }
            //catch(SQLException e) {}
            catch(Exception e) {
                String x = e.getMessage(); // Line of code to allow breakpoint.
            }
            finally {
                ResultSetUtil.close(rs);
            }
        }

        return _assignments;
    }

    private Map<LocalDate, Map<String, List<BillableAssignment>>> _assignmentsPerAnimalPerDate = null;
    public Map<LocalDate, Map<String, List<BillableAssignment>>> assignmentsPerAnimalPerDate() {
        if ( _assignmentsPerAnimalPerDate == null ) {
            Map<String, List<BillableAssignment>> assignmentsPerAnimal = getListOfAssignmentsPerAnimal();
            Map<LocalDate, Map<String, List<BillableAssignment>>> countMap = new HashMap<>();

            for (LocalDate date = _startDate; !date.isAfter(_endDate); date = date.plusDays(1)) {
                Map<String, List<BillableAssignment>> assignmentsPerAnimalOnDay = new HashMap<>();

                for (String animalId : assignmentsPerAnimal.keySet()) {
                    List<BillableAssignment> assignments = assignmentsPerAnimalOnDay.get(animalId);

                    if (assignments == null) {
                        assignments = new ArrayList<>();
                        assignmentsPerAnimalOnDay.put(animalId, assignments);
                    }

                    for (BillableAssignment assignment : assignmentsPerAnimal.get(animalId)) {
                        if (!date.isAfter(assignment.getEndDate()) && !date.isBefore(assignment.getStartDate())) {
                            assignments.add(assignment);
                        }
                    }
                }

                countMap.put(date, assignmentsPerAnimalOnDay);
            }
            _assignmentsPerAnimalPerDate = countMap;
        }

        return _assignmentsPerAnimalPerDate;
    }

    private Map<String, List<BillableAssignment>> _listOfAssignmentsPerAnimal = null;
    public Map<String, List<BillableAssignment>> getListOfAssignmentsPerAnimal() {
        if ( _listOfAssignmentsPerAnimal == null ) {
            List<BillableAssignment> assignments = getAssignments();
            Map<String, List<BillableAssignment>> assignmentsPerAnimal = new HashMap<>();

            for (BillableAssignment assignment : assignments) {
                String animalId = assignment.getAnimalID();

                List<BillableAssignment> assignmentList = assignmentsPerAnimal.get(animalId);
                if (assignmentList == null) {
                    assignmentList = new ArrayList<>();
                    assignmentsPerAnimal.put(animalId, assignmentList);
                }

                assignmentList.add(assignment);
            }

            _listOfAssignmentsPerAnimal = assignmentsPerAnimal;
        }
        return _listOfAssignmentsPerAnimal;
    }

    private List<BillableDay> _billableDays = null;
    public List<BillableDay> getBillableDays() {
        if ( _billableDays == null ) {
            Map<String, List<BillableAssignment>> assignmentsPerAnimal = getListOfAssignmentsPerAnimal();
            Map<LocalDate, Map<String, List<BillableAssignment>>> assignmentCountsPerDay = assignmentsPerAnimalPerDate();
            List<BillableDay> billableSessions = new ArrayList<>();

            for(String animalId : assignmentsPerAnimal.keySet()) {
                List<BillableAssignment> assignments = assignmentsPerAnimal.get(animalId);

                for(LocalDate date : assignmentCountsPerDay.keySet()) {
                    for(BillableAssignment assignment : assignments) {
                        if (!assignment.getEndDate().isBefore(date) && !assignment.getStartDate().isAfter(date)) {
                            BillableDay billableInfo = new BillableDay(assignment.getAnimalID(), assignment.getProject(), date, date, assignmentsPerAnimalPerDate().get(date).get(animalId), assignment.getAccount());

                            billableSessions.add(billableInfo);
                        }
                    }
                }
            }

            _billableDays = billableSessions;
        }

        return _billableDays;
    }

    public JSONObject getBillableDaysJSON() {
        JSONObject json = new JSONObject();

        JSONObject countMapJSON = new JSONObject();
        Map<LocalDate, Map<String, List<BillableAssignment>>> countMap = assignmentsPerAnimalPerDate();
        for (LocalDate date : countMap.keySet()) {
            Map<String, List<BillableAssignment>> assignmentsOnDayPerAnimal = countMap.get(date);
            JSONObject animalCountsJSON = new JSONObject();

            for(String id : assignmentsOnDayPerAnimal.keySet()) {
                if (assignmentsOnDayPerAnimal.get(id).size() > 1) {
                    animalCountsJSON.put(id, assignmentsOnDayPerAnimal.get(id));
                }
            }

            countMapJSON.put(date.toString(), animalCountsJSON);
        }
        json.put("countMap", countMapJSON);

        JSONArray billableDaysJSON = new JSONArray();
        for( BillableDay billableDay : consolidateBillableDays(getBillableDays())) {
            billableDaysJSON.put(billableDay.toJSON());
        }
        json.put("billableDays", billableDaysJSON);

        return json;
    }

    static public List<BillableDay> consolidateBillableDays(List<BillableDay> originalBillableDays) {
        Integer originalSize = originalBillableDays.size();
        List<BillableDay> consolidatedBillableDays = new ArrayList<>();

        outerLoop:
        for (BillableDay originalBillableDay : originalBillableDays) {
            for (BillableDay consolidatedBillableDay : consolidatedBillableDays) {
                if (consolidatedBillableDay.consolidateWithOtherBillableDay(originalBillableDay)) {
                    continue outerLoop;
                }
            }

            consolidatedBillableDays.add(originalBillableDay);
        }

        Integer newSize = consolidatedBillableDays.size();

        if (newSize.equals(originalSize)) {
            return consolidatedBillableDays;
        }
        else {
            return AssignmentPerDiems.consolidateBillableDays(consolidatedBillableDays);
        }
    }

    public class BillableDay implements ConvertibleToJSON {
        private String _animalId;
        private String _project;
        private String _account;
        private LocalDate _startDate;
        private LocalDate _endDate;
        private List<BillableAssignment> _sharedProjects;

        public BillableDay(String animalId, String project, LocalDate startDate, LocalDate endDate, List<BillableAssignment> sharedProjects, String account) {
            _animalId       = animalId;
            _project        = project;
            _account        = account;
            _startDate      = startDate;
            _endDate        = endDate;
            _sharedProjects = sharedProjects;
        }

        public Integer getNumDays() {
            return Math.abs( Days.daysBetween(_startDate, _endDate).getDays() ) + 1;
        }

        public Boolean consolidateWithOtherBillableDay(BillableDay otherBillableDay) {
            if ( getAnimalId().equals(otherBillableDay.getAnimalId())
                    && getProject().equals(otherBillableDay.getProject())
                    && getSharedProjects().equals(otherBillableDay.getSharedProjects())
                    ) {

                if ( getStartDate().minusDays(1).equals( otherBillableDay.getEndDate() ) ) {
                    _startDate = otherBillableDay.getStartDate();
                    return true;
                }

                if ( getEndDate().plusDays(1).equals( otherBillableDay.getStartDate() )) {
                    _endDate = otherBillableDay.getEndDate();
                    return true;
                }
            }

            return false;
        }

        public String    getAnimalId()  { return _animalId;  }
        public String    getProject()   { return _project;   }
        public LocalDate getStartDate() { return _startDate; }
        public LocalDate getEndDate()   { return _endDate;   }

        public List<String> getSharedProjects() {
            List<String> projects = new ArrayList<>();

            for(BillableAssignment assignment : _sharedProjects) {
                projects.add(assignment.getProject());
            }

            return projects;
        }

        public float getPerDiems() {
            float perDiems = (float) getNumDays();

            if (getSharedProjects().size() > 1) {
                perDiems = perDiems / (float) getSharedProjects().size();
            }

            return perDiems;
        }

        public String[] csvHeaderLine = new String[] {
                "Project",
                "Account",
                "AnimalId",
                "Billable Days",
                "Start Date",
                "End Date",
                "All Projects In Duration",
                "Number of Shared Projects"
        };

        public String[] toCsvLine() {
            // Build a string representation of the shared projects.
            String sharedProjects = StringUtils.join(this.getSharedProjects(),';');

            List<String> csvFields = Arrays.asList(
                    this.getProject(),
                    this._account,
                    this.getAnimalId(),
                    Float.toString(this.getPerDiems()),
                    this.getStartDate().toString(),
                    this.getEndDate().toString(),
                    sharedProjects,
                    Integer.toString(this.getSharedProjects().size())
            );

            return csvFields.toArray(new String[csvFields.size()]);
        }

        @Override
        public JSONObject toJSON() {
            JSONObject json = new JSONObject();

            json.put("animalId",  getAnimalId());
            json.put("project",   getProject());
            json.put("account",   _account);
            json.put("startDate", getStartDate().toString());
            json.put("endDate",   getEndDate().toString());
            json.put("sharedProject", new JSONArray(getSharedProjects()));
            json.put("numDays",   getNumDays());
            json.put("perDiems",  getPerDiems());

            return json;
        }
    }
}
