/*
 * Copyright (c) 2013-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.ehr.history;

import org.apache.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.ehr.history.HistoryDataSource;
import org.labkey.api.ehr.history.HistoryRow;
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * User: bimber
 * Date: 2/17/13
 * Time: 3:39 PM
 */
public class ClinicalHistoryManager
{
    private static final ClinicalHistoryManager _instance = new ClinicalHistoryManager();

    private List<HistoryDataSource> _dataSources = new ArrayList<>();
    private Logger _log = Logger.getLogger(ClinicalHistoryManager.class);

    private ClinicalHistoryManager()
    {
        registerDataSource(new DefaultProblemListDataSource());
        registerDataSource(new DefaultProblemListCloseDataSource());

        registerDataSource(new DefaultCasesDataSource());
        registerDataSource(new DefaultCasesCloseDataSource());

        registerDataSource(new DefaultEncountersDataSource());

        registerDataSource(new DefaultClinicalRemarksDataSource());
        registerDataSource(new DefaultDrugsDataSource());
        registerDataSource(new DefaultObservationsDataSource());
        registerDataSource(new DefaultWeightDataSource());
        registerDataSource(new DefaultAssignmentDataSource());
        registerDataSource(new DefaultAssignmentEndDataSource());

        registerDataSource(new DefaultBirthDataSource());
        registerDataSource(new DefaultDeliveryDataSource());
        registerDataSource(new DefaultPregnanciesDataSource());

        registerDataSource(new DefaultBloodDrawDataSource());

        registerDataSource(new DefaultLabworkDataSource());

        registerDataSource(new DefaultDeathsDataSource());
        registerDataSource(new DefaultArrivalDataSource());
        registerDataSource(new DefaultDepartureDataSource());
        registerDataSource(new DefaultHousingDataSource());

        registerDataSource(new DefaultTreatmentOrdersDataSource());
        registerDataSource(new DefaultTreatmentEndDataSource());
        //R.Blasa   1-23-2015
        registerDataSource(new DefaultAnimalRecordFlagDataSource());

    }

    public static ClinicalHistoryManager get()
    {
        return _instance;
    }

    public void registerDataSource(HistoryDataSource dataSource)
    {
        _dataSources.add(dataSource);
    }

    public List<HistoryRow> getHistory(Container c, User u, String subjectId, Date minDate, Date maxDate, boolean redacted)
    {
        List<HistoryRow> rows = new ArrayList<>();

        for (HistoryDataSource ds : getDataSources(c, u))
        {
            List<HistoryRow> newRows = ds.getRows(c, u, subjectId, minDate, maxDate, redacted);
            if (newRows != null)
                rows.addAll(newRows);
        }

        sortRowsByDate(rows);

        return rows;
    }

    public Set<String> getTypes(Container c, User u)
    {
        Set<String> types = new HashSet<String>();

        for (HistoryDataSource ds : getDataSources(c, u))
        {
            types.addAll(ds.getAllowableCategoryGroups(c, u));
        }

        return types;
    }

    public List<HistoryRow> getHistory(Container c, User u, String subjectId, String caseId, boolean redacted)
    {
        List<HistoryRow> rows = new ArrayList<>();

        for (HistoryDataSource ds : getDataSources(c, u))
        {
            List<HistoryRow> newRows = ds.getRows(c, u, subjectId, caseId, redacted);
            if (newRows != null)
                rows.addAll(newRows);
        }

        sortRowsByDate(rows);

        return rows;
    }

    public void sortRowsByDate(List<HistoryRow> rows)
    {
        Collections.sort(rows, new Comparator<HistoryRow>()
        {
            @Override
            public int compare(HistoryRow o1, HistoryRow o2)
            {
                return (-1 * (o1.getSortDateString().compareTo(o2.getSortDateString())));
            }
        });
    }

    protected List<HistoryDataSource> getDataSources(Container c, User u)
    {
        Map<String, HistoryDataSource> sources = new LinkedHashMap<>();
        for (HistoryDataSource source : _dataSources)
        {
            if (source.isAvailable(c, u))
            {
                if (sources.containsKey(source.getName()))
                    _log.warn("There is an existing source with the name: " + source.getName());

                sources.put(source.getName(), source);
            }
        }

        return new ArrayList(sources.values());
    }
}
