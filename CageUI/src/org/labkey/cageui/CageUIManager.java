/*
 *
 *  * Copyright (c) 2025 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

package org.labkey.cageui;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.cache.Cache;
import org.labkey.api.cache.CacheManager;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;
import org.labkey.api.util.JsonUtil;
import org.labkey.cageui.action.AllHistoryForm;
import org.labkey.cageui.action.BundledForms;
import org.labkey.cageui.action.CageHistoryForm;
import org.labkey.cageui.action.CageModificationHistoryForm;
import org.labkey.cageui.action.CagesForm;
import org.labkey.cageui.action.CagesFormWithContext;
import org.labkey.cageui.action.LayoutHistoryForm;
import org.labkey.cageui.action.RackTypesForm;
import org.labkey.cageui.action.RacksForm;
import org.labkey.cageui.action.RoomHistoryForm;
import org.labkey.cageui.action.TemplateLayoutHistoryForm;
import org.labkey.cageui.model.Cage;
import org.labkey.cageui.model.ModData;
import org.labkey.cageui.model.ModTypes;
import org.labkey.cageui.model.Rack;
import org.labkey.cageui.model.RackGroup;
import org.labkey.cageui.model.Room;
import org.labkey.cageui.model.RoomObject;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Queue;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public class CageUIManager
{
    private static final CageUIManager _instance = new CageUIManager();

    private final Cache<String, Map<String, Map<String, Map<String, Object>>>> _cache;

    private CageUIManager()
    {
        // prevent external construction with a private default constructor
        _cache = CacheManager.getStringKeyCache(1000, CacheManager.UNLIMITED, "CageUICache");
    }

    public static CageUIManager get()
    {
        return _instance;
    }

    public Cache<String, Map<String, Map<String, Map<String, Object>>>> getCache()
    {
        return _cache;
    }

    // Helper function to wrap arraylist to labkeys List<Map<String, Object>> for data submission
    public <E> List<Map<String, Object>> convertToMapList(ArrayList<E> objects)
    {
        if (objects == null)
        {
            return new ArrayList<>();
        }

        try
        {
            ObjectMapper objectMapper = new ObjectMapper();
            List<Map<String, Object>> result = new ArrayList<>();

            for (E object : objects)
            {
                if (object != null)
                {
                    Map<String, Object> map = objectMapper.convertValue(object, new TypeReference<Map<String, Object>>()
                    {
                    });
                    result.add(map);
                }
                else
                {
                    result.add(null);
                }
            }

            return result;
        }
        catch (Exception e)
        {
            throw new RuntimeException("Error converting objects to map list", e);
        }
    }

    // Helper function to wrap class object to labkeys List<Map<String, Object>> for data submission
    public <E> List<Map<String, Object>> convertToMapList(E object)
    {
        if (object == null)
        {
            return Arrays.asList((Map<String, Object>) null);
        }

        try
        {
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> map = objectMapper.convertValue(object, new TypeReference<Map<String, Object>>()
            {
            });
            return Arrays.asList(map);
        }
        catch (Exception e)
        {
            throw new RuntimeException("Error converting object to map list", e);
        }
    }

    /*
        Helper function that takes the bundled forms and submits them to the appropriate tables

        @param newForms the bundled forms to submit
        @param user the user submitting the forms
        @param container the container the forms are being submitted in
        @return ApiSimpleResponse with success or failure
     */
    public ApiSimpleResponse submitLayoutHistory(BundledForms newForms, User user, Container container) throws Exception
    {
        BatchValidationException batchErrors = new BatchValidationException();
        ApiSimpleResponse response = new ApiSimpleResponse();
        UserSchema cageUISchema = QueryService.get().getUserSchema(user, container, "cageui");
        UserSchema ehrLookupsSchema = QueryService.get().getUserSchema(user, container, "ehr_lookups");
        Map<String, Object> extraContext = new HashMap<>();
        extraContext.put("history_id", newForms.getNewAllHistoryForm().getHistoryId());


        TableInfo ehrLookupsRoomsTable = ehrLookupsSchema.getTable("rooms");
        QueryUpdateService ehrLookupsRoomsQus = ehrLookupsRoomsTable.getUpdateService();
        if (ehrLookupsRoomsQus == null)
        {
            throw new IllegalStateException(ehrLookupsRoomsTable.getName() + " query update service");
        }

        TableInfo templateLayoutHistoryTable = cageUISchema.getTable("template_layout_history");
        QueryUpdateService templateQus = templateLayoutHistoryTable.getUpdateService();
        if (templateQus == null)
        {
            throw new IllegalStateException(templateLayoutHistoryTable.getName() + " query update service");
        }

        TableInfo allHistoryTable = cageUISchema.getTable("all_history");
        QueryUpdateService allHistoryQus = allHistoryTable.getUpdateService();
        if (allHistoryQus == null)
        {
            throw new IllegalStateException(allHistoryTable.getName() + " query update service");
        }

        TableInfo layoutHistoryTable = cageUISchema.getTable("layout_history");
        QueryUpdateService layoutHistoryQus = layoutHistoryTable.getUpdateService();
        if (layoutHistoryQus == null)
        {
            throw new IllegalStateException(layoutHistoryTable.getName() + " query update service");
        }

        TableInfo roomHistoryTable = cageUISchema.getTable("room_history");
        QueryUpdateService roomHistoryQus = roomHistoryTable.getUpdateService();
        if (roomHistoryQus == null)
        {
            throw new IllegalStateException(roomHistoryTable.getName() + " query update service");
        }

        TableInfo cageModHistoryTable = cageUISchema.getTable("cage_modifications_history");
        QueryUpdateService cageModHistoryQus = cageModHistoryTable.getUpdateService();
        if (cageModHistoryQus == null)
        {
            throw new IllegalStateException(cageModHistoryTable.getName() + " query update service");
        }

        TableInfo cageHistoryTable = cageUISchema.getTable("cage_history");
        QueryUpdateService cageHistoryQus = cageHistoryTable.getUpdateService();
        if (cageHistoryQus == null)
        {
            throw new IllegalStateException(cageHistoryTable.getName() + " query update service");
        }

        TableInfo cagesTable = cageUISchema.getTable("cages");
        QueryUpdateService cagesQus = cagesTable.getUpdateService();
        if (cagesQus == null)
        {
            throw new IllegalStateException(cagesTable.getName() + " query update service");
        }

        TableInfo racksTable = cageUISchema.getTable("racks");
        QueryUpdateService racksQus = racksTable.getUpdateService();
        if (racksQus == null)
        {
            throw new IllegalStateException(racksTable.getName() + " query update service");
        }

        try (DbScope.Transaction tx = CageUISchema.getInstance().getSchema().getScope().ensureTransaction())
        {


            if (newForms.getEhrRoomsForm() != null)
            {
                ehrLookupsRoomsQus.updateRows(user, container, Collections.singletonList(newForms.getEhrRoomsForm()), null, batchErrors, null, null);
            }

            if (newForms.getTemplateLayoutHistoryForm() != null)
            {
                templateQus.insertRows(user, container, convertToMapList(newForms.getTemplateLayoutHistoryForm()), batchErrors, null, null);
            }

            if (newForms.getNewAllHistoryForm() != null)
            {
                allHistoryQus.insertRows(user, container, convertToMapList(newForms.getNewAllHistoryForm()), batchErrors, null, null);
            }

            if (newForms.getPrevAllHistoryForm() != null)
            {
                allHistoryQus.updateRows(user, container, convertToMapList(newForms.getPrevAllHistoryForm()), null, batchErrors, null, null);
            }

            if (newForms.getLayoutHistoryForm() != null)
            {
                layoutHistoryQus.insertRows(user, container, convertToMapList(newForms.getLayoutHistoryForm()), batchErrors, null, null);
            }

            if (newForms.getRoomHistoryForm() != null)
            {
                roomHistoryQus.insertRows(user, container, convertToMapList(newForms.getRoomHistoryForm()), batchErrors, null, null);
            }

            if (newForms.getCageModificationHistoryForm() != null)
            {
                cageModHistoryQus.insertRows(user, container, convertToMapList(newForms.getCageModificationHistoryForm()), batchErrors, null, null);
            }

            if (newForms.getNewCagesForm() != null)
            {
                extraContext.put("cagesExtraContext", newForms.getNewCagesForm().getExtraContext());
                cagesQus.insertRows(user, container, convertToMapList(newForms.getNewCagesForm().getCagesForm()), batchErrors, null, extraContext);
            }

            if (newForms.getPrevCagesForm() != null)
            {
                extraContext.put("cagesExtraContext", newForms.getPrevCagesForm().getExtraContext());
                cagesQus.updateRows(user, container, convertToMapList(newForms.getPrevCagesForm().getCagesForm()), null, batchErrors, null, extraContext);
            }

            if (newForms.getNewRacksForm() != null)
            {
                racksQus.insertRows(user, container, convertToMapList(newForms.getNewRacksForm()), batchErrors, null, extraContext);
            }

            if (newForms.getPrevRacksForm() != null)
            {
                racksQus.updateRows(user, container, convertToMapList(newForms.getPrevRacksForm()), null, batchErrors, null, extraContext);
            }

            /*if (newForms.getCageHistoryForm() != null)
            {
                cageHistoryQus.insertRows(user, container, convertToMapList(newForms.getCageHistoryForm()), batchErrors, null, null);
            }*/

            if (batchErrors.hasErrors())
            {
                response.put("success", false);
                response.put("errors", batchErrors);
                return response;
            }
            tx.commit();
            response.put("success", true);
        }
        catch (QueryUpdateServiceException | BatchValidationException | DuplicateKeyException | RuntimeException |
               SQLException e)
        {
            throw new ValidationException(e.getMessage());
        }
        return response;
    }

    public static int findLastNumberAfterDash(String input)
    {
        if (input == null || input.isEmpty())
        {
            throw new IllegalArgumentException("Input string cannot be null or empty");
        }

        int lastDashIndex = input.lastIndexOf('-');

        if (lastDashIndex == -1)
        {
            throw new IllegalArgumentException("No '-' found in the string");
        }

        String afterLastDash = input.substring(lastDashIndex + 1);

        // Parse the entire number
        try
        {
            return Integer.parseInt(afterLastDash);
        }
        catch (NumberFormatException e)
        {
            throw new IllegalArgumentException("No valid number found after the last '-'");
        }
    }

    public static AllHistoryForm getAllHistory(String room)
    {
        TableInfo table = CageUISchema.getInstance().getAllHistoryTable();
        SimpleFilter filter = new SimpleFilter();
        filter.addCondition(FieldKey.fromString("room"), room, CompareType.EQUAL);
        filter.addCondition(FieldKey.fromString("end_date"), null, CompareType.ISBLANK);
        TableSelector selector = new TableSelector(table, filter, null);

        ObjectMapper mapper = JsonUtil.createDefaultMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        AllHistoryForm allHistory = mapper.convertValue(selector.getMap(), AllHistoryForm.class);
        return allHistory;
    }

    public static RackTypesForm getRackType(int rowid)
    {
        TableInfo table = CageUISchema.getInstance().getRackTypesTable();
        SimpleFilter filter = new SimpleFilter();
        filter.addCondition(FieldKey.fromString("rowid"), rowid, CompareType.EQUAL);
        TableSelector selector = new TableSelector(table, filter, null);

        ObjectMapper mapper = JsonUtil.createDefaultMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        RackTypesForm rackType = mapper.convertValue(selector.getMap(), RackTypesForm.class);
        return rackType;
    }

    public static CagesForm getCageForm(String cageObjectId)
    {
        TableInfo table = CageUISchema.getInstance().getCagesTable();
        SimpleFilter filter = new SimpleFilter();
        filter.addCondition(FieldKey.fromString("objectid"), cageObjectId, CompareType.EQUAL);
        TableSelector selector = new TableSelector(table, filter, null);

        ObjectMapper mapper = JsonUtil.createDefaultMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        CagesForm cage = mapper.convertValue(selector.getMap(), CagesForm.class);
        return cage;
    }

    public static RacksForm getRackForm(String rackObjId)
    {
        TableInfo table = CageUISchema.getInstance().getRacksTable();
        SimpleFilter filter = new SimpleFilter();
        filter.addCondition(FieldKey.fromString("objectid"), rackObjId, CompareType.EQUAL);
        TableSelector selector = new TableSelector(table, filter, null);

        ObjectMapper mapper = JsonUtil.createDefaultMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        RacksForm rack = mapper.convertValue(selector.getMap(), RacksForm.class);
        return rack;
    }


    // ends an all history row
    public static AllHistoryForm endPreviousAllHistory(String room, Date endDate)
    {
        AllHistoryForm allHistory = getAllHistory(room);
        if (allHistory == null) return null;
        allHistory.setEndDate(endDate);
        return allHistory;
    }

    // Sets up the new all history row to save, not including history ids
    public static AllHistoryForm startNewAllHistory(String room, boolean isDefault, Date startDate, String historyId)
    {
        AllHistoryForm allHistoryToStart = new AllHistoryForm();
        allHistoryToStart.setStartDate(startDate);
        allHistoryToStart.setRoom(room);
        allHistoryToStart.setHistoryId(historyId);
        if (isDefault)
        {
            allHistoryToStart.setValid(false);
            allHistoryToStart.setHistoryType("template");
        }
        else
        {
            allHistoryToStart.setHistoryType("real");
        }
        return allHistoryToStart;
    }

    public static class RoomSubmissionService
    {

        private final Container containerId;
        private final User userId;
        private final Room room;
        private final boolean isTemplate;
        private final String prevRoomName;
        private ArrayList<ModData> roomMods;
        private Map<String, Map<String, Double>> cageDims;


        public RoomSubmissionService(Container containerId, User userId, boolean isTemplate, String prevRoomName, Room room, ArrayList<ModData> roomMods)
        {
            this.containerId = containerId;
            this.userId = userId;
            this.room = room;
            this.isTemplate = isTemplate;
            this.prevRoomName = prevRoomName;
            this.roomMods = roomMods;
            this.cageDims = new HashMap<>();
        }

        private void getCageDims()
        {
            // First, build a map of all cages with their modifications
            Map<String, List<ModData>> cageModsMap = new HashMap<>();
            if (this.roomMods != null)
            {
                for (ModData mod : this.roomMods)
                {
                    cageModsMap.computeIfAbsent(mod.getCage(), k -> new ArrayList<>()).add(mod);
                }
            }

            // Find all connected components across racks
            Set<Set<String>> connectedComponents = findConnectedComponents(this.room, cageModsMap);

            // Process each connected component
            for (Set<String> component : connectedComponents)
            {
                // Find the first cage in this component (lowest position ID)
                String firstCageId = findFirstCageInComponent(component, this.room);

                // Calculate combined dimensions for the first cage
                CombinedDimensionsResult combinedResult = calculateComponentDimensions(component, this.room, cageModsMap, firstCageId);

                // Set dimensions for all cages in this component
                for (String cageId : component)
                {
                    Cage cage = findCageById(cageId, this.room);
                    if (cage != null)
                    {
                        double length = cageId.equals(firstCageId) ? combinedResult.length : 0;
                        double width = cageId.equals(firstCageId) ? combinedResult.width : 0;
                        double height = cageId.equals(firstCageId) ? combinedResult.height : 0;
                        double sqft = cageId.equals(firstCageId) ? combinedResult.sqft : 0;

                        this.cageDims.put(cage.getCageNum(), Map.ofEntries(
                                Map.entry("length", length),
                                Map.entry("width", width),
                                Map.entry("height", height),
                                Map.entry("sqft", sqft)
                        ));
                    }
                }
            }

            // Handle cages that are not part of any connected component (set to base dimensions)
            room.getRackGroups().forEach(rackGroup ->
                    rackGroup.getRacks().forEach(rack ->
                            rack.getCages().forEach(cage -> {
                                if (!this.cageDims.containsKey(cage.getCageNum()))
                                {
                                    RackTypesForm rackType = getRackType(rack.getType().getRowId());
                                    double baseLength = rackType.getLength();
                                    double baseWidth = rackType.getWidth();
                                    double baseHeight = rackType.getHeight();
                                    double baseSqft = (baseLength / 12) * (baseWidth / 12);

                                    this.cageDims.put(cage.getCageNum(), Map.ofEntries(
                                            Map.entry("length", baseLength),
                                            Map.entry("width", baseWidth),
                                            Map.entry("height", baseHeight),
                                            Map.entry("sqft", Math.round(baseSqft * 100.0) / 100.0)
                                    ));
                                }
                            })
                    )
            );
        }

        private Set<Set<String>> findConnectedComponents(Room room, Map<String, List<ModData>> cageModsMap)
        {
            Set<Set<String>> components = new HashSet<>();
            Set<String> visited = new HashSet<>();

            room.getRackGroups().forEach(rackGroup ->
                    rackGroup.getRacks().forEach(rack ->
                            rack.getCages().forEach(cage -> {
                                if (!visited.contains(cage.getObjectId()))
                                {
                                    Set<String> component = new HashSet<>();
                                    bfsFindComponent(cage.getObjectId(), room, cageModsMap, component, visited);
                                    if (!component.isEmpty())
                                    {
                                        components.add(component);
                                    }
                                }
                            })
                    )
            );

            return components;
        }

        private void bfsFindComponent(String startCageId, Room room, Map<String, List<ModData>> cageModsMap,
                                      Set<String> component, Set<String> visited)
        {
            Queue<String> queue = new LinkedList<>();
            queue.offer(startCageId);
            visited.add(startCageId);
            component.add(startCageId);

            while (!queue.isEmpty())
            {
                String currentCageId = queue.poll();
                List<ModData> currentMods = cageModsMap.getOrDefault(currentCageId, new ArrayList<>());

                // Find all connected cages based on modifications
                Set<String> connectedCages = findCagesConnectedTo(currentCageId, room, currentMods);

                for (String connectedCageId : connectedCages)
                {
                    if (!visited.contains(connectedCageId))
                    {
                        visited.add(connectedCageId);
                        component.add(connectedCageId);
                        queue.offer(connectedCageId);
                    }
                }
            }
        }

        private Set<String> findCagesConnectedTo(String cageId, Room room,
                                                 List<ModData> currentMods)
        {
            Set<String> connectedCages = new HashSet<>();
            Cage currentCage = findCageById(cageId, room);

            if (currentCage == null) return connectedCages;

            // Get all modifications that can create connections (NoDivider, CTunnel, NoFloor)
            List<ModData> connectionMods = currentMods.stream()
                    .filter(mod -> mod.getModification() == ModTypes.NoDivider ||
                            mod.getModification() == ModTypes.CTunnel ||
                            mod.getModification() == ModTypes.NoFloor)
                    .collect(Collectors.toList());

            // For each connection-modifying modification on this cage, find connected cages
            for (ModData mod : connectionMods)
            {
                // These mods are shared across cages via parentModId
                String parentModId = mod.getParentModId();
                Optional<ModData> adjModData;
                // If the current mod has a parentModId, find the corresponding adj cage via parentModId = adj cage modId
                if (parentModId != null && !parentModId.isEmpty())
                {
                    adjModData = this.roomMods.stream().filter(mod2 -> mod2.getModId() != null && mod2.getModId().equals(parentModId)).findFirst();
                }
                else
                {
                    // If the current mod does not have a parentModId, find the corresponding adj cage via parentModId = current cage modId
                    adjModData = this.roomMods.stream().filter(mod2 -> mod2.getParentModId() != null && mod2.getParentModId().equals(mod.getModId())).findFirst();
                }
                adjModData.ifPresent(modData -> connectedCages.add(modData.getCage()));
            }

            return connectedCages;
        }

        private String findFirstCageInComponent(Set<String> component, Room room)
        {
            String firstCageId = null;
            int minPositionId = Integer.MAX_VALUE;

            for (String cageId : component)
            {
                Cage cage = findCageById(cageId, room);
                if (cage != null && cage.getPositionId() < minPositionId)
                {
                    minPositionId = cage.getPositionId();
                    firstCageId = cageId;
                }
            }

            return firstCageId;
        }

        private Cage findCageById(String cageId, Room room)
        {
            for (RackGroup rackGroup : room.getRackGroups())
            {
                for (Rack rack : rackGroup.getRacks())
                {
                    for (Cage cage : rack.getCages())
                    {
                        if (cage.getObjectId().equals(cageId))
                        {
                            return cage;
                        }
                    }
                }
            }
            return null;
        }

        private CombinedDimensionsResult calculateComponentDimensions(Set<String> component, Room room,
                                                                      Map<String, List<ModData>> cageModsMap, String firstCageId)
        {
            double totalLength = 0;
            double totalWidth = 0;
            double totalHeight = 0;
            double totalSqft = 0;


            // Collect all cages in component with their mods
            List<Cage> cagesInComponent = component.stream()
                    .map(cageId -> findCageById(cageId, room))
                    .filter(Objects::nonNull)
                    .toList();

            // Calculate total dimensions
            for (Cage cage : cagesInComponent)
            {
                List<ModData> mods = cageModsMap.getOrDefault(cage.getObjectId(), new ArrayList<>());
                Rack rack = findRackByCageId(cage.getObjectId(), room);
                RackTypesForm rackType = getRackType(rack.getType().getRowId());


                // Initialize with base dimensions
                double baseLength = rackType.getLength();
                double baseWidth = rackType.getWidth();
                double baseHeight = rackType.getHeight();


                // Get base dimensions for this cage
                double cageLength = baseLength;
                double cageWidth = baseWidth;
                double cageHeight = baseHeight;

                // Apply extensions
                boolean hasExtension = mods.stream().anyMatch(mod -> mod.getModification().equals(ModTypes.Extension));
                if (hasExtension)
                {
                    totalSqft += 2;
                }

                // first cage in sequence should add its cage dimensions and ignore width + height + length modifiers between other cages
                if (firstCageId.equals(cage.getObjectId()))
                {
                    totalLength += cageLength;
                    totalWidth += cageWidth;
                    totalHeight += cageHeight;
                    continue;
                }

                // add other cages dimensions to the first cage total.
                boolean hasCTunnelOrNoDivider = mods.stream().anyMatch(mod -> mod.getModification().equals(ModTypes.CTunnel) || mod.getModification().equals(ModTypes.NoDivider));
                if (hasCTunnelOrNoDivider)
                {
                    totalWidth += cageWidth;
                }

                boolean hasNoFloor = mods.stream().anyMatch(mod -> mod.getModification().equals(ModTypes.NoFloor));
                if (hasNoFloor)
                {
                    totalHeight += cageHeight;
                }
            }
            // calculate square foot at the end after all cages in the group are scanned. we add to the sqft from extensions.
            totalSqft += (totalLength / 12) * (totalWidth / 12);

            return new CombinedDimensionsResult(
                    totalLength,
                    totalWidth,
                    totalHeight,
                    totalSqft
            );
        }

        private Rack findRackByCageId(String cageId, Room room)
        {
            for (RackGroup rackGroup : room.getRackGroups())
            {
                for (Rack rack : rackGroup.getRacks())
                {
                    for (Cage cage : rack.getCages())
                    {
                        if (cage.getObjectId().equals(cageId))
                        {
                            return rack;
                        }
                    }
                }
            }
            return null;
        }

        private static class CombinedDimensionsResult
        {
            double length, width, height, sqft;

            CombinedDimensionsResult(double length, double width, double height, double sqft)
            {
                this.length = length;
                this.width = width;
                this.height = height;
                this.sqft = sqft;
            }
        }


        public BundledForms submitRoom()
        {
            BundledForms bundledForms = new BundledForms();

            // Generate new history ID
            String historyId = UUID.randomUUID().toString().toUpperCase();
            Date newEndAndStartDate = new Date();

            // Handle room history
            submitRoomHistory(this.room, historyId, this.isTemplate, bundledForms, newEndAndStartDate);

            if (this.isTemplate)
            {
                // Handle template layout
                submitTemplateLayout(this.room, historyId, bundledForms);
            }
            else
            {
                // Handle real room
                getCageDims();
                submitRealRoom(this.room, historyId, bundledForms);
            }

            if (!this.room.getName().equals(prevRoomName) && this.isTemplate)
            {
                submitRoomNameChange(bundledForms);
            }

            return bundledForms;
        }

        private void submitRoomNameChange(BundledForms bundledForms)
        {
            UserSchema ehrLookupsSchema = QueryService.get().getUserSchema(this.userId, this.containerId, "ehr_lookups");

            TableInfo roomsTable = ehrLookupsSchema.getTable("rooms");
            SimpleFilter roomFilter = new SimpleFilter();
            roomFilter.addCondition(FieldKey.fromString("room"), this.prevRoomName, CompareType.EQUAL);
            TableSelector roomSelector = new TableSelector(roomsTable, roomFilter, null);
            Map<String, Object> result = roomSelector.getMap();

            result.put("room", this.room.getName());
            bundledForms.setEhrRoomsForm(result);
        }

        private void submitRoomHistory(Room room, String historyId, boolean isTemplate, BundledForms bundledForms, Date newEndAndStartDate)
        {

            // 1. get row in allHistory to end the current room.
            AllHistoryForm allHistoryToEnd = endPreviousAllHistory(room.getName(), newEndAndStartDate);

            // 2. Create new all history record
            AllHistoryForm allHistoryToStart = startNewAllHistory(room.getName(), isTemplate, newEndAndStartDate, historyId);
            bundledForms.setNewAllHistoryForm(allHistoryToStart);
            if (allHistoryToEnd != null)
            {
                bundledForms.setPrevAllHistoryForm(allHistoryToEnd);
            }

            // Create RoomHistoryForm
            RoomHistoryForm roomHistoryForm = new RoomHistoryForm();
            roomHistoryForm.setHistoryId(historyId);
            roomHistoryForm.setScale(room.getLayoutData().getScale());
            roomHistoryForm.setBorderWidth(room.getLayoutData().getBorderWidth());
            roomHistoryForm.setBorderHeight(room.getLayoutData().getBorderHeight());
            bundledForms.setRoomHistoryForm(roomHistoryForm);
        }

        private void submitTemplateLayout(Room room, String historyId, BundledForms bundledForms)
        {
            ArrayList<TemplateLayoutHistoryForm> templateForms = new ArrayList<>();

            // Process rack groups
            int rackGroupIndex = 0;
            for (RackGroup rackGroup : room.getRackGroups())
            {
                rackGroupIndex++;

                // Process racks in this group
                int rackIndex = 0;
                for (Rack rack : rackGroup.getRacks())
                {
                    rackIndex++;

                    // Process cages in this rack
                    if (rack.getCages() != null)
                    {
                        for (Cage cage : rack.getCages())
                        {
                            TemplateLayoutHistoryForm form = new TemplateLayoutHistoryForm();
                            form.setHistoryId(historyId);
                            form.setRackGroup(rackGroupIndex);
                            form.setGroupRotation(rackGroup.getRotation());
                            form.setRack(rackIndex);
                            form.setCage(findLastNumberAfterDash(cage.getCageNum()));
                            form.setObjectType(rack.getType().getRackType().getNumericValue()); // object_type is null for cages
                            form.setExtraContext(cage.getExtraContext() != null ?
                                    toJson(cage.getExtraContext()) : null);
                            form.setxCoord(rackGroup.getX() + rack.getX() + cage.getX());
                            form.setyCoord(rackGroup.getY() + rack.getY() + cage.getY());
                            templateForms.add(form);
                        }
                    }
                }
            }

            // Process room objects
            if (room.getObjects() != null)
            {
                for (RoomObject object : room.getObjects())
                {
                    TemplateLayoutHistoryForm form = new TemplateLayoutHistoryForm();
                    form.setHistoryId(historyId);
                    form.setRackGroup(null); // rack_group is null for objects
                    form.setRack(null); // rack is null for objects
                    form.setCage(null); // cage is null for objects
                    form.setObjectType(object.getType().ordinal()); // object_type
                    form.setExtraContext(object.getExtraContext() != null ?
                            toJson(object.getExtraContext()) : null);
                    form.setxCoord(object.getX());
                    form.setyCoord(object.getY());
                    templateForms.add(form);
                }
            }

            bundledForms.setTemplateLayoutHistoryForm(templateForms);
        }

        private void submitRealRoom(Room room, String historyId, BundledForms bundledForms)
        {
            // Handle cage history first
            //submitCageHistory(room, historyId, bundledForms);

            // Handle layout history
            ArrayList<LayoutHistoryForm> layoutForms = new ArrayList<>();
            ArrayList<RacksForm> racksFormList = new ArrayList<>();
            ArrayList<CagesForm> cagesFormList = new ArrayList<>();
            Map<String,Map<String, Object>> cagesExtraContextMap = new HashMap<>();
            ArrayList<RacksForm> prevRacksFormList = new ArrayList<>();
            ArrayList<CagesForm> prevCagesFormList = new ArrayList<>();
            Map<String,Map<String, Object>> prevCagesExtraContextMap = new HashMap<>();
            CagesFormWithContext cagesFormWithContext = new CagesFormWithContext();
            CagesFormWithContext prevCagesFormWithContext = new CagesFormWithContext();


            // Process rack groups
            for (RackGroup rackGroup : room.getRackGroups())
            {
                // Process racks in this group
                for (Rack rack : rackGroup.getRacks())
                {
                    // Check if this is a new real rack that needs to be added to racks table
                    if (rack.getIsNew() && !rack.getType().isDefault())
                    {
                        // This is a new real rack - add to racks table
                        RacksForm racksForm = new RacksForm();
                        racksForm.setRackId(rack.getItemId());
                        racksForm.setRackType(rack.getType().getRowId());
                        racksForm.setRoom(room.getName());
                        racksForm.setObjectId(UUID.randomUUID().toString().toUpperCase());

                        racksFormList.add(racksForm);

                        // Get cage dimensions from rack_types table
                        RackTypesForm rackType = getRackType(rack.getType().getRowId());
                        if (rackType != null && rack.getCages() != null)
                        {
                            // Add cages to cages table
                            for (Cage cage : rack.getCages())
                            {
                                CagesForm cagesForm = new CagesForm();
                                Map<String, Object> extraContextMap = new HashMap<>();

                                Map<String, Double> cageDims = this.cageDims.get(cage.getCageNum());
                                cagesForm.setCageNumber(findLastNumberAfterDash(cage.getCageNum()));
                                cagesForm.setRack(racksForm.getObjectId());
                                cagesForm.setObjectId(cage.getObjectId());
                                cagesForm.setPositionId(cage.getPositionId());
                                cagesForm.setLength(cageDims.get("length"));
                                cagesForm.setWidth(cageDims.get("width"));
                                cagesForm.setHeight(cageDims.get("height"));
                                cagesForm.setSqft(cageDims.get("sqft"));

                                extraContextMap.put("groupRotation", rackGroup.getRotation());
                                extraContextMap.put("rackGroup", rackGroup.getGroupId());

                                cagesFormList.add(cagesForm);
                                cagesExtraContextMap.put(cage.getObjectId(),extraContextMap);
                            }
                        }
                    }
                    else if (!rack.getIsNew() && !rack.getType().isDefault())
                    {
                        // This is an existing real rack that needs to be updated
                        // Fetch previous rack data
                        RacksForm prevRacksForm = getRackForm(rack.getObjectId());
                        prevRacksForm.setRoom(room.getName());

                        // Add to previous racks forms list
                        prevRacksFormList.add(prevRacksForm);

                        // Get cage dimensions from rack_types table for existing rack
                        RackTypesForm rackType = getRackType(rack.getType().getRowId());
                        if (rackType != null && rack.getCages() != null)
                        {
                            // Update existing cages with new data
                            for (Cage cage : rack.getCages())
                            {
                                Map<String, Object> extraContextMap = new HashMap<>();
                                CagesForm prevCagesForm = getCageForm(cage.getObjectId());
                                Map<String, Double> cageDims = this.cageDims.get(cage.getCageNum());

                                prevCagesForm.setCageNumber(findLastNumberAfterDash(cage.getCageNum()));
                                prevCagesForm.setHeight(cageDims.get("height"));
                                prevCagesForm.setWidth(cageDims.get("width"));
                                prevCagesForm.setLength(cageDims.get("length"));
                                prevCagesForm.setSqft(cageDims.get("sqft"));

                                extraContextMap.put("groupRotation", rackGroup.getRotation());
                                extraContextMap.put("rackGroup", rackGroup.getGroupId());
                                prevCagesExtraContextMap.put(cage.getObjectId(),extraContextMap);
                                prevCagesFormList.add(prevCagesForm);
                            }
                        }
                    }
                }
            }

            // Process cages in this rack for layout history
            for (RackGroup rackGroup : room.getRackGroups())
            {
                for (Rack rack : rackGroup.getRacks())
                {
                    if (rack.getCages() != null)
                    {
                        for (Cage cage : rack.getCages())
                        {
                            LayoutHistoryForm form = new LayoutHistoryForm();
                            form.setHistoryId(historyId);
                            form.setCage(cage.getObjectId()); // cage ID
                            form.setObjectType(rack.getType().getRackType().getNumericValue()); // object_type is null for cages
                            form.setExtraContext(cage.getExtraContext() != null ?
                                    toJson(cage.getExtraContext()) : null);
                            form.setxCoord(rackGroup.getX() + rack.getX() + cage.getX());
                            form.setyCoord(rackGroup.getY() + rack.getY() + cage.getY());
                            layoutForms.add(form);
                        }
                    }
                }
            }

            // Process room objects
            if (room.getObjects() != null)
            {
                for (RoomObject object : room.getObjects())
                {
                    LayoutHistoryForm form = new LayoutHistoryForm();
                    form.setHistoryId(historyId);
                    form.setCage(null); // cage is null for objects
                    form.setObjectType(object.getType().getNumericValue()); // object_type
                    form.setExtraContext(object.getExtraContext() != null ?
                            toJson(object.getExtraContext()) : null);
                    form.setxCoord(object.getX());
                    form.setyCoord(object.getY());

                    layoutForms.add(form);
                }
            }
            cagesFormWithContext.setCagesForm(cagesFormList);
            cagesFormWithContext.setExtraContext(cagesExtraContextMap);
            prevCagesFormWithContext.setCagesForm(prevCagesFormList);
            prevCagesFormWithContext.setExtraContext(prevCagesExtraContextMap);

            bundledForms.setNewRacksForm(racksFormList);
            bundledForms.setNewCagesForm(cagesFormWithContext);
            bundledForms.setPrevRacksForm(prevRacksFormList);
            bundledForms.setPrevCagesForm(prevCagesFormWithContext);
            bundledForms.setLayoutHistoryForm(layoutForms);

            // Handle cage modifications history
            submitCageModificationsHistory(room, historyId, bundledForms);
        }


        private void submitCageHistory(Room room, String historyId, BundledForms bundledForms)
        {
            ArrayList<CageHistoryForm> cageForms = new ArrayList<>();

            for (RackGroup rackGroup : room.getRackGroups())
            {

                for (Rack rack : rackGroup.getRacks())
                {
                    RackTypesForm rackType = CageUIManager.get().getRackType(rack.getType().getRowId());

                    if (rack.getCages() != null)
                    {
                        for (Cage cage : rack.getCages())
                        {

                            CageHistoryForm form = new CageHistoryForm();
                            Map<String, Double> cageDims = this.cageDims.get(cage.getCageNum());
                            form.setHistoryId(historyId);
                            form.setRackGroup(findLastNumberAfterDash(rackGroup.getGroupId()));
                            form.setGroupRotation(rackGroup.getRotation());
                            form.setCage(cage.getObjectId());
                            form.setCageNumber(findLastNumberAfterDash(cage.getCageNum()));

                            form.setLength(cageDims.get("length"));
                            form.setWidth(cageDims.get("width"));
                            form.setHeight(cageDims.get("height"));
                            form.setSqft(cageDims.get("sqft"));

                            cageForms.add(form);
                        }
                    }
                }
            }

            bundledForms.setCageHistoryForm(cageForms);
        }

        private void submitCageModificationsHistory(Room room, String historyId, BundledForms bundledForms)
        {
            ArrayList<CageModificationHistoryForm> cageModForms = new ArrayList<>();

            for (RackGroup rackGroup : room.getRackGroups())
            {
                for (Rack rack : rackGroup.getRacks())
                {
                    if (rack.getCages() != null)
                    {
                        for (Cage cage : rack.getCages())
                        {
                            List<ModData> cageMod = new ArrayList<>();
                            if (this.roomMods != null)
                            {
                                cageMod = this.roomMods.stream()
                                        .filter(mod ->
                                                mod.getCage().equals(cage.getObjectId())
                                                        && mod.getRack().equals(rack.getObjectId()))
                                        .toList();
                            }

                            if (!cageMod.isEmpty())
                            {
                                cageMod.forEach(mod -> {
                                    CageModificationHistoryForm newModHistoryRow = new CageModificationHistoryForm();
                                    newModHistoryRow.setHistoryId(historyId);
                                    newModHistoryRow.setModId(mod.getModId());
                                    newModHistoryRow.setParentModId(mod.getParentModId());
                                    newModHistoryRow.setModification(mod.getModification().toString());
                                    newModHistoryRow.setLocation(mod.getLocation().toInt());
                                    newModHistoryRow.setSubId(mod.getSubId());
                                    newModHistoryRow.setCage(cage.getObjectId());
                                    // Add data to cage modifications history
                                    cageModForms.add(newModHistoryRow);
                                });
                            }
                        }
                    }
                }
            }

            bundledForms.setCageModificationHistoryForm(cageModForms);
        }

        private String toJson(Map<String, Object> map)
        {
            try
            {
                ObjectMapper mapper = new ObjectMapper();
                return mapper.writeValueAsString(map);
            }
            catch (Exception e)
            {
                throw new RuntimeException("Failed to convert map to JSON", e);
            }
        }
    }

}