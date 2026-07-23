/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.SimpleApiJsonForm;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.RequiresAnyOf;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.util.JsonUtil;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.cageui.action.AdoptionDataForm;
import org.labkey.cageui.action.BundledForms;
import org.labkey.cageui.action.CagesForm;
import org.labkey.cageui.action.HousingConditionRecordsForm;
import org.labkey.cageui.action.RackTypesForm;
import org.labkey.cageui.model.AdoptionData;
import org.labkey.cageui.model.AdoptionType;
import org.labkey.cageui.action.HousingForm;
import org.labkey.cageui.model.ConditionCode;
import org.labkey.cageui.model.ConditionType;
import org.labkey.cageui.model.HousingTransferData;
import org.labkey.cageui.model.Manufacturer;
import org.labkey.cageui.model.ModData;
import org.labkey.cageui.model.Option;
import org.labkey.cageui.model.Rack;
import org.labkey.cageui.model.RackCondition;
import org.labkey.cageui.model.RackSwitchOption;
import org.labkey.cageui.model.RackTypes;
import org.labkey.cageui.model.Room;
import org.labkey.cageui.model.SessionLog;
import org.labkey.cageui.security.permissions.CageUIAnimalEditorPermission;
import org.labkey.cageui.security.permissions.CageUILayoutEditorAccessPermission;
import org.labkey.cageui.security.permissions.CageUIRoomCreatorPermission;
import org.labkey.cageui.security.permissions.CageUIRoomModifierPermission;
import org.labkey.cageui.security.permissions.CageUITemplateCreatorPermission;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

public class CageUIController extends SpringActionController
{

    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(CageUIController.class);
    public static final String NAME = "cageui";

    public CageUIController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermission(ReadPermission.class)
    public static class BeginAction extends SimpleViewAction<Object>
    {

        @Override
        public ModelAndView getView(Object o, BindException errors)
        {
            //getPageConfig().setMetaTag("viewport", "width=device-width, initial-scale=1, viewport-fit=cover");
            return new JspView("/org/labkey/cageui/view/gen/home.html");
           // return ModuleHtmlView.get(ModuleLoader.getInstance().getModule("CageUI"), ModuleHtmlView.getGeneratedViewPath("home"));
        }

        @Override
        public void addNavTrail(NavTree root)
        {
        }
    }

    @RequiresPermission(CageUIAnimalEditorPermission.class)
    public static class SubmitAdoptionFormAction extends MutatingApiAction<SimpleApiJsonForm>
    {
        ArrayList<AdoptionData> _adoptionData;

        public ArrayList<AdoptionData>  getAdoptionData()
        {
            return _adoptionData;
        }

        public void setAdoptionData(ArrayList<AdoptionData>  adoptionData)
        {
            _adoptionData = adoptionData;
        }


        @Override
        public void validateForm(SimpleApiJsonForm form, Errors errors)
        {
            JSONObject json = form.getJsonObject();
            if (json == null)
            {
                errors.reject(ERROR_MSG, "Missing json parameter.");
                return;
            }

            JSONArray jsonTransferData = json.getJSONArray("adoptionData");
            ObjectMapper mapper = JsonUtil.createDefaultMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            try
            {
                TypeReference<ArrayList<AdoptionData>> typeRef = new TypeReference<ArrayList<AdoptionData>>()
                {
                };
                ArrayList<AdoptionData> adoptionDataList = mapper.readValue(jsonTransferData.toString(), typeRef);
                setAdoptionData(adoptionDataList);
            }catch (JsonProcessingException e)
            {
                errors.reject(ERROR_MSG, e.getMessage());
            }

            Map<String, List<AdoptionData>> dataById = getAdoptionData().stream()
                    .collect(Collectors.groupingBy(AdoptionData::getId));

            for (Map.Entry<String, List<AdoptionData>> entry : dataById.entrySet())
            {
                String id = entry.getKey();
                List<AdoptionData> newAdoptions = entry.getValue();
                newAdoptions.sort(Comparator.comparing(AdoptionData::getDate));

                List<AdoptionDataForm> existingAdoptions = CageUIManager.getAdoptionsForId(id, getUser(), getContainer());
                existingAdoptions.sort(Comparator.comparing(AdoptionDataForm::getDate));

                AdoptionDataForm lastAdoption = existingAdoptions.isEmpty() ? null : existingAdoptions.get(existingAdoptions.size() - 1);
                String expectedDam = lastAdoption != null ? lastAdoption.getDam() : null;

                for (AdoptionData newAdoption : newAdoptions)
                {
                    AdoptionType newType = AdoptionType.fromInt(newAdoption.getType().getValue());
                    AdoptionType lastType = lastAdoption != null ? AdoptionType.fromInt(lastAdoption.getType()) : null;

                    // Type validation
                    if (newType == AdoptionType.START)
                    {
                        if (lastType != null && lastType != AdoptionType.END)
                        {
                            errors.reject(ERROR_MSG, "Animal " + id + " already has an ongoing adoption. Must end previous adoption before starting a new one.");
                        }
                    }
                    else if (newType == AdoptionType.PAUSE)
                    {
                        if (lastType != AdoptionType.START && lastType != AdoptionType.RESUME)
                        {
                            errors.reject(ERROR_MSG, "Animal " + id + " can only be paused if it is currently started or resumed.");
                        }
                    }
                    else if (newType == AdoptionType.RESUME)
                    {
                        if (lastType != AdoptionType.PAUSE)
                        {
                            errors.reject(ERROR_MSG, "Animal " + id + " can only be resumed if it is currently paused.");
                        }
                    }
                    else if (newType == AdoptionType.END)
                    {
                        if (lastType == AdoptionType.END)
                        {
                            errors.reject(ERROR_MSG, "Animal " + id + " adoption has already ended.");
                        }
                    }

                    // Dam validation
                    if (expectedDam == null)
                    {
                        expectedDam = newAdoption.getDam();
                    }
                    else if (!expectedDam.equals(newAdoption.getDam()))
                    {
                        errors.reject(ERROR_MSG, "Dam ID for animal " + id + " must be consistent across adoptions. Expected: " + expectedDam + ", Found: " + newAdoption.getDam());
                    }

                    // Date validation
                    if (lastAdoption != null && !newAdoption.getDate().after(lastAdoption.getDate()))
                    {
                        errors.reject(ERROR_MSG, "Date for animal " + id + " must be after the previous adoption entry's date.");
                    }

                    // Update last adoption for next iteration
                    AdoptionDataForm currentAsForm = new AdoptionDataForm();
                    currentAsForm.setId(newAdoption.getId());
                    currentAsForm.setType(newAdoption.getType().getValue());
                    currentAsForm.setDate(newAdoption.getDate());
                    currentAsForm.setDam(newAdoption.getDam());
                    lastAdoption = currentAsForm;
                }
            }
        }

        @Override
        public Object execute(SimpleApiJsonForm form, BindException errors) throws Exception
        {
            BatchValidationException batchErrors = new BatchValidationException();
            ApiSimpleResponse response = new ApiSimpleResponse();
            UserSchema studySchema = QueryService.get().getUserSchema(getUser(), getContainer(), "study");
            ArrayList<AdoptionDataForm> finalForm = new ArrayList<AdoptionDataForm>();

            for(AdoptionData row : getAdoptionData()){
                AdoptionDataForm finalRow = new AdoptionDataForm();
                finalRow.setId(row.getId());
                finalRow.setDate(row.getDate());
                finalRow.setDam(row.getDam());
                finalRow.setType(row.getType().getValue());
                if(row.getResult() != null){
                    finalRow.setResult(row.getResult().getValue());
                }
                finalForm.add(finalRow);
            }

            TableInfo studyAdoptionsTable = studySchema.getTable("adoptions");
            QueryUpdateService studyAdoptionsQus = studyAdoptionsTable.getUpdateService();
            if (studyAdoptionsQus == null)
            {
                throw new IllegalStateException(studyAdoptionsTable.getName() + " query update service");
            }

            try (DbScope.Transaction tx = CageUISchema.getInstance().getSchema().getScope().ensureTransaction())
            {
                List<Map<String, Object>> adoptionMapList = CageUIManager.get().convertToMapList(finalForm);

                studyAdoptionsQus.insertRows(getUser(), getContainer(), adoptionMapList, batchErrors, null, null);

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
    }

    @RequiresPermission(CageUIAnimalEditorPermission.class)
    public static class PrepareHousingTransferAction extends MutatingApiAction<SimpleApiJsonForm>
    {
        ArrayList<HousingTransferData> _housingTransferData;

        public ArrayList<HousingTransferData>  getHousingTransferData()
        {
            return _housingTransferData;
        }

        public void setHousingTransferData(ArrayList<HousingTransferData>  housingTransferData)
        {
            _housingTransferData = housingTransferData;
        }

        public static String convertOptionArrayToString(Option<String>[] options) {
            if (options == null) {
                return "";
            }

            return Arrays.stream(options)
                    .map(option -> option != null ? option.getValue() : null)
                    .filter(Objects::nonNull)
                    .collect(Collectors.joining(","));
        }

        public static HousingConditionRecordsForm populateHousingConditionsStream(ConditionCode[] conditions) {
            HousingConditionRecordsForm form = new HousingConditionRecordsForm();

            // Group conditions by type
            Map<ConditionType, List<ConditionCode>> conditionsByType = Arrays.stream(conditions)
                    .filter(Objects::nonNull)
                    .collect(Collectors.groupingBy(ConditionCode::getType));

            // Set values using stream operations
            conditionsByType.forEach((type, conditionList) -> {
                if (conditionList.size() == 1) {
                    String value = conditionList.getFirst().getValue();
                    switch (type) {
                        case SPECIAL:
                            form.setSpecialCondition(value);
                            break;
                        case PAIR:
                            form.setPairCondition(value);
                            break;
                        case CAGE:
                            form.setCageCondition(value);
                            break;
                        case SOCIAL:
                            form.setSocialCondition(value);
                            break;
                    }
                }
            });

            return form;
        }



        @Override
        public void validateForm(SimpleApiJsonForm form, Errors errors)
        {
            JSONObject json = form.getJsonObject();
            if (json == null)
            {
                errors.reject(ERROR_MSG, "Missing json parameter.");
                return;
            }

            JSONArray jsonTransferData = json.getJSONArray("transferData");
            ObjectMapper mapper = JsonUtil.createDefaultMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            try
            {
                TypeReference<ArrayList<HousingTransferData>> typeRef = new TypeReference<ArrayList<HousingTransferData>>()
                {
                };
                ArrayList<HousingTransferData> transferDataList = mapper.readValue(jsonTransferData.toString(), typeRef);
                setHousingTransferData(transferDataList);
            }catch (JsonProcessingException e)
            {
                errors.reject(ERROR_MSG, e.getMessage());
            }

        }

        @Override
        public Object execute(SimpleApiJsonForm form, BindException errors) throws Exception
        {

            ArrayList<HousingForm> housingRecords = new ArrayList<HousingForm>();
            ArrayList<HousingConditionRecordsForm> housingConditionRecords = new ArrayList<HousingConditionRecordsForm>();
            BatchValidationException batchErrors = new BatchValidationException();
            ApiSimpleResponse response = new ApiSimpleResponse();
            String taskId = UUID.randomUUID().toString();

            for(HousingTransferData record : getHousingTransferData()){
                HousingForm newTransferRecord = new HousingForm();
                HousingConditionRecordsForm newConditionRecord = populateHousingConditionsStream(record.getCondition());
                String recordObjectId = UUID.randomUUID().toString();
                newConditionRecord.setObjectid(recordObjectId);

                newTransferRecord.setId(record.getId());
                newTransferRecord.setTaskId(taskId);
                newTransferRecord.setDate(record.getInDate());
                newTransferRecord.setEndDate(record.getOutDate());
                newTransferRecord.setQcState(1);
                newTransferRecord.setCondNew(recordObjectId);
                newTransferRecord.setReason(convertOptionArrayToString(record.getReasonForMove()));
                newTransferRecord.setRemark(record.getRemarks());
                newTransferRecord.setProject(record.getProject());
                newTransferRecord.setPerformedBy(record.getPerformedBy());
                newTransferRecord.setEjacConfirmed(record.isEjacConfirmed());

                if(record.getDestinationRoom().getValue() == 0){ // No change (animal stays same room and cage)
                    newTransferRecord.setRoom(record.getCurrentRoom().getLabel());
                    newTransferRecord.setCageNew(record.getCurrentCage().getValue());
                }else{
                    newTransferRecord.setRoom(record.getDestinationRoom().getLabel());
                    newTransferRecord.setCageNew(record.getDestinationCage().getValue());
                }
                housingRecords.add(newTransferRecord);
                housingConditionRecords.add(newConditionRecord);
            }

            UserSchema studySchema = QueryService.get().getUserSchema(getUser(), getContainer(), "study");
            UserSchema cageUISchema = QueryService.get().getUserSchema(getUser(), getContainer(), "cageui");

            TableInfo studyHousingTable = studySchema.getTable("housing_test");
            TableInfo cageUIHousingConditionTable = cageUISchema.getTable("housing_condition_records");

            QueryUpdateService studyHousingQus = studyHousingTable.getUpdateService();
            QueryUpdateService cageUIHousingConditionQus = cageUIHousingConditionTable.getUpdateService();

            if (studyHousingQus == null)
            {
                throw new IllegalStateException(studyHousingTable.getName() + " query update service");
            }

            if (cageUIHousingConditionQus == null)
            {
                throw new IllegalStateException(cageUIHousingConditionTable.getName() + " query update service");
            }

            try (DbScope.Transaction tx = CageUISchema.getInstance().getSchema().getScope().ensureTransaction())
            {
                List<Map<String, Object>> housingMapList = CageUIManager.get().convertToMapList(housingRecords);
                List<Map<String, Object>> housingCodesMapList = CageUIManager.get().convertToMapList(housingConditionRecords);

                studyHousingQus.insertRows(getUser(), getContainer(), housingMapList, batchErrors, null, null);
                cageUIHousingConditionQus.insertRows(getUser(), getContainer(), housingCodesMapList, batchErrors, null, null);

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
    }

    @RequiresPermission(CageUIRoomModifierPermission.class)
    public static class UpdateRackConditionStatusAction extends MutatingApiAction<SimpleApiJsonForm>
    {

        @Override
        public Object execute(SimpleApiJsonForm form, BindException errors) throws Exception
        {
            BatchValidationException batchErrors = new BatchValidationException();
            ApiSimpleResponse response = new ApiSimpleResponse();
            UserSchema cageUISchema = QueryService.get().getUserSchema(getUser(), getContainer(), "cageui");
            JSONObject json = form.getJsonObject();
            String rackObjId = json.getString("rack");
            int condition = json.getInt("condition");
            Map<String, Object> map = new HashMap<>();
            map.put("objectid", rackObjId);
            map.put("condition", condition);
            List<Map<String, Object>> updatedRack = new ArrayList<>();
            updatedRack.add(map);


            TableInfo racksTable = cageUISchema.getTable("racks");
            QueryUpdateService racksQus = racksTable.getUpdateService();
            if (racksQus == null)
            {
                throw new IllegalStateException(racksTable.getName() + " query update service");
            }
            try (DbScope.Transaction tx = CageUISchema.getInstance().getSchema().getScope().ensureTransaction())
            {
                if (rackObjId != null)
                {
                    racksQus.updateRows(getUser(), getContainer(), updatedRack, null, batchErrors, null, null);
                }
                if (batchErrors.hasErrors())
                {
                    response.put("success", false);
                    response.put("errors", batchErrors);
                    return response;
                }
                tx.commit();
                response.put("success", true);
            }catch (QueryUpdateServiceException | BatchValidationException | RuntimeException |
                    SQLException e)
            {
                throw new ValidationException(e.getMessage());
            }
            return response;
        }
    }


    //APIS Here
    @RequiresPermission(CageUIRoomModifierPermission.class)
    public static class CreateNewRoomFromRackChangeAction extends MutatingApiAction<SimpleApiJsonForm>
    {

        private Room _room;
        private RackSwitchOption _option;
        private Rack _prevRack;
        private Room _newRoom;
        private String _newRackSvgId;


        public String getNewRackSvgId()
        {
            return _newRackSvgId;
        }

        public void setNewRackSvgId(String newRackSvgId)
        {
            _newRackSvgId = newRackSvgId;
        }

        public Room getRoom()
        {
            return _room;
        }

        public void setRoom(Room room)
        {
            _room = room;
        }

        public Room getNewRoom()
        {
            return _newRoom;
        }

        public void setNewRoom(Room newRoom)
        {
            _newRoom = newRoom;
        }

        public RackSwitchOption getOption()
        {
            return _option;
        }

        public void setOption(RackSwitchOption option)
        {
            _option = option;
        }

        public Rack getPrevRack()
        {
            return _prevRack;
        }

        public void setPrevRack(Rack prevRack)
        {
            _prevRack = prevRack;
        }

        @Override
        public void validateForm(SimpleApiJsonForm form, Errors errors)
        {
            JSONObject json = form.getJsonObject();
            if (json == null)
            {
                errors.reject(ERROR_MSG, "Missing json parameter.");
            }

            JSONObject jsonRoom = json.getJSONObject("room");
            JSONObject jsonRackSwitchOption = json.getJSONObject("rackSwitchOption");
            JSONObject jsonRack = json.getJSONObject("prevRack");
            ObjectMapper mapper = JsonUtil.createDefaultMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            try
            {
                Room room = mapper.readValue(jsonRoom.toString(), mapper.getTypeFactory().constructType(Room.class));
                RackSwitchOption rackSwitchOption = mapper.readValue(jsonRackSwitchOption.toString(), mapper.getTypeFactory().constructType(RackSwitchOption.class));
                Rack prevRack = mapper.readValue(jsonRack.toString(), mapper.getTypeFactory().constructType(Rack.class));
                if (room != null)
                {
                    setRoom(room);
                }
                else
                {
                    errors.reject(ERROR_MSG, "Missing room parameter.");
                }
                if (rackSwitchOption != null)
                {
                    setOption(rackSwitchOption);
                }
                else
                {
                    errors.reject(ERROR_MSG, "Missing rackSwitchOption.");
                }
                if (prevRack != null)
                {
                    setPrevRack(prevRack);
                }
                else
                {
                    errors.reject(ERROR_MSG, "Missing prevRack.");
                }
            }
            catch (JsonProcessingException e)
            {
                errors.reject(ERROR_MSG, e.getMessage());
            }


            RackTypesForm newRackType = CageUIManager.getRackType(getOption().getValue().getTypeRowId());
            // Cages within new rack, ensure there is same number as in prev rack to be able to make a valid switch
            ArrayList<CagesForm> newCagesForm = CageUIManager.getCagesInRack(getOption().getValue().getObjectId());


            Manufacturer newManufacturer = CageUIManager.getRackManufacturer(newRackType.getManufacturer());
            if (newRackType.getType() != getPrevRack().getType().getRackType().getNumericValue())
            {
                // Ghost cages are exceptions to this rule
                if(newRackType.getType() != RackTypes.GHOSTCAGE.getNumericValue() && getPrevRack().getType().getRackType().getNumericValue() != RackTypes.GHOSTCAGE.getNumericValue()){
                    errors.reject(ERROR_MSG, "Racks have different types, cannot switch cages with pens, etc");
                }
            }
            Rack newRack = new Rack();
            Rack.UnitType newType = new Rack.UnitType(
                    newRackType.getRowid(),
                    newRackType.getDisplayName(),
                    RackTypes.fromNumericValue(newRackType.getType()),
                    false,
                    newRackType.getSize(),
                    newManufacturer,
                    newRackType.isStationary()
            );
            // wipe rack mods if the rack size or manufacturer changes.
            boolean wipeRackMods = !(newType.getManufacturer().getValue().equals(getPrevRack().getType().getManufacturer().getValue())
                    && Objects.equals(newType.getSize(), getPrevRack().getType().getSize()));

            newRack.setItemId(getOption().getValue().getRackId());
            newRack.setSvgId("rack_" + getOption().getValue().getObjectId());
            newRack.setObjectId(getOption().getValue().getObjectId());
            newRack.setSelectionType(getPrevRack().getSelectionType());
            newRack.setCages(getPrevRack().getCages());
            newRack.setType(newType);
            newRack.setX(getPrevRack().getX());
            newRack.setY(getPrevRack().getY());
            newRack.setIsNew(getPrevRack().getIsNew());
            newRack.setIsActive(getPrevRack().getIsActive());
            newRack.setExtraContext(getPrevRack().getExtraContext());
            setNewRackSvgId(newRack.getSvgId());

            // loop through cages and update their objectIds and svgIds, keep old cage data to ensure smooth swap, link by position id,
            // meaning the positionid=1 in both old and new rack should be the cage that is swapped.
            for (int i = 0; i < newRack.getCages().size(); i++)
            {
                int posId = newRack.getCages().get(i).getPositionId();
                if (newCagesForm.isEmpty())
                {
                    //Rack was created in the UI and no cages were added to it,
                    // if this is the case then we can assign new IDs to the cages and keep everything else.
                    String newObjId = UUID.randomUUID().toString().toUpperCase();
                    newRack.getCages().get(i).setObjectId(newObjId);
                    newRack.getCages().get(i).setSvgId(RackTypes.getSvgName(newRack.getType().getRackType()) + "_" + newObjId);
                }
                else
                {
                    if (newCagesForm.size() != getPrevRack().getCages().size())
                    {
                        errors.reject(ERROR_MSG, "Racks have different number of cages");
                    }
                    Optional<CagesForm> foundCage = newCagesForm.stream()
                            .filter(cage -> cage.getPositionId() == posId)
                            .findFirst();

                    if (foundCage.isPresent())
                    {
                        CagesForm newCage = foundCage.get();
                        newRack.getCages().get(i).setObjectId(newCage.getObjectId());
                        newRack.getCages().get(i).setSvgId(RackTypes.getSvgName(newRack.getType().getRackType()) + "_" + newCage.getObjectId());
                    }
                    else
                    {
                        // If this error occurs something is happening with position id assignment client side
                        errors.reject(ERROR_MSG, "No Cage found for position " + posId);
                    }
                }
                if (wipeRackMods)
                {
                    newRack.getCages().get(i).resetModsMap();
                }
            }

            setNewRoom(CageUIManager.createRoomWithReplacedRack(getRoom(), getPrevRack().getObjectId(), newRack));
        }

        @Override
        public Object execute(SimpleApiJsonForm form, BindException errors) throws Exception
        {
            ObjectMapper mapper = JsonUtil.createDefaultMapper();
            JSONObject newRoom = mapper.convertValue(getNewRoom(), JSONObject.class);
            //JSONObject newRoom = new JSONObject(getNewRoom());
            Map<String, Object> response = new HashMap<String, Object>();
            response.put("room", newRoom);
            response.put("rack", getNewRackSvgId());
            return new ApiSimpleResponse(response);
        }

    }


    // this api action saves the layout for a given room
    @RequiresAnyOf({CageUILayoutEditorAccessPermission.class, CageUIRoomCreatorPermission.class, CageUITemplateCreatorPermission.class, CageUIRoomModifierPermission.class})
    public static class SaveLayoutHistoryAction extends MutatingApiAction<SimpleApiJsonForm>
    {

        private Room _room;
        private ArrayList<ModData> _roomDefaultMods;
        private SessionLog _sessionLog;

        public Room getRoom()
        {
            return _room;
        }

        public void setRoom(Room room)
        {
            _room = room;
        }

        public ArrayList<ModData> getRoomDefaultMods()
        {
            return _roomDefaultMods;
        }

        public void setRoomDefaultMods(ArrayList<ModData> roomDefaultMods)
        {
            _roomDefaultMods = roomDefaultMods;
        }

        public SessionLog getSessionLog()
        {
            return _sessionLog;
        }

        public void setSessionLog(SessionLog sessionLog)
        {
            _sessionLog = sessionLog;
        }

        //todo add room name validation to prevent template saving without template in the name
        // todo add validation to prevent room from being save with default cages, and templates being saved with real cages.
        @Override
        public void validateForm(SimpleApiJsonForm form, Errors errors)
        {
            JSONObject json = form.getJsonObject();
            if (json == null)
            {
                errors.reject(ERROR_MSG, "Missing json parameter.");
                return;
            }
            JSONObject jsonRoom = json.getJSONObject("room");
            JSONArray jsonModsArray = json.getJSONArray("mods");
            JSONObject jsonSessionLog = json.getJSONObject("sessionLog");
            String prevRoomName = json.get("prevRoomName").toString();

            ObjectMapper mapper = JsonUtil.createDefaultMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            try {
                Room room = mapper.readValue(jsonRoom.toString(), mapper.getTypeFactory().constructType(Room.class));
                if (room != null){
                    setRoom(room);
                    boolean savingTemplate = room.getName().toLowerCase().contains("template");
                    boolean isDefaultSave = json.get("isDefault").toString().equals("true");
                    boolean isTemplateSave = savingTemplate || isDefaultSave;
                    // Reject if template room has real racks or if real room has default racks.
                    if(isTemplateSave){
                        boolean validTemplateRoom = room.getRackGroups().stream()
                            .allMatch(rg -> rg.getRacks().stream()
                                .allMatch(rack -> rack.getType().isDefault()));
                        if(!validTemplateRoom){
                            errors.reject(ERROR_MSG,"Cannot save template room with real racks. Please change to default racks.");
                        }
                    }else{
                        boolean validRealRoom = room.getRackGroups().stream()
                            .allMatch(rg -> rg.getRacks().stream()
                                .noneMatch(rack -> rack.getType().isDefault()));
                        if(!validRealRoom){
                            errors.reject(ERROR_MSG,"Cannot save real room with default racks. Please change to real racks.");
                        }
                    }
                }
                else {
                    errors.reject(ERROR_MSG, "Missing room parameter.");
                }
            }
            catch (JsonProcessingException e)
            {
                errors.reject(ERROR_MSG, e.getMessage());
            }

            try
            {
                TypeReference<ArrayList<ModData>> typeRef = new TypeReference<ArrayList<ModData>>()
                {
                };
                ArrayList<ModData> defaultMods = mapper.readValue(jsonModsArray.toString(), typeRef);
                if (defaultMods != null && !defaultMods.isEmpty())
                {
                    setRoomDefaultMods(defaultMods);
                }
            }
            catch (JsonProcessingException e)
            {
                errors.reject(ERROR_MSG, e.getMessage());
            }

            try
            {
                SessionLog sessionLog = mapper.readValue(jsonSessionLog.toString(), mapper.getTypeFactory().constructType(SessionLog.class));
                if (sessionLog != null)
                {
                    setSessionLog(sessionLog);
                }else {
                    errors.reject(ERROR_MSG, "Session log is corrupt");
                }
            }
            catch (JsonProcessingException e)
            {
                errors.reject(ERROR_MSG, e.getMessage());
            }

        }

        @Override
        public Object execute(SimpleApiJsonForm form, BindException errors) throws Exception
        {
            BatchValidationException batchErrors = new BatchValidationException();
            JSONObject json = form.getJsonObject();

            //List<Map<String, Object>> newLayoutHistoryData = JsonUtil.toMapList(json.getJSONArray("newRoomData"));

            boolean savingTemplate = getRoom().getName().toLowerCase().contains("template");
            String prevRoomName = json.get("prevRoomName").toString();
            boolean isDefaultSave = json.get("isDefault").toString().equals("true");
            boolean isTemplateSave = savingTemplate || isDefaultSave;
            RackCondition prevRackCondition = null;

            if (json.has("prevRackCondition") && json.get("prevRackCondition") != null) {
                JSONObject prevRackConditionJson = json.getJSONObject("prevRackCondition");
                prevRackCondition = new RackCondition(
                        prevRackConditionJson.getInt("value"),
                        prevRackConditionJson.getString("label")
                );
            }

            CageUIManager.RoomSubmissionService submissionService = new CageUIManager.RoomSubmissionService(
                getContainer(),
                getUser(),
                isTemplateSave,
                prevRoomName,
                getRoom(),
                getRoomDefaultMods(),
                prevRackCondition
            );
            BundledForms newSubmissionForms = submissionService.submitRoom();


            ApiSimpleResponse res = CageUIManager.get().submitLayoutHistory(newSubmissionForms, getUser(), getContainer());
            if(res.get("success").equals(true)){
                CageUIManager.finalizeSessionLog(getSessionLog(), true, newSubmissionForms.getNewAllHistoryForm().getHistoryId());

                CageUIManager.finalizeSessionLog(getSessionLog(), false);
            }else{
                CageUIManager.finalizeSessionLog(getSessionLog(), false);
            }
            CageUIManager.get().submitSessionLog(getSessionLog(), getUser(), getContainer());
            //return new ApiSimpleResponse();
            return res;
        }

    }
}
