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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.apache.commons.lang3.SerializationUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.BaseApiAction;
import org.labkey.api.action.Marshal;
import org.labkey.api.action.Marshaller;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.ReadOnlyApiAction;
import org.labkey.api.action.SimpleApiJsonForm;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.security.RequiresAnyOf;
import org.labkey.api.security.RequiresLogin;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.util.JsonUtil;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.cageui.action.BundledForms;
import org.labkey.cageui.action.CagesForm;
import org.labkey.cageui.action.RackTypesForm;
import org.labkey.cageui.action.RacksForm;
import org.labkey.cageui.model.Cage;
import org.labkey.cageui.model.Manufacturer;
import org.labkey.cageui.model.ModData;
import org.labkey.cageui.model.ModLocations;
import org.labkey.cageui.model.Rack;
import org.labkey.cageui.model.RackGroup;
import org.labkey.cageui.model.RackSwitchOption;
import org.labkey.cageui.model.RackTypes;
import org.labkey.cageui.model.Room;
import org.labkey.cageui.security.permissions.CageUILayoutEditorAccessPermission;
import org.labkey.cageui.security.permissions.CageUIRoomCreatorPermission;
import org.labkey.cageui.security.permissions.CageUITemplateCreatorPermission;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

public class CageUIController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(CageUIController.class);
    public static final String NAME = "cageui";

    public CageUIController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermission(ReadPermission.class)
    public class BeginAction extends SimpleViewAction
    {
        public ModelAndView getView(Object o, BindException errors)
        {
            return new JspView("/org/labkey/cageui/view/hello.jsp");
        }

        public void addNavTrail(NavTree root)
        {
        }
    }


    //APIS Here
    @RequiresAnyOf({CageUILayoutEditorAccessPermission.class, CageUIRoomCreatorPermission.class, CageUITemplateCreatorPermission.class})
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
                }else{
                    errors.reject(ERROR_MSG, "Missing rackSwitchOption.");
                }
                if(prevRack != null)
                {
                    setPrevRack(prevRack);
                }else{
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
            if(newRackType.getType() != getPrevRack().getType().getRackType().getNumericValue()){
                errors.reject(ERROR_MSG, "Racks have different types, cannot switch cages with pens, etc");
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
                if(newCagesForm.isEmpty()){
                    //Rack was created in the UI and no cages were added to it,
                    // if this is the case then we can assign new IDs to the cages and keep everything else.
                    String newObjId = UUID.randomUUID().toString().toUpperCase();
                    newRack.getCages().get(i).setObjectId(newObjId);
                    newRack.getCages().get(i).setSvgId(RackTypes.getSvgName(newRack.getType().getRackType()) + "_" + newObjId);
                }else{
                    if(newCagesForm.size() != getPrevRack().getCages().size()){
                        errors.reject(ERROR_MSG, "Racks have different number of cages");
                    }
                    Optional<CagesForm> foundCage = newCagesForm.stream()
                        .filter(cage -> cage.getPositionId() == posId)
                        .findFirst();

                    if (foundCage.isPresent()) {
                        CagesForm newCage = foundCage.get();
                        newRack.getCages().get(i).setObjectId(newCage.getObjectId());
                        newRack.getCages().get(i).setSvgId(RackTypes.getSvgName(newRack.getType().getRackType()) + "_" + newCage.getObjectId());
                    }else{
                        // If this error occurs something is happening with position id assignment client side
                        errors.reject(ERROR_MSG, "No Cage found for position " + posId);
                    }
                }
                if(wipeRackMods){
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
    @RequiresAnyOf({CageUILayoutEditorAccessPermission.class, CageUIRoomCreatorPermission.class, CageUITemplateCreatorPermission.class})
    public static class SaveLayoutHistoryAction extends MutatingApiAction<SimpleApiJsonForm>
    {

        private Room _room;
        private ArrayList<ModData> _roomDefaultMods;

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

            CageUIManager.RoomSubmissionService submissionService = new CageUIManager.RoomSubmissionService(
                getContainer(),
                getUser(),
                isTemplateSave,
                prevRoomName,
                getRoom(),
                getRoomDefaultMods()
            );
            BundledForms newSubmissionForms = submissionService.submitRoom();

            //return new ApiSimpleResponse();
            return CageUIManager.get().submitLayoutHistory(newSubmissionForms, getUser(), getContainer());
        }
    }
}
