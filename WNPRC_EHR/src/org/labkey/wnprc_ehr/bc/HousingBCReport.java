/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
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
package org.labkey.wnprc_ehr.bc;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.json.JSONObject;
import org.labkey.api.collections.CaseInsensitiveMapWrapper;
import org.labkey.api.data.Container;
import org.labkey.api.data.ExcelWriter;
import org.labkey.api.util.JsonUtil;
import org.labkey.dbutils.api.SimpleQueryFactory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by jon on 1/6/17.
 */
public class HousingBCReport extends BusinessContinuityExcelReport {
    public HousingBCReport(Container container) {
        super(container);
    }

    @Override
    public String getBaseName() {
        return "Current Housing";
    }

    @Override
    public void populateWorkbook() {
        SimpleQueryFactory queryFactory = new SimpleQueryFactory(user, container);
        List<JSONObject> housings = JsonUtil.toJSONObjectList(queryFactory.selectRows("wnprc", "BCHousing"));

        List<String> columns = Arrays.asList("Id", "Medical","viralStatus", "Weight" , "Room", "Cage", "Condition", "Remark");

        Map<String, List<CaseInsensitiveMapWrapper>> areas = new HashMap<>();
        for (JSONObject housing : housings) {
            CaseInsensitiveMapWrapper caseInsensitiveMap = new CaseInsensitiveMapWrapper<Object>(housing.toMap());
            String area = (String) caseInsensitiveMap.get("Area");

            // There really shouldn't be any null areas
            if (area != null) {
                List<CaseInsensitiveMapWrapper> housingAssignmentsInArea = areas.get(area);
                if (housingAssignmentsInArea == null) {
                    housingAssignmentsInArea = new ArrayList<>();
                    areas.put(area, housingAssignmentsInArea);
                }

                housingAssignmentsInArea.add(caseInsensitiveMap);
            }
        }

        for (String area : areas.keySet()) {
            Sheet sheet = workbook.createSheet(ExcelWriter.cleanSheetName(area));

            Map<String, Map<String, List<CaseInsensitiveMapWrapper>>> allRoomsInArea = new HashMap<>();

            // Organize the assignments
            for (CaseInsensitiveMapWrapper housingAssignment : areas.get(area)) {
                String cageName = (String) housingAssignment.get("cage");
                String roomName = (String) housingAssignment.get("room");

                Map<String, List<CaseInsensitiveMapWrapper>> cageMap = allRoomsInArea.get(roomName);
                if (cageMap == null) {
                    cageMap = new HashMap<>();
                    allRoomsInArea.put(roomName, cageMap);
                }

                List<CaseInsensitiveMapWrapper> assignmentsInCage = cageMap.get(cageName);
                if (assignmentsInCage == null) {
                    assignmentsInCage = new ArrayList<>();
                    cageMap.put(cageName, assignmentsInCage);
                }

                assignmentsInCage.add(housingAssignment);
            }

            int rowNumber = 0;

            // Write out header row
            Row headerRow = sheet.createRow(rowNumber);
            for (int colNumber = 0; colNumber < columns.size(); colNumber++) {
                Cell cell = headerRow.createCell(colNumber);

                cell.setCellValue(columns.get(colNumber));
            }

            List<String> roomsInOrder = new ArrayList<>();
            roomsInOrder.addAll(allRoomsInArea.keySet());
            Collections.sort(roomsInOrder);

            for (String roomName : roomsInOrder) {
                List<String> cagesInOrder = new ArrayList<>();
                cagesInOrder.addAll(allRoomsInArea.get(roomName).keySet());
                Collections.sort(cagesInOrder);

                for (String cageName : cagesInOrder) {
                    for (CaseInsensitiveMapWrapper housingAssignment : allRoomsInArea.get(roomName).get(cageName)) {
                        // Create the next row
                        rowNumber += 1;
                        Row row = sheet.createRow(rowNumber);

                        for (int colNumber = 0; colNumber < columns.size(); colNumber++) {
                            Cell cell = row.createCell(colNumber);
                            String colName = columns.get(colNumber);

                            cell.setCellValue(housingAssignment.get(colName) != null ? housingAssignment.get(colName).toString() : "");
                        }
                    }
                }
            }
        }
    }
}
